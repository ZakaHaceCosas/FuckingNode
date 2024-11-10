import TheCleaner from "./commands/clean.ts";
import TheManager from "./commands/manage.ts";
import TheStatistics from "./commands/stats.ts";
import TheMigrator from "./commands/migrate.ts";
import TheHelper from "./commands/help.ts";
import TheUpdater from "./functions/updater.ts";
import TheSettings from "./commands/settings.ts";

import { I_LIKE_JS, VERSION } from "./constants.ts";
import type { CONFIG_FILES } from "./types.ts";
import { LogStuff, ParseFlag } from "./functions/io.ts";
import { FreshSetup } from "./functions/config.ts";
import GenericErrorHandler from "./utils/error.ts";

const [inputCommand] = Deno.args;

if (!inputCommand) {
    await init(false);
    await TheHelper({});
    Deno.exit(0);
}

const flags = Deno.args.map((arg) => {
    return arg.toLowerCase();
});

const isVerbose = flags.includes("--verbose");
const wantsToUpdate = flags.includes("--update");

async function init(update: boolean) {
    const configFiles = await FreshSetup(); // Temporarily hold the result
    const ALL_CONFIG_FILES: CONFIG_FILES = configFiles; // Assign only after it's resolved
    await TheUpdater(ALL_CONFIG_FILES, update);
    return ALL_CONFIG_FILES;
}

const ALL_CONFIG_FILES = await init(false);

if (ParseFlag("help", true).some((flag) => flags.includes(flag))) {
    await init(false);
    await TheHelper({ query: Deno.args[1] });
    Deno.exit(0);
}

if (ParseFlag("version", true).some((flag) => flags.includes(flag))) {
    console.log(VERSION);
    Deno.exit(0);
}

if (
    ParseFlag("experimental-stats", false).some((flag) => flags.includes(flag))
) {
    await init(false);
    if (
        confirm(
            "Experimental features are hidden behind a flag for a reason. Are you sure?",
        )
    ) {
        await LogStuff(
            `Okay, there we go. Report any ${I_LIKE_JS.FKN} error you find in GitHub.`,
        );
        await TheStatistics(ALL_CONFIG_FILES);
    }
    Deno.exit(0);
}

async function main(command: string) {
    await init(false);

    try {
        switch (command.toLowerCase()) {
            case "clean":
                await TheCleaner({
                    verbose: isVerbose,
                    update: wantsToUpdate,
                    intensity: Deno.args[1] ?? "normal",
                    CF: ALL_CONFIG_FILES,
                });
                break;
            case "global-clean":
            case "hard-clean":
                await TheCleaner({
                    verbose: isVerbose,
                    update: wantsToUpdate,
                    intensity: "hard-only",
                    CF: ALL_CONFIG_FILES,
                });
                break;
            case "manager":
                await TheManager(Deno.args, ALL_CONFIG_FILES);
                break;
            case "settings":
                await TheSettings({ args: Deno.args, CF: ALL_CONFIG_FILES });
                break;
            case "migrate":
                await TheMigrator({ project: Deno.args[1], target: Deno.args[2] });
                break;
            case "self-update":
                await init(true);
                break;
            case "stats":
                await LogStuff(
                    "stats has been proven to be an unstable and not-working command. Use --experimental-stats if you want to try it.",
                    "warn",
                );
                break;
            default:
                await TheHelper({});
                Deno.exit(0);
        }

        Deno.exit(0);
    } catch (e) {
        await GenericErrorHandler(e);
        Deno.exit(1);
    }
}

await main(inputCommand);
