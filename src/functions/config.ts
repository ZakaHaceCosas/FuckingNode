import { APP_NAME, I_LIKE_JS } from "../constants.ts";
import { CheckForPath, JoinPaths } from "./filesystem.ts";
import { LogStuff } from "./io.ts";

/**
 * Returns file paths for all config files the app uses.
 *
 * @export
 * @param {("BASE" | "MOTHERFKRS" | "LOGS" | "UPDATES")} path What path you want.
 * @returns {string} The path as a string.
 */
export async function GetAppPath(
    path: "BASE" | "MOTHERFKRS" | "LOGS" | "UPDATES",
): Promise<string> {
    const appDataPath = Deno.env.get("APPDATA");
    if (!appDataPath) {
        console.error(
            `${I_LIKE_JS.MFN} APPDATA variable not found. Something seriously went ${I_LIKE_JS.MFLY} wrong.`,
        );
        Deno.exit(1);
    }

    const BASE_DIR = await JoinPaths(appDataPath, APP_NAME.CLI);
    const PROJECTS = await JoinPaths(BASE_DIR, `${APP_NAME.CLI}-${I_LIKE_JS.MFS.toLowerCase().replace("*", "o").replace("*", "u")}.txt`);
    const LOGS = await JoinPaths(BASE_DIR, `${APP_NAME.CLI}-logs.log`);
    const UPDATES = await JoinPaths(BASE_DIR, `${APP_NAME.CLI}-updates.json`);

    switch (path) {
        case "BASE":
            return BASE_DIR;
        case "MOTHERFKRS":
            return PROJECTS;
        case "LOGS":
            return LOGS;
        case "UPDATES":
            return UPDATES;
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
        const basePath = await GetAppPath("BASE");
        if (!(await CheckForPath(basePath))) {
            await Deno.mkdir(basePath, { recursive: true });
        }

        const projectPath = await GetAppPath("MOTHERFKRS");
        if (!(await CheckForPath(projectPath))) {
            await Deno.writeTextFile(projectPath, "");
        }

        const logsPath = await GetAppPath("LOGS");
        if (!(await CheckForPath(logsPath))) {
            await Deno.writeTextFile(logsPath, "");
        }
    } catch (error) {
        await LogStuff(`Some ${I_LIKE_JS.MFN} error happened trying to setup config files: ${error}`, "error");
        Deno.exit(1);
    }
}
