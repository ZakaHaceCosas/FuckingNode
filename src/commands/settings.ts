import { ErrorMessage, LogStuff, ParseFlag } from "../functions/io.ts";
import { APP_NAME } from "../constants.ts";
import TheCleaner from "./clean.ts";
import { GetAppPath } from "../functions/config.ts";

async function CreateSchedule(hour: string, day: string | "*") {
    const workingHour = Number(hour);

    if (workingHour < 0 || workingHour > 23) {
        await LogStuff("Hour must be a valid number between 0 and 23.", "error");
        Deno.exit(1);
    }

    let workingDay: Deno.CronScheduleExpression;

    if (day === "*") {
        workingDay = 1;
    } else {
        const daysBetween = Number(day);
        if (daysBetween < 0 || daysBetween > 6) {
            await LogStuff("Day must be a valid number between 0 and 6, or an asterisk.", "error");
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
            () => {
                TheCleaner(false, false, "normal");
            },
        );
        await LogStuff("That worked out! Schedule created.", "tick");
        Deno.exit(0);
    } catch (e) {
        await LogStuff(`Error scheduling: ${e}`, "error");
    }
}

async function Flush(what: string, force: boolean) {
    const validTargets = ["logs", "projects", "updates", "all"];
    if (!validTargets.includes(what)) {
        await LogStuff("Specify what to flush, either 'logs', 'projects', 'updates', or 'all'.", "warn");
        return;
    }

    let file: string | string[];

    switch (what) {
        case "logs":
            file = await GetAppPath("LOGS");
            break;
        case "projects":
            file = await GetAppPath("MOTHERFKRS");
            break;
        case "updates":
            file = await GetAppPath("UPDATES");
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

    const shouldProceed = force || await LogStuff("Are you sure?", "what", undefined, true);

    if (!shouldProceed) return;

    try {
        if (typeof file === "string") {
            await Deno.remove(file);
        } else {
            for (const removeFile of file) {
                await Deno.remove(removeFile);
            }
        }
    } catch (e) {
        await LogStuff(`Error removing files: ${e}`, "error");
    }
}

export default async function TheSettings(args: string[]) {
    if (!args || args.length === 0) {
        ErrorMessage("NoArgumentPassed");
        Deno.exit(1);
    }

    const command = args[1];
    const secondArg = args[2] ? args[2].trim() : null;
    const thirdArg = args[3] ? args[3].trim() : null;

    if (!command) {
        ErrorMessage("NoArgumentPassed");
        return;
    }

    if (ParseFlag("experimental-schedule", false).includes(command)) {
        if (!secondArg || !thirdArg) {
            await LogStuff("No time schedule was provided, or it's incomplete.", "warn");
            return;
        }
        await CreateSchedule(secondArg, thirdArg);
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
                await LogStuff("Specify what to flush.", "warn");
                return;
            }
            if (ParseFlag("force", false).includes(thirdArg ?? "")) {
                shouldForce = true;
            }
            await Flush(secondArg, shouldForce);
            break;
        default:
            await LogStuff(`Currently supported settings:\nschedule <hour> <day>    schedule ${APP_NAME.STYLED} to run periodically.`);
    }
}
