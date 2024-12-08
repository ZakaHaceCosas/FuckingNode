import { ColorString, LogStuff, ParseFlag } from "../functions/io.ts";
import { APP_NAME } from "../constants.ts";
import TheCleaner from "./clean.ts";
import { ConvertBytesToMegaBytes } from "../functions/filesystem.ts";
import type { TheSettingsConstructedParams } from "./constructors/command.ts";
import { FreshSetup, GetAppPath, GetSettings } from "../functions/config.ts";
import type { CF_FKNODE_SETTINGS } from "../types/config_files.ts";
import type { CleanerIntensity } from "../types/config_params.ts";
import { stringify as stringifyYaml } from "@std/yaml";

async function CreateSchedule(hour: string | null, day: string | "*" | null) {
    const workingHour = Number(hour);

    if (isNaN(workingHour) || workingHour < 0 || workingHour > 23) {
        await LogStuff("Invalid hour. Must be a number between 0 and 23.", "error");
        Deno.exit(1);
    }

    const workingDay: Deno.CronScheduleExpression = day === "*" ? 1 : { every: Number(day) };

    if (day !== "*" && (isNaN(Number(day)) || Number(day) < 0 || Number(day) > 6)) {
        await LogStuff("Invalid day. Must be a number between 0 and 6, or an asterisk ('*') for daily.", "error");
        Deno.exit(1);
    }

    try {
        Deno.cron(
            "fkn-cleaner",
            {
                minute: 0,
                hour: workingHour,
                dayOfWeek: workingDay,
            },
            { backoffSchedule: [1500, 3000, 5000, 15000] },
            async () => {
                await TheCleaner({
                    update: false,
                    verbose: false,
                    prettify: false,
                    lint: false,
                    commit: false,
                    destroy: false,
                    intensity: (await GetSettings()).defaultCleanerIntensity,
                });
            },
        );
        await LogStuff("That worked out! Schedule successfully created!", "tick");
    } catch (e) {
        await LogStuff(`Error scheduling: ${e}`, "error");
    }
}

async function removeFiles(files: string[]) {
    await Promise.all(files.map(async (file) => {
        await Deno.remove(file);
    }));
}

async function Flush(what: string, force: boolean) {
    const validTargets = ["logs", "projects", "updates", "all"];
    if (!validTargets.includes(what)) {
        await LogStuff(
            "Specify what to flush. Either 'logs', 'projects', 'updates', or 'all'.\nIf you want to enable auto-flush, run 'settings auto-flush enable/disable <interval>.",
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
        await removeFiles(file);
        await LogStuff("That worked out!", "tick-clear");
    } catch (e) {
        await LogStuff(`Error removing files: ${e}`, "error");
    }
}

async function AutoFlush(action: "enable" | "disable", freq?: number) {
    if (!(["enable", "disable"].includes(action))) throw new Error("Action must be either enable or disable.");
    if (action === "disable") {
        throw new Error(
            "Cannot disable tasks. We use Deno's Cron feature to schedule tasks, which is still unstable on their side and doesn't yet allow us to remove a scheduled task.",
        );
    }

    if (!freq || isNaN(freq)) {
        await LogStuff("Invalid frequency. Must be a number.", "error");
        Deno.exit(1);
    }

    try {
        Deno.cron(
            "fkn-flush",
            {
                minute: 0,
                hour: 0,
                dayOfWeek: 0,
                dayOfMonth: { every: freq },
            },
            { backoffSchedule: [1500, 3000, 5000, 15000] },
            async () => {
                await Flush("logs", true);
            },
        );
        await LogStuff("That worked out! Auto-flush successfully scheduled!", "tick");
    } catch (e) {
        await LogStuff(`Error scheduling auto-flush: ${e}`, "error");
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

async function ChangeSetting(setting: "default-int" | "update-freq", value: string) {
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
        }
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
    }`;
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

    if (ParseFlag("experimental-schedule", false).includes(command)) {
        await CreateSchedule(secondArg, thirdArg);
        return;
    }

    if (ParseFlag("experimental-auto-flush", false).includes(command)) {
        await AutoFlush(secondArg as "enable" | "disable", Number(thirdArg));
        return;
    }

    switch (command) {
        case "schedule":
            await LogStuff(
                `${APP_NAME.STYLED} runtime's (Deno) support for scheduled tasks is still unstable and this feature doesn't work properly. Use --experimental-schedule to try it.`,
                "bruh",
            );
            break;
        case "flush":
            await Flush(secondArg ?? "", ParseFlag("force", false).includes(thirdArg ?? ""));
            break;
        case "auto-flush":
            await LogStuff(
                `${APP_NAME.STYLED} runtime's (Deno) support for scheduled tasks is still unstable and this feature doesn't work properly. Use --experimental-auto-flush to try it.`,
                "bruh",
            );
            break;
        case "repair":
            await Repair();
            break;
        case "change":
            if (!secondArg) {
                await LogStuff("Invalid option, use 'change default-int' or 'change update-freq' to tweak settings.");
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
                default:
                    await LogStuff("Invalid option, use 'change default-int' or 'change update-freq' to tweak settings.");
                    break;
            }
            break;
        default:
            await DisplaySettings();
    }
}
