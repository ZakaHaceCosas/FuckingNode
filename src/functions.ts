import { APP_NAME, I_LIKE_JS, VERSION } from "./constants.ts";
import {
    type GITHUB_RELEASE,
    type RIGHT_NOW_DATE,
    RIGHT_NOW_DATE_REGEX,
    type SemVer,
    type SUPPORTED_EMOJIS,
    type UPDATE_FILE,
} from "./types.ts";

/**
 * Logs a message to the standard output and saves it to a `.log` file.
 *
 * @export
 * @async
 * @param {string} message The message to be logged.
 * @param {?SUPPORTED_EMOJIS} [emoji] Additionally, add an emoji before the log.
 * @param {?boolean} [silent] Optional. If true, log will be made without saving to the `.log` file.
 * @returns {Promise<void>}
 */
export async function LogStuff(
    message: string,
    emoji?: SUPPORTED_EMOJIS,
    silent?: boolean,
): Promise<void> {
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

/**
 * Returns file paths for all config files the app uses.
 *
 * @export
 * @param {("BASE" | "MOTHERFKRS" | "LOGS" | "UPDATES")} path What path you want.
 * @returns {string} The path as a string.
 */
export function GetPath(
    path: "BASE" | "MOTHERFKRS" | "LOGS" | "UPDATES",
): string {
    const appDataPath = Deno.env.get("APPDATA");
    if (!appDataPath) {
        console.error(
            `${I_LIKE_JS.MFN} APPDATA variable not found. Something seriously went ${I_LIKE_JS.MFLY} wrong.`,
        );
        Deno.exit(1);
    }

    // i don't know how to remove the f-word from here, i can't just put an asterisk in a file path
    const BASE_DIR = `${appDataPath}/${APP_NAME}/`;
    const MOTHERFKRS_DIR = `${BASE_DIR}/${APP_NAME}-motherfuckers.txt`;
    const LOGS_DIR = `${BASE_DIR}/${APP_NAME}-Logs.log`;
    const UPDATES_DIR = `${BASE_DIR}/${APP_NAME}-updates.txt`;

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

/**
 * Check if config files are present, create them otherwise ("Fresh Setup").
 *
 * @export
 * @async
 * @returns {Promise<void>}
 */
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
        await LogStuff(`Some ${I_LIKE_JS.MFN} error happened trying to setup config files: ${error}`, "error");
        Deno.exit(1);
    }
}

/**
 * Appends an emoji at the beginning of a message.
 *
 * @export
 * @param {string} message Your message, e.g. `"hi chat"`.
 * @param {SUPPORTED_EMOJIS} emoji What emoji you'd like to append, e.g. `"bruh"`.
 * @returns {string} The message with your emoji, e.g. `"😐 hi chat"`.
 */
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

/**
 * Gets the current date (at the moment the function is called) and returns it as a `RIGHT_NOW_DATE`.
 *
 * @export
 * @returns {RIGHT_NOW_DATE}
 */
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

/**
 * Takes a `RIGHT_NOW_DATE` and turns it into a JS `Date()` so code can interact with it.
 *
 * @param {RIGHT_NOW_DATE} dateString
 * @returns {Date}
 */
function MakeDateNowCompatibleWithJavaScriptsDate(
    dateString: RIGHT_NOW_DATE,
): Date {
    if (!RIGHT_NOW_DATE_REGEX.test(dateString)) throw new TypeError("Provided dateString doesn't match RIGHT_NOW_DATE Regular Expression.");

    const [datePart, timePart] = dateString.split(" ");

    if (!datePart) throw new Error("undefined datePart");
    if (!timePart) throw new Error("undefined timePart");

    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);

    if (!year) throw new Error("undefined year");
    if (!month) throw new Error("undefined month");

    return new Date(year, month - 1, day, hours, minutes);
}

// made by chatgpt i'll be honest
/**
 * Compares two SemVer versions. Returns the difference between both, so if `versionB` is more recent than `versionA` you'll get a positive number, or you'll get 0 if they're equal.
 *
 * @param {string} versionA 1st version to compare.
 * @param {string} versionB 2nd version to compare.
 * @returns {number} The difference.
 */
function CompareSemver(versionA: string, versionB: string): number {
    const [majorA = 0, minorA = 0, patchA = 0] = versionA.split(".").map(Number);
    const [majorB = 0, minorB = 0, patchB = 0] = versionB.split(".").map(Number);

    if (isNaN(majorA) || isNaN(minorA) || isNaN(patchA)) throw new Error("Invalid version format in " + versionA);
    if (isNaN(majorB) || isNaN(minorB) || isNaN(patchB)) throw new Error("Invalid version format in " + versionB);

    if (majorA !== majorB) return majorA - majorB;
    if (minorA !== minorB) return minorA - minorB;
    return patchA - patchB;
}

/**
 * Checks for updates (in case it needs to do so).
 *
 * @export
 * @async
 * @returns {Promise<void>}
 */
export async function CheckForUpdates(): Promise<void> {
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

/**
 * Gets all the users projects and returns their paths as a `string[]`.
 *
 * @export
 * @async
 * @returns {Promise<string[]>}
 */
export async function GetMotherfuckers(): Promise<string[]> {
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

/**
 * Gets the size in MBs of a DIR.
 *
 * @export
 * @async
 * @param {string} path Path to the directory.
 * @returns {Promise<number>}
 */
export async function GetDirSize(path: string): Promise<number> {
    let totalSize: number = 0;

    if (!(await Deno.stat(path)).isDirectory) throw new Error("Provided path doesn't point to a directory.");

    for await (const entry of Deno.readDir(path)) {
        const fullPath = `${path}/${entry.name}`;
        const fileInfo = await Deno.stat(fullPath);
        totalSize += fileInfo.size; // increases the size
    }

    return parseFloat((totalSize / (1024 * 1024)).toFixed(3)); // (returns in MB)
}
