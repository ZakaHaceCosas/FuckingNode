import { LogStuff, ParseFlag } from "../functions/io.ts";
import { BulkRemoveFiles, ConvertBytesToMegaBytes } from "../functions/filesystem.ts";
import type { TheSettingsConstructedParams } from "./constructors/command.ts";
import { ChangeSetting, DisplaySettings, FreshSetup, GetAppPath, VALID_SETTINGS } from "../functions/config.ts";
import { StringUtils } from "@zakahacecosas/string-utils";

export async function Flush(what: string, force: boolean, silent: boolean = false) {
    const validTargets = ["logs", "projects", "schedules", "all"];
    if (!validTargets.includes(what)) {
        await LogStuff(
            "Specify what to flush. Either 'logs', 'projects', 'schedules', or 'all'.",
            "warn",
        );
        return;
    }

    // type fix
    const target: "logs" | "projects" | "schedules" | "all" = what as "logs" | "projects" | "schedules" | "all";

    let file: string[];

    switch (target) {
        case "logs":
            file = [await GetAppPath("LOGS")];
            break;
        case "projects":
            file = [await GetAppPath("MOTHERFKRS")];
            break;
        case "schedules":
            file = [await GetAppPath("SCHEDULE")];
            break;
        case "all":
            file = [
                await GetAppPath("LOGS"),
                await GetAppPath("MOTHERFKRS"),
                await GetAppPath("SCHEDULE"),
            ];
            break;
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

    await BulkRemoveFiles(file);
    if (silent === true) return;
    await LogStuff("That worked out!", "tick-clear");
    return;
}

async function ResetSettings() {
    const confirmation = await LogStuff(
        "Are you sure you want to reset your settings to the defaults? Current settings will be lost",
        "warn",
        undefined,
        true,
    );

    if (!confirmation) return;

    await FreshSetup(true);
    await LogStuff("Switched to defaults successfully:", "tick");
    await DisplaySettings();
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
            await ResetSettings();
            break;
        case "change":
            if (!StringUtils.validateAgainst(secondArg, VALID_SETTINGS)) {
                await LogStuff(
                    `Invalid option, use one of these keys to tweak settings: ${VALID_SETTINGS.toString()}`,
                );
                return;
            }
            if (!thirdArg || thirdArg.trim().length === 0) {
                await LogStuff("Provide a value to update this setting to.");
                return;
            }
            await ChangeSetting(
                secondArg,
                thirdArg,
            );
            break;
        default:
            await DisplaySettings();
    }
}
