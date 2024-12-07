import { ColorString, LogStuff, ParseFlag } from "../functions/io.ts";
import { APP_NAME } from "../constants.ts";
import TheCleaner from "./clean.ts";
import { ConvertBytesToMegaBytes } from "../functions/filesystem.ts";
import type { TheSettingsConstructedParams } from "./constructors/command.ts";
import { FreshSetup, GetSettings } from "../functions/config.ts";
import type { CONFIG_FILES } from "../types/config_files.ts";

async function CreateSchedule(hour: string | null, day: string | "*" | null, appPaths: CONFIG_FILES) {
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
                    intensity: "normal",
                    CF: appPaths,
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

async function Flush(what: string, force: boolean, config: CONFIG_FILES) {
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
            file = [config.logs];
            break;
        case "projects":
            file = [config.projects];
            break;
        case "updates":
            file = [config.updates];
            break;
        case "all":
            file = [
                config.logs,
                config.projects,
                config.updates,
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

async function AutoFlush(action: "enable" | "disable", config: CONFIG_FILES, freq?: number) {
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
                await Flush("logs", true, config);
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
    const { args, CF } = params;

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
        await CreateSchedule(secondArg, thirdArg, CF);
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
            await Flush(secondArg ?? "", ParseFlag("force", false).includes(thirdArg ?? ""), CF);
            break;
        case "auto-flush":
            await AutoFlush(secondArg as "enable" | "disable", CF, Number(thirdArg));
            break;
        case "repair":
            await Repair();
            break;
        default:
            await DisplaySettings();
    }
}
