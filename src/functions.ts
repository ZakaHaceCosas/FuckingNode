// VOCAB CLEANUP STATUS
// TEXT - CLEAN / VARS - NOT CLEAN

import { iLikeJs, VERSION } from "./constants.ts";
import {
    type GITHUB_RELEASE,
    type RIGHT_NOW_DATE,
    RIGHT_NOW_DATE_REGEX,
    type SemVer,
    type SUPPORTED_EMOJIS,
    type UPDATE_FILE,
} from "./types.ts";

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
    path: "BASE" | "MOTHERFKRS" | "LOGS" | "UPDATES",
): string {
    const appDataPath = Deno.env.get("APPDATA");
    if (!appDataPath) {
        console.error(
            `${iLikeJs.mfn} APPDATA variable not found. Something seriously went ${iLikeJs.mfly} wrong.`,
        );
        Deno.exit(1);
    }

    // i don't know how to remove the f-word from here, i can't just put an asterisk in a file path
    const BASE_DIR = `${appDataPath}/FuckingNode/`;
    const MOTHERFKRS_DIR = `${BASE_DIR}/fuckingNode-motherfuckers.txt`;
    const LOGS_DIR = `${BASE_DIR}/fuckingNode-Logs.log`;
    const UPDATES_DIR = `${BASE_DIR}/fuckingNode-updates.txt`;

    switch (path) {
        case "BASE":
            return BASE_DIR;
        case "MOTHERFKRS":
            return MOTHERFKRS_DIR;
        case "LOGS":
            return LOGS_DIR;
        case "UPDATES":
            return UPDATES_DIR;
        default:
            throw new Error("Invalid path requested");
    }
}

// create files if they don't exist (fresh setup)
export async function FreshSetup(): Promise<void> {
    try {
        await Deno.mkdir(GetPath("BASE"), { recursive: true });

        try {
            await Deno.stat(GetPath("MOTHERFKRS"));
        } catch {
            await Deno.writeTextFile(GetPath("MOTHERFKRS"), "");
        }

        try {
            await Deno.stat(GetPath("LOGS"));
        } catch {
            await Deno.writeTextFile(GetPath("LOGS"), "");
        }
    } catch (error) {
        await LogStuff(`Some ${iLikeJs.mfn} error happened trying to setup config files: ${error}`, "error");
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
    const [majorA = 0, minorA = 0, patchA = 0] = versionA.split(".").map(Number);
    const [majorB = 0, minorB = 0, patchB = 0] = versionB.split(".").map(Number);

    if (isNaN(majorA) || isNaN(minorA) || isNaN(patchA)) throw new Error("Invalid version format in " + versionA);
    if (isNaN(majorB) || isNaN(minorB) || isNaN(patchB)) throw new Error("Invalid version format in " + versionB);

    if (majorA !== majorB) return majorA - majorB;
    if (minorA !== minorB) return minorA - minorB;
    return patchA - patchB;
}

// check for updates
export async function CheckForUpdates() {
    let needsToWait: boolean = true;
    const tellAboutUpdate = async (newVer: SemVer) => {
        await LogStuff(
            `There's a new version! ${newVer}. Consider downloading it from GitHub. You're on ${VERSION}, btw.`,
            "bulb",
        );
    };

    try {
        await Deno.stat(GetPath("UPDATES"));
    } catch {
        const dataToWrite: UPDATE_FILE = {
            isUpToDate: true,
            lastVer: VERSION,
            lastCheck: GetDateNow(),
        };

        await Deno.writeTextFile(GetPath("UPDATES"), JSON.stringify(dataToWrite));
        needsToWait = false;
    }

    const updateFileContent = await Deno.readTextFile(GetPath("UPDATES"));
    const updateFile: UPDATE_FILE = JSON.parse(updateFileContent);
    if (!RIGHT_NOW_DATE_REGEX.test(updateFile.lastCheck)) {
        throw new Error(
            "Unable to parse date of last update. Got " + updateFile.lastCheck + ".",
        );
    }

    if (!updateFile.isUpToDate) {
        await tellAboutUpdate(updateFile.lastVer);
    }

    let needsToCheck = true;

    if (needsToWait) {
        const currentCompatibleDate = MakeDateNowCompatibleWithJavaScriptsDate(
            GetDateNow(),
        );
        const lastCompatibleDate = MakeDateNowCompatibleWithJavaScriptsDate(updateFile.lastCheck);

        if (!(currentCompatibleDate > lastCompatibleDate)) return; // no need to update

        // 7 days
        const differenceInMilliseconds = currentCompatibleDate.getTime() - lastCompatibleDate.getTime();

        // actually 7 days and not 7 days in milliseconds
        const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

        needsToCheck = differenceInDays >= 7;
    }

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

        const isUpToDate = CompareSemver(content.tag_name, VERSION) === 0;

        const dataToWrite: UPDATE_FILE = {
            isUpToDate: isUpToDate,
            lastVer: content.tag_name,
            lastCheck: GetDateNow(),
        };
        await Deno.writeTextFile(GetPath("UPDATES"), JSON.stringify(dataToWrite)); // if it checks successfully, it doesn't check again until 7 days later, so no waste of net resources.

        if (!isUpToDate) {
            await tellAboutUpdate(content.tag_name);
        } // we're up to date
    } catch (e) {
        throw new Error("Error checking for updates: " + e);
    }
}

// read file content
export async function GetMotherfuckers() {
    try {
        const content = await Deno.readTextFile(GetPath("MOTHERFKRS"));
        return content.split("\n").filter(Boolean);
    } catch (error) {
        await LogStuff(
            `Failed to read the file: ${GetPath("MOTHERFKRS")} - ${error}`,
            "error",
        );
        Deno.exit(1);
    }
}

export async function GetDirSize(path: string): Promise<number> {
    let totalSize: number = 0;

    for await (const entry of Deno.readDir(path)) {
        const fullPath = `${path}/${entry.name}`;
        if (entry.isDirectory) {
            totalSize += await GetDirSize(fullPath); // recursively calls itself
        } else {
            const fileInfo = await Deno.stat(fullPath);
            totalSize += fileInfo.size; // increases the size
        }
    }

    return parseFloat((totalSize / (1024 * 1024)).toFixed(3));
}
