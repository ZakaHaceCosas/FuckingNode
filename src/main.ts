// the things.
import TheCleaner from "./commands/clean.ts";
import TheManager from "./commands/manage.ts";
import TheStatistics from "./commands/stats.ts";
import TheMigrator from "./commands/migrate.ts";
import TheHelper from "./commands/help.ts";
import TheUpdater from "./commands/updater.ts";
import TheSettings from "./commands/settings.ts";
import TheAbouter from "./commands/about.ts";
import { I_LIKE_JS, VERSION } from "./constants.ts";
import { ColorString, LogStuff, ParseFlag } from "./functions/io.ts";
import { FreshSetup } from "./functions/config.ts";
import GenericErrorHandler from "./utils/error.ts";

async function init(update: boolean, mute?: boolean) {
    await FreshSetup(); // Temporarily hold the result
    await TheUpdater({ force: update, silent: !update, mute: mute ? mute : false });
}

await init(false, true);

const [firstCommand] = Deno.args;

if (!firstCommand) {
    await init(false);
    await TheHelper({});
    Deno.exit(0);
}

const flags = Deno.args.map((arg) => {
    return arg.toLowerCase();
});

if (ParseFlag("help", true).some((flag) => flags.includes(flag))) {
    await init(false);
    await TheHelper({ query: Deno.args[1] });
    Deno.exit(0);
}

if (ParseFlag("version", true).some((flag) => flags.includes(flag))) {
    console.log(ColorString(VERSION, "bright-green"));
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
        await TheStatistics();
    }
    Deno.exit(0);
}

async function main(command: string) {
    await init(false);

    try {
        switch (command.toLowerCase()) {
            case "clean":
                await TheCleaner({
                    verbose: flags.includes("--verbose"),
                    update: flags.includes("--update"),
                    intensity: Deno.args[1] ?? "normal",
                });
                break;
            case "global-clean":
            case "hard-clean":
                await TheCleaner({
                    verbose: flags.includes("--verbose"),
                    update: flags.includes("--update"),
                    intensity: "hard-only",
                });
                break;
            case "manager":
                await TheManager(Deno.args);
                break;
            case "settings":
                await TheSettings({ args: Deno.args });
                break;
            case "migrate":
                await TheMigrator({ project: Deno.args[1], target: Deno.args[2] });
                break;
            case "self-update":
            case "upgrade":
                if (command.toLowerCase() === "self-update") await LogStuff(ColorString("Use upgrade instead", "bright-yellow"), "warn");
                await LogStuff(`Currently on version ${ColorString(VERSION, "green")}`);
                await LogStuff("Checking for updates...");
                await init(true);
                await LogStuff("Done", "tick-clear");
                break;
            case "about":
                await TheAbouter();
                break;
            case "stats":
                await LogStuff(
                    "stats has been proven to be an unstable and not-working command. Use --experimental-stats if you want to try it.",
                    "warn",
                );
                break;
            default:
                await TheHelper({ query: Deno.args[1] });
                Deno.exit(0);
        }

        Deno.exit(0);
    } catch (e) {
        await GenericErrorHandler(e);
    }
}

await main(firstCommand);
