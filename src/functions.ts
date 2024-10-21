import { APP_NAME, I_LIKE_JS, RELEASE_URL, VERSION } from "./constants.ts";
import {
    type GITHUB_RELEASE,
    type RIGHT_NOW_DATE,
    RIGHT_NOW_DATE_REGEX,
    type SemVer,
    type SUPPORTED_EMOJIS,
    type UPDATE_FILE,
} from "./types.ts";

/**
 * Returns `true` if a given path exists, `false` if otherwise.
 *
 * @export
 * @async
 * @param {string} path Path to check for
 * @returns {Promise<boolean>}
 */
export async function CheckForPath(path: string): Promise<boolean> {
    try {
        await Deno.stat(path);
        return true;
    } catch {
        return false;
    }
}

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
    const BASE_DIR = `${appDataPath}/${APP_NAME.CASED}/`;
    const MOTHERFKRS_DIR = `${BASE_DIR}/${APP_NAME.CASED}-motherfuckers.txt`;
    const LOGS_DIR = `${BASE_DIR}/${APP_NAME.CASED}-Logs.log`;
    const UPDATES_DIR = `${BASE_DIR}/${APP_NAME.CASED}-updates.txt`;

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

        if (!(await CheckForPath(GetPath("MOTHERFKRS")))) {
            await Deno.writeTextFile(GetPath("MOTHERFKRS"), "");
        }

        if (!(await CheckForPath(GetPath("LOGS")))) {
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
 * @param {RIGHT_NOW_DATE} date The date string you want to make standard.
 * @returns {Date}
 */
function MakeRightNowDateStandard(
    date: RIGHT_NOW_DATE,
): Date {
    if (!RIGHT_NOW_DATE_REGEX.test(date)) throw new TypeError("Provided dateString doesn't match RIGHT_NOW_DATE Regular Expression.");

    const [datePart, timePart] = date.split(" ");

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
 * Checks for updates (in case it needs to do so). If you want to force it to check for updates, pass `true` as the 1st argument. Otherwise, pass false or no argument at all.
 *
 * @export
 * @returns {Promise<void>}
 */
export async function CheckForUpdates(force?: boolean): Promise<void> {
    const tellAboutUpdate = async (newVer: SemVer) => {
        await LogStuff(
            `There's a new version! ${newVer}. Consider downloading it from GitHub. You're on ${VERSION}, btw.`,
            "bulb",
        );
    };

    async function Update() {
        try {
            const response = await fetch(
                RELEASE_URL,
                {
                    headers: {
                        Accept: "application/vnd.github.v3+json",
                    },
                },
            );

            if (!response.ok) {
                if (response.status === 403) return; // (github has a rate limit, so this is not an error we should be really aware of)
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const content: GITHUB_RELEASE = await response.json();

            const isUpToDate = CompareSemver(content.tag_name, VERSION) <= 0;
            if (!isUpToDate) await tellAboutUpdate(content.tag_name);

            if (force) await LogStuff(`You're up to date! (v${VERSION})`, "tick-clear");

            const dataToWrite: UPDATE_FILE = {
                isUpToDate: isUpToDate,
                lastVer: content.tag_name,
                lastCheck: GetDateNow(),
            };
            await Deno.writeTextFile(GetPath("UPDATES"), JSON.stringify(dataToWrite)); // if it checks successfully, it doesn't check again until 5 days later, so no waste of net resources.
        } catch (e) {
            throw new Error("Error checking for updates: " + e);
        }
    }

    async function VerifyItNeedsToUpdate(): Promise<boolean> {
        let needsToWait: boolean = true;

        if (!(await CheckForPath(GetPath("UPDATES")))) {
            const dataToWrite: UPDATE_FILE = {
                isUpToDate: true,
                lastVer: VERSION,
                lastCheck: GetDateNow(),
            };

            await Deno.writeTextFile(GetPath("UPDATES"), JSON.stringify(dataToWrite));
            needsToWait = false;
        }

        const updateFile: UPDATE_FILE = JSON.parse(await Deno.readTextFile(GetPath("UPDATES")));
        if (!RIGHT_NOW_DATE_REGEX.test(updateFile.lastCheck)) {
            throw new Error(
                "Unable to parse date of last update. Got " + updateFile.lastCheck + ".",
            );
        }

        if (!updateFile.isUpToDate) {
            await tellAboutUpdate(updateFile.lastVer);
            return true;
        }

        let needsToCheck = true;

        if (needsToWait) {
            const currentCompatibleDate = MakeRightNowDateStandard(
                GetDateNow(),
            );
            const lastCompatibleDate = MakeRightNowDateStandard(updateFile.lastCheck);

            if (!(currentCompatibleDate > lastCompatibleDate)) return false; // no need to update

            // 5 days
            const differenceInMilliseconds = currentCompatibleDate.getTime() - lastCompatibleDate.getTime();

            // actually 5 days and not 5 days in milliseconds
            const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

            needsToCheck = differenceInDays >= 5;
        }

        return needsToCheck;
    }

    if (force) {
        Update();
        return;
    } else {
        if (!(await VerifyItNeedsToUpdate())) return;
        Update();
        return;
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
 * Gets the size in MBs of a DIR. Will return null if an error happens.
 *
 * @export
 * @async
 * @param {string} path Path to the directory.
 * @returns {Promise<number | null>}
 */
export async function GetDirSize(path: string): Promise<number | null> {
    let totalSize: number = 0;

    if (!(await CheckForPath(path))) {
        return null;
    }

    for await (const entry of Deno.readDir(path)) {
        const fullPath = `${path}/${entry.name}`;
        const fileSize = (await Deno.stat(fullPath)).size;
        totalSize += fileSize; // increases the size
    }

    return parseFloat((totalSize / (1024 * 1024)).toFixed(3)); // (returns in MB)
}

/**
 * Parses a string with either a single path (list) or a lot of paths (cleaner), to ensure string cleanness.
 *
 * @export
 * @param {("list" | "cleaner")} idea What kind of parsing you'd like
 * @param {string} target The string to parse.
 * @returns {(string | string[])} Either a string or a string[].
 */
export function ParsePath(idea: "list" | "cleaner", target: string): string | string[] {
    if (idea === "cleaner") {
        return target.split("\n")
            .map((line) => line.trim().replace(/,$/, ""))
            .filter((line) => line.length > 0);
    } else if (idea === "list") {
        const cleanEntry = target.trimEnd().trimStart();
        if (cleanEntry.endsWith("/") || cleanEntry.endsWith("\\")) {
            return cleanEntry.trimEnd().trimStart().slice(0, -1);
        }

        return cleanEntry;
    } else {
        throw new Error("Invalid idea.");
    }
}
