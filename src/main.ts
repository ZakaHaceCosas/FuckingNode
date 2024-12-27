// the things.
import TheCleaner from "./commands/clean.ts";
import TheManager from "./commands/manage.ts";
import TheStatistics from "./commands/stats.ts";
import TheMigrator from "./commands/migrate.ts";
import TheHelper from "./commands/help.ts";
import TheUpdater from "./commands/updater.ts";
import TheSettings from "./commands/settings.ts";
import TheAbouter from "./commands/about.ts";
import TheKickstart from "./commands/kickstart.ts";
// other things
import { VERSION } from "./constants.ts";
import { ColorString, LogStuff, ParseFlag } from "./functions/io.ts";
import { FreshSetup, GetSettings } from "./functions/config.ts";
import GenericErrorHandler from "./utils/error.ts";

async function init(update: boolean, mute?: boolean) {
    await FreshSetup(); // Temporarily hold the result
    await TheUpdater({
        force: update,
        silent: !update,
        mute: mute ? mute : false,
    });
}

await init(false, true);

const [firstCommand] = Deno.args;

if (!firstCommand) {
    await init(false);
    await TheHelper({});
    Deno.exit(0);
}

const flags = Deno.args.map((arg) => arg.toLowerCase());

function hasFlag(flag: string, allowShort: boolean): boolean {
    return ParseFlag(flag, allowShort).some((f) => flags.includes(f));
}

if (hasFlag("help", true)) {
    await init(false);
    await TheHelper({ query: Deno.args[1] });
    Deno.exit(0);
}

if (hasFlag("version", true)) {
    await LogStuff(ColorString(VERSION, "bright-green"), "bulb");
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
                    lint: flags.includes("--lint"),
                    prettify: flags.includes("--pretty"),
                    commit: flags.includes("--commit"),
                    destroy: flags.includes("--destroy"),
                    intensity: Deno.args[1] ?? (await GetSettings()).defaultCleanerIntensity,
                });
                break;
            case "global-clean":
            case "hard-clean":
                await TheCleaner({
                    verbose: flags.includes("--verbose"),
                    update: flags.includes("--update"),
                    lint: flags.includes("--lint"),
                    prettify: flags.includes("--pretty"),
                    commit: flags.includes("--commit"),
                    destroy: flags.includes("--destroy"),
                    intensity: "hard-only",
                });
                break;
            case "manager":
                await TheManager(Deno.args);
                break;
            case "kickstart":
                await TheKickstart({
                    gitUrl: Deno.args[1] ?? "",
                    path: Deno.args[2] ?? "",
                    manager: Deno.args[3] ?? "",
                });
                break;
            case "settings":
                await TheSettings({ args: Deno.args });
                break;
            case "migrate":
                await TheMigrator({ project: Deno.args[1], desiredManager: Deno.args[2] });
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
                await TheStatistics(Deno.args[1] ?? "");
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
