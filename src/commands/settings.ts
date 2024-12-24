import { ColorString, LogStuff, ParseFlag } from "../functions/io.ts";
import { BulkRemoveFiles, ConvertBytesToMegaBytes } from "../functions/filesystem.ts";
import type { TheSettingsConstructedParams } from "./constructors/command.ts";
import { FreshSetup, GetAppPath, GetSettings } from "../functions/config.ts";
import type { CF_FKNODE_SETTINGS } from "../types/config_files.ts";
import type { CleanerIntensity } from "../types/config_params.ts";
import { stringify as stringifyYaml } from "@std/yaml";

async function Flush(what: string, force: boolean) {
    const validTargets = ["logs", "projects", "updates", "all"];
    if (!validTargets.includes(what)) {
        await LogStuff(
            "Specify what to flush. Either 'logs', 'projects', 'updates', or 'all'.",
            "warn",
        );
        return;
    }

    let file: string | string[];

    switch (what) {
        case "logs":
            file = [await GetAppPath("LOGS")];
            break;
        case "projects":
            file = [await GetAppPath("MOTHERFKRS")];
            break;
        case "updates":
            file = [await GetAppPath("UPDATES")];
            break;
        case "all":
            file = [
                await GetAppPath("LOGS"),
                await GetAppPath("MOTHERFKRS"),
                await GetAppPath("UPDATES"),
            ];
            break;
        default:
            throw new Error("No valid target provided.");
    }

    const fileSize = typeof file === "string"
        ? (await Deno.stat(file)).size
        : await Promise.all(file.map((item) =>
            Deno.stat(item).then((s) => {
                return s.size;
            })
        ));

    const shouldProceed = force ||
        (await LogStuff(
            `Are you sure you want to clean your ${what} file? You'll recover ${ConvertBytesToMegaBytes(fileSize, "force")} KB.`,
            "what",
            undefined,
            true,
        ));

    if (!shouldProceed) return;

    try {
        await BulkRemoveFiles(file);
        await LogStuff("That worked out!", "tick-clear");
    } catch (e) {
        await LogStuff(`Error removing files: ${e}`, "error");
    }
}

async function Repair() {
    try {
        const confirmation = await LogStuff(
            "Are you sure? Repairing your settings will overwrite your current setting with the defaults.",
            "warn",
            undefined,
            true,
        );
        if (!confirmation) return;

        await FreshSetup(true);
        await LogStuff("Repaired settings (now using defaults):", "tick");
        await DisplaySettings();
    } catch (e) {
        throw e;
    }
}

async function ChangeSetting(setting: "default-int" | "update-freq" | "fav-editor", value: string) {
    try {
        const currentSettings = await GetSettings();

        switch (setting) {
            case "default-int": {
                if (!["normal", "hard", "hard-only", "maxim"].includes(value)) {
                    await LogStuff(`${value} is not valid. Enter either 'normal', 'hard', 'hard-only', or 'maxim'.`);
                    return;
                }
                const newValue: CleanerIntensity = value as CleanerIntensity;
                const newSettings: CF_FKNODE_SETTINGS = {
                    ...currentSettings,
                    defaultCleanerIntensity: newValue,
                };
                await Deno.writeTextFile(
                    await GetAppPath("SETTINGS"),
                    stringifyYaml(newSettings),
                );
                break;
            }
            case "update-freq": {
                const newValue = Number(value);
                if (isNaN(newValue)) {
                    await LogStuff(`${value} is not valid. Enter a number.`);
                    return;
                }
                if (Math.ceil(newValue) <= 0) {
                    await LogStuff(`${value} is not valid. You must input a value greater than 0.`);
                    return;
                }
                const newSettings: CF_FKNODE_SETTINGS = {
                    ...currentSettings,
                    updateFreq: Math.ceil(newValue),
                };
                await Deno.writeTextFile(
                    await GetAppPath("SETTINGS"),
                    stringifyYaml(newSettings),
                );
                break;
            }
            case "fav-editor": {
                if (!["vscode", "sublime"].includes(value)) {
                    await LogStuff(`${value} is not valid. Enter either 'vscode' or 'sublime'. (More editors soon).`);
                    return;
                }
                const newSettings: CF_FKNODE_SETTINGS = {
                    ...currentSettings,
                    favoriteEditor: (value as "vscode" | "sublime"),
                };
                await Deno.writeTextFile(
                    await GetAppPath("SETTINGS"),
                    stringifyYaml(newSettings),
                );
                break;
            }
        }

        await LogStuff(`Settings successfully updated! ${setting} is now ${value}`, "tick-clear");

        return;
    } catch (e) {
        throw e;
    }
}

async function DisplaySettings() {
    const settings = await GetSettings();
    const formattedSettings = `Update frequency: Each ${ColorString(settings.updateFreq, "bright-green")} days.\nDefault cleaner intensity: ${
        ColorString(settings.defaultCleanerIntensity, "bright-green")
    }\nAuto-flush files: ${ColorString(settings.autoFlushFiles.enabled ? "enabled" : "disabled", "bright-green")}${
        settings.autoFlushFiles.enabled && `\n    Frequency: ${ColorString(settings.autoFlushFiles.freq, "bright-green")}`
    }\nFavorite editor: ${ColorString(settings.favoriteEditor, "bright-green")}`;
    await LogStuff(`${ColorString("Your current settings are:", "bright-yellow")}\n---\n${formattedSettings}`, "bulb");
}

export default async function TheSettings(params: TheSettingsConstructedParams) {
    const { args } = params;

    if (!args || args.length === 0) {
        await DisplaySettings();
        return;
    }

    const command = args[1];
    const secondArg = args[2]?.trim() || null;
    const thirdArg = args[3]?.trim() || null;

    if (!command) {
        await DisplaySettings();
        return;
    }

    switch (command) {
        case "flush":
            await Flush(secondArg ?? "", ParseFlag("force", false).includes(thirdArg ?? ""));
            break;
        case "repair":
            await Repair();
            break;
        case "change":
            if (!secondArg) {
                await LogStuff("Invalid option, use 'change default-int', 'change update-freq', or 'change fav-editor' to tweak settings.");
                return;
            }
            switch (secondArg) {
                case "default-int":
                    if (!thirdArg) {
                        await LogStuff("Provide a value to update this setting to.");
                        return;
                    }
                    await ChangeSetting("default-int", thirdArg);
                    break;
                case "update-freq":
                    if (!thirdArg) {
                        await LogStuff("Provide a value to update this setting to.");
                        return;
                    }
                    await ChangeSetting("update-freq", thirdArg);
                    break;
                case "fav-editor":
                    if (!thirdArg) {
                        await LogStuff("Provide a value to update this setting to.");
                        return;
                    }
                    await ChangeSetting("fav-editor", thirdArg);
                    break;
                default:
                    await LogStuff("Invalid option, use 'change default-int', 'change update-freq', or 'change fav-editor' to tweak settings.");
                    break;
            }
            break;
        default:
            await DisplaySettings();
    }
}
