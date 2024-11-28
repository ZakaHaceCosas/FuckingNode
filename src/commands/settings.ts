import { ColorString, LogStuff, ParseFlag } from "../functions/io.ts";
import { APP_NAME } from "../constants.ts";
import TheCleaner from "./clean.ts";
import { ConvertBytesToMegaBytes } from "../functions/filesystem.ts";
import type { CONFIG_FILES } from "../types.ts";
import type { TheSettingsConstructedParams } from "./constructors/command.ts";
import { GetSettings } from "../functions/config.ts";

async function CreateSchedule(hour: string | null, day: string | "*" | null, appPaths: CONFIG_FILES) {
    const workingHour = Number(hour);

    if (isNaN(workingHour) || workingHour < 0 || workingHour > 23) {
        await LogStuff(
            "Invalid hour. Must be a number between 0 and 23.",
            "error",
        );
        Deno.exit(1);
    }

    let workingDay: Deno.CronScheduleExpression;

    if (day === "*") {
        workingDay = 1;
    } else {
        const daysBetween = Number(day);
        if (isNaN(daysBetween) || daysBetween < 0 || daysBetween > 6) {
            await LogStuff(
                "Invalid day. Must be a number between 0 and 6, or an asterisk ('*') for daily.",
                "error",
            );
            Deno.exit(1);
        }

        workingDay = {
            every: daysBetween,
        };
    }

    try {
        await Deno.cron(
            "fkn-cleaner",
            {
                minute: 0,
                hour: workingHour,
                dayOfWeek: workingDay,
            },
            {
                backoffSchedule: [1500, 3000, 5000, 15000],
            },
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

async function Flush(what: string, force: boolean, config: CONFIG_FILES) {
    const validTargets = ["logs", "projects", "updates", "all"];
    if (!validTargets.includes(what)) {
        await LogStuff(
            "Specify what to flush, either 'logs', 'projects', 'updates', or 'all'.",
            "warn",
        );
        return;
    }

    let file: string | string[];

    switch (what) {
        case "logs":
            file = config.logs;
            break;
        case "projects":
            file = config.projects;
            break;
        case "updates":
            file = config.updates;
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
        if (typeof file === "string") {
            await Deno.remove(file);
        } else {
            for (const removeFile of file) {
                await Deno.remove(removeFile);
            }
        }
        await LogStuff("That worked out!", "tick-clear");
    } catch (e) {
        await LogStuff(`Error removing files: ${e}`, "error");
    }
}

async function DisplaySettings() {
    const settings = await GetSettings();
    const formattedSettings = `Update frequency: Each ${ColorString(settings.updateFreq, "bright-green")} days.\nDefault cleaner intensity: ${
        ColorString(settings.defaultCleanerIntensity, "bright-green")
    }`;
    await LogStuff(ColorString("No argument provided, showing current settings.", "italic"));
    await LogStuff(`${ColorString("Your current settings are:", "bright-yellow")}\n---\n${formattedSettings}`, "bulb");
}

export default async function TheSettings(params: TheSettingsConstructedParams) {
    const { args, CF } = params;

    if (!args || args.length === 0) {
        await DisplaySettings();
        return;
    }

    const command = args[1];
    const secondArg = args[2] ? args[2].trim() : null;
    const thirdArg = args[3] ? args[3].trim() : null;

    if (!command) {
        await DisplaySettings();
        return;
    }

    if (ParseFlag("experimental-schedule", false).includes(command ?? "")) {
        await CreateSchedule(secondArg, thirdArg, CF);
    }

    let shouldForce: boolean = false;

    switch (command) {
        case "schedule":
            await LogStuff(
                `${APP_NAME.STYLED} runtime's (Deno) support for scheduled tasks is still unstable and this feature doesn't work properly. Use --experimental-schedule to try it.`,
                "bruh",
            );
            break;
        case "flush":
            if (!secondArg) {
                await LogStuff("Specify what to flush. Either 'logs', 'projects', 'updates', or 'all'.", "warn");
                return;
            }
            if (ParseFlag("force", false).includes(thirdArg ?? "")) {
                shouldForce = true;
            }
            await Flush(secondArg, shouldForce, CF);
            break;
        default:
            await DisplaySettings();
    }
}
