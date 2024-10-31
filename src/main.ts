import TheCleaner from "./commands/clean.ts";
import TheManager from "./commands/manage.ts";
import TheStatistics from "./commands/stats.ts";
import TheMigrator from "./commands/migrate.ts";
import TheHelper from "./commands/help.ts";
import TheUpdater from "./functions/updater.ts";
import TheSettings from "./commands/settings.ts";

import { I_LIKE_JS, VERSION } from "./constants.ts";
import type { CONFIG_FILES, MANAGERS } from "./types.ts";
import { LogStuff, ParseFlag } from "./functions/io.ts";
import { FreshSetup } from "./functions/config.ts";

const [inputCommand] = Deno.args;

if (!inputCommand) {
    await init();
    await TheHelper();
    Deno.exit(0);
}

const flags = Deno.args.map((arg) => {
    return arg.toLowerCase();
});

const isVerbose = flags.includes("--verbose");
const wantsToUpdate = flags.includes("--update");

let ALL_CONFIG_FILES: CONFIG_FILES;

async function init(update?: boolean) {
    await TheUpdater(ALL_CONFIG_FILES, update);
    ALL_CONFIG_FILES = await FreshSetup();
}

if (ParseFlag("help", true).some((flag) => flags.includes(flag))) {
    await init();
    await TheHelper(Deno.args[1]);
    Deno.exit(0);
}

if (ParseFlag("version", true).some((flag) => flags.includes(flag))) {
    console.log(VERSION);
    Deno.exit(0);
}

if (ParseFlag("experimental-stats", false).some((flag) => flags.includes(flag))) {
    await init();
    if (confirm("Experimental features are hidden behind a flag for a reason. Are you sure?")) {
        await LogStuff(`Okay, there we go. Report any ${I_LIKE_JS.FKN} error you find in GitHub.`);
        await TheStatistics();
    }
    Deno.exit(0);
}

async function main(command: string) {
    try {
        switch (command.toLowerCase()) {
            case "clean":
                await init();
                if (Deno.args[1] && !["normal", "hard", "maxim"].includes(Deno.args[1])) {
                    throw new Error("Invalid intensity provided.");
                }
                await TheCleaner(isVerbose, wantsToUpdate, Deno.args[1] as "normal" | "hard" | "maxim" ?? "normal", ALL_CONFIG_FILES);
                break;
            case "manager":
                await init();
                await TheManager(Deno.args, ALL_CONFIG_FILES);
                break;
            case "settings":
                await init();
                await TheSettings(Deno.args, ALL_CONFIG_FILES);
                break;
            case "migrate":
                await init();
                if (!Deno.args[1]) throw new Error(`No project specified!`);
                if (!Deno.args[2]) throw new Error(`No target specified!`);
                await TheMigrator(Deno.args[1], Deno.args[2] as MANAGERS);
                break;
            case "self-update":
                await init(true);
                break;
            case "stats":
                await init();
                await LogStuff(
                    "stats has been proven to be an unstable and not-working command. Use --experimental-stats if you want to try it.",
                    "warn",
                );
                break;
            default:
                await init();
                await LogStuff(
                    `Unknown command. Showing help menu.`,
                    "what",
                    true,
                );
                await TheHelper();
                Deno.exit(0);
        }
    } catch (e) {
        await LogStuff(String(e), "error");
        Deno.exit(1);
    }
}

await main(inputCommand);
