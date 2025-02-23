import { LogStuff, ParseFlag } from "../functions/io.ts";
import type { TheSettingsConstructedParams } from "./constructors/command.ts";
import { ChangeSetting, DisplaySettings, FlushConfigFiles, FreshSetup, VALID_SETTINGS } from "../functions/config.ts";
import { StringUtils } from "@zakahacecosas/string-utils";
import { DEBUG_LOG } from "../utils/error.ts";

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
    const args = StringUtils.normalizeArray(params.args);
    DEBUG_LOG("SETTINGS TOOK", args[0]);

    if (!args || args.length === 0) {
        await DisplaySettings();
        return;
    }

    if (!args[0]) {
        await DisplaySettings();
        return;
    }

    switch (args[0]) {
        case "flush":
            await FlushConfigFiles(args[1], ParseFlag("force", false).includes(args[2] ?? ""));
            break;
        case "repair":
        case "reset":
            await ResetSettings();
            break;
        case "change":
            if (!StringUtils.validateAgainst(args[1], VALID_SETTINGS)) {
                await LogStuff(
                    `Invalid option, use one of these keys to tweak settings: ${VALID_SETTINGS.toString()}`,
                );
                return;
            }
            if (!StringUtils.validate(args[2])) {
                await LogStuff("Provide a value to update this setting to.");
                return;
            }
            await ChangeSetting(
                args[1],
                args[2],
            );
            break;
        default:
            await DisplaySettings();
    }
}
