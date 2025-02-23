import { APP_NAME, DEFAULT_SCHEDULE_FILE, DEFAULT_SETTINGS, I_LIKE_JS } from "../constants.ts";
import type { CF_FKNODE_SETTINGS } from "../types/config_files.ts";
import { FknError, GenericErrorHandler } from "../utils/error.ts";
import { BulkRemoveFiles, CheckForPath, JoinPaths } from "./filesystem.ts";
import { parse as parseYaml } from "@std/yaml";
import { ColorString, LogStuff, StringifyYaml } from "./io.ts";
import { StringUtils, type UnknownString } from "@zakahacecosas/string-utils";
import { format } from "@std/fmt/bytes";

/**
 * Returns file paths for all config files the app uses.
 *
 * @export
 * @param {("BASE" | "MOTHERFKRS" | "LOGS" | "SCHEDULE" | "SETTINGS" | "ERRORS")} path What path you want.
 * @returns {string} The path as a string.
 */
export function GetAppPath(
    path: "BASE" | "MOTHERFKRS" | "LOGS" | "SCHEDULE" | "SETTINGS" | "ERRORS",
): string {
    try {
        const envPaths = {
            windows: "APPDATA",
            linux: "XDG_CONFIG_HOME",
            linuxFallback: JoinPaths(Deno.env.get("HOME") ?? "", ".config"),
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

        const BASE_DIR = JoinPaths(appDataPath, APP_NAME.CLI);
        const PROJECTS = JoinPaths(BASE_DIR, `${APP_NAME.CLI}-${funny}.txt`);
        const LOGS = JoinPaths(BASE_DIR, `${APP_NAME.CLI}-logs.log`);
        const SCHEDULE = JoinPaths(BASE_DIR, `${APP_NAME.CLI}-schedule.yaml`);
        const SETTINGS = JoinPaths(BASE_DIR, `${APP_NAME.CLI}-settings.yaml`);
        const ERRORS = JoinPaths(BASE_DIR, `${APP_NAME.CLI}-errors.log`);

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
        const basePath = GetAppPath("BASE");
        if (!CheckForPath(basePath)) {
            await Deno.mkdir(basePath, { recursive: true });
        }

        const projectPath = GetAppPath("MOTHERFKRS");
        if (!CheckForPath(projectPath)) {
            await Deno.writeTextFile(projectPath, "", {
                create: true,
            });
        }

        const logsPath = GetAppPath("LOGS");
        if (!CheckForPath(logsPath)) {
            await Deno.writeTextFile(logsPath, "", {
                create: true,
            });
        }

        const errorLogsPath = GetAppPath("ERRORS");
        if (!CheckForPath(errorLogsPath)) {
            await Deno.writeTextFile(errorLogsPath, "", {
                create: true,
            });
        }

        const settingsPath = GetAppPath("SETTINGS");
        if ((!CheckForPath(settingsPath) || repairSetts === true)) {
            await Deno.writeTextFile(settingsPath, StringifyYaml(DEFAULT_SETTINGS), {
                create: true,
            });
        }

        const schedulePath = GetAppPath("SCHEDULE");
        if (!CheckForPath(schedulePath)) {
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
    const path = GetAppPath("SETTINGS");
    const stuff: CF_FKNODE_SETTINGS = await parseYaml(await Deno.readTextFile(path)) as CF_FKNODE_SETTINGS;
    if (!stuff.flushFreq || !stuff.defaultIntensity || !stuff.favEditor || !stuff.updateFreq) {
        const newStuff: CF_FKNODE_SETTINGS = {
            flushFreq: stuff.flushFreq ?? DEFAULT_SETTINGS.flushFreq,
            updateFreq: stuff.updateFreq ?? DEFAULT_SETTINGS.updateFreq,
            favEditor: stuff.favEditor ?? DEFAULT_SETTINGS.favEditor,
            defaultIntensity: stuff.defaultIntensity ?? DEFAULT_SETTINGS.defaultIntensity,
        };
        await Deno.writeTextFile(path, StringifyYaml(newStuff));
        return newStuff;
    }
    return stuff;
}

type setting = keyof CF_FKNODE_SETTINGS;

export const VALID_SETTINGS: setting[] = ["defaultIntensity", "updateFreq", "favEditor", "flushFreq"];

/**
 * Changes a given user setting to a given value.
 *
 * @export
 * @async
 * @param {setting} setting Setting to change.
 * @param {UnknownString} value Value to set it to.
 * @returns {Promise<void>}
 */
export async function ChangeSetting(
    setting: setting,
    value: UnknownString,
): Promise<void> {
    const settingsPath = GetAppPath("SETTINGS");
    const currentSettings = await GetSettings();

    switch (setting) {
        case "defaultIntensity": {
            if (!StringUtils.validateAgainst(value, ["normal", "hard", "hard-only", "maxim", "maxim-only"])) {
                await LogStuff(`${value} is not valid. Enter either 'normal', 'hard', 'hard-only', or 'maxim'.`);
                return;
            }
            const newSettings: CF_FKNODE_SETTINGS = {
                ...currentSettings,
                defaultIntensity: value,
            };
            await Deno.writeTextFile(
                settingsPath,
                StringifyYaml(newSettings),
            );
            break;
        }
        case "updateFreq": {
            const newValue = Math.ceil(Number(value));
            if (typeof newValue !== "number" || isNaN(newValue) || newValue <= 0) {
                await LogStuff(`${value} is not valid. Enter a valid number greater than 0.`);
                return;
            }
            const newSettings: CF_FKNODE_SETTINGS = {
                ...currentSettings,
                updateFreq: Math.ceil(newValue),
            };
            await Deno.writeTextFile(
                settingsPath,
                StringifyYaml(newSettings),
            );
            break;
        }
        case "favEditor": {
            if (!StringUtils.validateAgainst(value, ["vscode", "sublime", "emacs", "atom", "notepad++", "vscodium"])) {
                await LogStuff(
                    `${value} is not valid. Enter either:\n'vscode', 'sublime', 'emacs', 'atom', 'notepad++', or 'vscodium'.`,
                );
                return;
            }
            const newSettings: CF_FKNODE_SETTINGS = {
                ...currentSettings,
                favEditor: value,
            };
            await Deno.writeTextFile(
                settingsPath,
                StringifyYaml(newSettings),
            );
            break;
        }
        case "flushFreq": {
            const newValue = Math.ceil(Number(value));
            if (typeof newValue !== "number" || isNaN(newValue) || newValue <= 0) {
                await LogStuff(`${value} is not valid. Enter a valid number greater than 0.`);
                return;
            }
            const newSettings: CF_FKNODE_SETTINGS = {
                ...currentSettings,
                flushFreq: newValue,
            };
            await Deno.writeTextFile(
                settingsPath,
                StringifyYaml(newSettings),
            );
            break;
        }
    }

    await LogStuff(`Settings successfully updated! ${setting} is now ${value}`, "tick-clear");

    return;
}

/**
 * Formats user settings and logs them.
 *
 * @async
 * @returns {Promise<void>}
 */
export async function DisplaySettings(): Promise<void> {
    const settings = await GetSettings();

    const formattedSettings = [
        `Update frequency: Each ${ColorString(settings.updateFreq, "bright-green")} days. ${ColorString("updateFreq", "half-opaque", "italic")}`,
        `Default cleaner intensity: ${ColorString(settings.defaultIntensity, "bright-green")}. ${
            ColorString("defaultIntensity", "half-opaque", "italic")
        }`,
        `Favorite editor: ${ColorString(settings.favEditor, "bright-green")}. ${ColorString("favEditor", "half-opaque", "italic")}`,
        `Auto-flush log file frequency: Each ${ColorString(settings.flushFreq, "bright-green")} days. ${
            ColorString("flushFreq", "half-opaque", "italic")
        }`,
    ].join("\n");

    await LogStuff(`${ColorString("Your current settings are:", "bright-yellow")}\n---\n${formattedSettings}`, "bulb");
}

/**
 * Flushes configuration files.
 *
 * @export
 * @async
 * @param {UnknownString} target What to flush.
 * @param {boolean} force If true no confirmation prompt will be shown.
 * @param {boolean} [silent=false] If true no success message will be shown.
 * @returns {Promise<void>}
 */
export async function FlushConfigFiles(target: UnknownString, force: boolean, silent: boolean = false): Promise<void> {
    if (!StringUtils.validateAgainst(target, ["logs", "projects", "schedules", "errors", "all"])) {
        await LogStuff(
            "Specify what to flush. Either 'logs', 'projects', 'schedules', 'errors', or 'all'.",
            "warn",
        );
        return;
    }

    let file: string[];

    switch (target) {
        case "logs":
            file = [GetAppPath("LOGS")];
            break;
        case "projects":
            file = [GetAppPath("MOTHERFKRS")];
            break;
        case "schedules":
            file = [GetAppPath("SCHEDULE")];
            break;
        case "errors":
            file = [GetAppPath("ERRORS")];
            break;
        case "all":
            file = [
                GetAppPath("LOGS"),
                GetAppPath("MOTHERFKRS"),
                GetAppPath("SCHEDULE"),
                GetAppPath("ERRORS"),
            ];
            break;
    }

    const fileSize = typeof file === "string"
        ? (await Deno.stat(file)).size
        : (await Promise.all(file.map((item) =>
            Deno.stat(item).then((s) => {
                return s.size;
            })
        ))).reduce((acc, num) => acc + num, 0);

    if (
        !force &&
        !(await LogStuff(
            `Are you sure you want to clean your ${target} file? You'll recover ${format(fileSize)}.`,
            "what",
            undefined,
            true,
        ))
    ) return;

    await BulkRemoveFiles(file);
    if (!silent) await LogStuff("That worked out!", "tick-clear");
    return;
}
