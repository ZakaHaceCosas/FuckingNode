import { VERSION } from "./constants.ts";
import { type GITHUB_RELEASE, type RIGHT_NOW_DATE, RIGHT_NOW_DATE_REGEX, type SUPPORTED_EMOJIS } from "./types.ts";


// function to log messages
export async function LogStuff(
    message: string,
    emoji?: SUPPORTED_EMOJIS,
    silent?: boolean,
) {
    const finalMessage = emoji ? Emojify(message, emoji) : message;
    console.log(finalMessage);

    try {
        const logged = `${finalMessage} ... @ ${new Date().toLocaleString()}` + "\n";

        if (!silent) {
            await Deno.writeTextFile(GetPath("LOGS"), logged, {
                append: true,
            });
        }
    } catch (e) {
        console.error(`Error logging stuff: ${e}`);
    }
}

// get path (a constant if you think abt it)
export function GetPath(
    path: "BASE" | "MOTHERFUCKERS" | "LOGS" | "LAST_UPDATE",
): string {
    const appDataPath = Deno.env.get("APPDATA");
    if (!appDataPath) {
        console.error(
            "Motherfucking APPDATA variable not found. Something seriously went motherfucking wrong.",
        );
        Deno.exit(1);
    }

    const BASE_DIR = `${appDataPath}/FuckingNode/`;
    const MOTHERFUCKERS_DIR = `${BASE_DIR}/fuckingNode-motherfuckers.txt`;
    const LOGS_DIR = `${BASE_DIR}/fuckingNode-Logs.log`;
    const LAST_UPDATE_DIR = `${BASE_DIR}/fuckingNode-LastUpdate.txt`;

    switch (path) {
        case "BASE":
            return BASE_DIR;
        case "MOTHERFUCKERS":
            return MOTHERFUCKERS_DIR;
        case "LOGS":
            return LOGS_DIR;
        case "LAST_UPDATE":
            return LAST_UPDATE_DIR;
        default:
            throw new Error("Invalid path requested");
    }
}

// create files if they don't exist (fresh setup)
export async function FreshSetup(): Promise<void> {
    try {
        await Deno.mkdir(GetPath("BASE"), { recursive: true });

        try {
            await Deno.stat(GetPath("MOTHERFUCKERS"));
        } catch {
            await Deno.writeTextFile(GetPath("MOTHERFUCKERS"), "");
        }

        try {
            await Deno.stat(GetPath("LOGS"));
        } catch {
            await Deno.writeTextFile(GetPath("LOGS"), "");
        }
    } catch (error) {
        console.error(`Error with FreshSetup: ${error}`);
        Deno.exit(1);
    }
}

// emojis
export function Emojify(message: string, emoji: SUPPORTED_EMOJIS): string {
    switch (emoji) {
        case "danger":
            return `🛑 ${message}`;
        case "prohibited":
            return `⛔ ${message}`;
        case "wip":
            return `🚧 ${message}`;
        case "what":
            return `❓ ${message}`;
        case "bulb":
            return `💡 ${message}`;
        case "tick":
            return `✅ ${message}`;
        case "tick-clear":
            return `✔ ${message}`;
        case "error":
            return `❌ ${message}`;
        case "warn":
            return `⚠️ ${message}`;
        case "heads-up":
            return `🚨 ${message}`;
        case "working":
            return `🔄 ${message}`;
        case "moon-face":
            return `🌚 ${message}`;
        case "bruh":
            return `😐 ${message}`;
        case "package":
            return `📦 ${message}`;
        case "trash":
            return `🗑 ${message}`;
        case "chart":
            return `📊 ${message}`;
        default:
            return message;
    }
}

export function GetDateNow(): RIGHT_NOW_DATE {
    const now = new Date();

    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");

    const formattedDate: RIGHT_NOW_DATE = `${year}-${month}-${day} ${hours}:${minutes}`;
    return formattedDate;
}

function MakeDateNowCompatibleWithJavaScriptsDate(
    dateString: RIGHT_NOW_DATE,
): Date {
    const [datePart, timePart] = dateString.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);

    return new Date(year, month - 1, day, hours, minutes);
}

// made by chatgpt i'll be honest
function CompareSemver(versionA: string, versionB: string): number {
    const [majorA, minorA, patchA] = versionA.split(".").map(Number);
    const [majorB, minorB, patchB] = versionB.split(".").map(Number);

    if (majorA !== majorB) return majorA - majorB;
    if (minorA !== minorB) return minorA - minorB;
    return patchA - patchB;
}

export async function CheckForUpdates() {
    try {
        await Deno.stat(GetPath("LAST_UPDATE"));
    } catch {
        Deno.writeTextFile(GetPath("LAST_UPDATE"), GetDateNow());
    }
    console.log(GetPath("LAST_UPDATE"));
    const lastCheckContent = await Deno.readTextFile(GetPath("LAST_UPDATE"));
    const lastCheck: RIGHT_NOW_DATE = lastCheckContent as RIGHT_NOW_DATE;
    if (!RIGHT_NOW_DATE_REGEX.test(lastCheck)) {
        throw new Error(
            "Unable to parse date of last update. Got " + lastCheck + ".",
        );
    }

    const currentCompatibleDate = MakeDateNowCompatibleWithJavaScriptsDate(
        GetDateNow(),
    );
    const lastCompatibleDate = MakeDateNowCompatibleWithJavaScriptsDate(lastCheck);

    if (!(currentCompatibleDate > lastCompatibleDate)) return; // no need to update

    // 7 days
    const differenceInMilliseconds = currentCompatibleDate.getTime() - lastCompatibleDate.getTime();

    // actually 7 days and not 7 days in milliseconds
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

    const needsToCheck = differenceInDays > 7;

    if (!needsToCheck) return; // no need to update

    try {
        const response = await fetch(
            "https://api.github.com/repos/ZakaHaceCosas/FuckingNode/releases/latest",
            {
                headers: {
                    Accept: "application/vnd.github.v3+json",
                },
            },
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const content: GITHUB_RELEASE = await response.json();

        Deno.writeTextFile(GetPath("LAST_UPDATE"), GetDateNow()); // if it checks successfully, it doesn't check again until 7 days later, so no waste of net resources.

        if (CompareSemver(content.tag_name, VERSION) === 0) {
            return;
        } // we're up to date

        await LogStuff(
            "There's a new version! " + content.tag_name + ". Consider updating from the GitHub repo.",
            "bulb",
        );
    } catch (e) {
        throw new Error("Error checking for updates: " + e);
    }
}
