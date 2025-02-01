import { APP_NAME, DEFAULT_SCHEDULE_FILE, DEFAULT_SETTINGS, I_LIKE_JS } from "../constants.ts";
import type { CF_FKNODE_SETTINGS } from "../types/config_files.ts";
import { FknError, GenericErrorHandler } from "../utils/error.ts";
import { CheckForPath, JoinPaths } from "./filesystem.ts";
import { parse as parseYaml } from "@std/yaml";
import { StringifyYaml } from "./io.ts";

/**
 * Returns file paths for all config files the app uses.
 *
 * @export
 * @param {("BASE" | "MOTHERFKRS" | "LOGS" | "SCHEDULE" | "SETTINGS" | "ERRORS")} path What path you want.
 * @returns {string} The path as a string.
 */
export async function GetAppPath(
    path: "BASE" | "MOTHERFKRS" | "LOGS" | "SCHEDULE" | "SETTINGS" | "ERRORS",
): Promise<string> {
    try {
        const envPaths = {
            windows: "APPDATA",
            linux: "XDG_CONFIG_HOME",
            linuxFallback: await JoinPaths(Deno.env.get("HOME") ?? "", ".config"),
        };

        const appDataPath = Deno.build.os === "windows"
            ? Deno.env.get(envPaths.windows)
            : (Deno.env.get(envPaths.linux) || envPaths.linuxFallback);

        if (!appDataPath) {
            throw new FknError(
                "Internal__NoEnvForConfigPath",
                `We searched for ${
                    Deno.build.os === "windows" ? "APPDATA" : "XDG_CONFIG_HOME and HOME"
                } in env, but couldn't find it. Please report this on GitHub.`,
            );
        }

        const funny = I_LIKE_JS.MFS.toLowerCase().replace("*", "o").replace("*", "u");

        const BASE_DIR = await JoinPaths(appDataPath, APP_NAME.CLI);
        const PROJECTS = await JoinPaths(BASE_DIR, `${APP_NAME.CLI}-${funny}.txt`);
        const LOGS = await JoinPaths(BASE_DIR, `${APP_NAME.CLI}-logs.log`);
        const SCHEDULE = await JoinPaths(BASE_DIR, `${APP_NAME.CLI}-schedule.yaml`);
        const SETTINGS = await JoinPaths(BASE_DIR, `${APP_NAME.CLI}-settings.yaml`);
        const ERRORS = await JoinPaths(BASE_DIR, `${APP_NAME.CLI}-errors.log`);

        switch (path) {
            case "BASE":
                return BASE_DIR;
            case "MOTHERFKRS":
                return PROJECTS;
            case "LOGS":
                return LOGS;
            case "SCHEDULE":
                return SCHEDULE;
            case "SETTINGS":
                return SETTINGS;
            case "ERRORS":
                return ERRORS;
            default:
                throw new Error(`Invalid config path ${path} requested.`);
        }
    } catch (e) {
        GenericErrorHandler(e, false);
    }
}

/**
 * Check if config files are present, create them otherwise ("Fresh Setup").
 *
 * @export
 * @async
 * @returns {Promise<void>}
 */
export async function FreshSetup(repairSetts?: boolean): Promise<void> {
    try {
        const basePath = await GetAppPath("BASE");
        if (!(await CheckForPath(basePath))) {
            await Deno.mkdir(basePath, { recursive: true });
        }

        const projectPath = await GetAppPath("MOTHERFKRS");
        if (!(await CheckForPath(projectPath))) {
            await Deno.writeTextFile(projectPath, "", {
                create: true,
            });
        }

        const logsPath = await GetAppPath("LOGS");
        if (!(await CheckForPath(logsPath))) {
            await Deno.writeTextFile(logsPath, "", {
                create: true,
            });
        }

        const errorLogsPath = await GetAppPath("ERRORS");
        if (!(await CheckForPath(errorLogsPath))) {
            await Deno.writeTextFile(errorLogsPath, "", {
                create: true,
            });
        }

        const settingsPath = await GetAppPath("SETTINGS");
        if ((!(await CheckForPath(settingsPath))) || repairSetts === true) {
            await Deno.writeTextFile(settingsPath, StringifyYaml(DEFAULT_SETTINGS), {
                create: true,
            });
        }

        const schedulePath = await GetAppPath("SCHEDULE");
        if (!(await CheckForPath(schedulePath))) {
            await Deno.writeTextFile(schedulePath, StringifyYaml(DEFAULT_SCHEDULE_FILE), {
                create: true,
            });
        }

        return;
    } catch (e) {
        console.error(`Some ${I_LIKE_JS.MFN} error happened trying to setup config files: ${e}`);
        Deno.exit(1);
    }
}

/**
 * Returns current user settings.
 *
 * @export
 * @async
 * @returns {Promise<FKNODE_SETTINGS>}
 */
export async function GetSettings(): Promise<CF_FKNODE_SETTINGS> {
    const path = await GetAppPath("SETTINGS");
    const stuff: CF_FKNODE_SETTINGS = await parseYaml(await Deno.readTextFile(path)) as CF_FKNODE_SETTINGS;
    if (!stuff.logFlushFreq || !stuff.defaultCleanerIntensity || !stuff.favoriteEditor || !stuff.updateFreq) {
        const newStuff: CF_FKNODE_SETTINGS = {
            logFlushFreq: stuff.logFlushFreq ?? DEFAULT_SETTINGS.logFlushFreq,
            updateFreq: stuff.updateFreq ?? DEFAULT_SETTINGS.updateFreq,
            favoriteEditor: stuff.favoriteEditor ?? DEFAULT_SETTINGS.favoriteEditor,
            defaultCleanerIntensity: stuff.defaultCleanerIntensity ?? DEFAULT_SETTINGS.defaultCleanerIntensity,
        };
        await Deno.writeTextFile(path, StringifyYaml(newStuff));
        return newStuff;
    }
    return stuff;
}
