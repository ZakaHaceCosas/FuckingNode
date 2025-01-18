// the things.
import TheCleaner from "./commands/clean.ts";
import TheManager from "./commands/manage.ts";
import TheStatistics from "./commands/stats.ts";
import TheMigrator from "./commands/migrate.ts";
import TheHelper from "./commands/help.ts";
import TheUpdater from "./commands/updater.ts";
import TheSettings from "./commands/settings.ts";
import TheAbouter from "./commands/about.ts";
import TheKickstarter from "./commands/kickstart.ts";
import TheAuditer from "./commands/audit.ts";
// other things
import { VERSION } from "./constants.ts";
import { ColorString, LogStuff, ParseFlag } from "./functions/io.ts";
import { FreshSetup, GetSettings } from "./functions/config.ts";
import GenericErrorHandler from "./utils/error.ts";
import type { TheCleanerConstructedParams } from "./commands/constructors/command.ts";
import { RunScheduledTasks } from "./functions/schedules.ts";

async function init() {
    await FreshSetup();
    await RunScheduledTasks();
}

if (!Deno.args[0]) {
    await init();
    await TheHelper({});
    Deno.exit(0);
}

const flags = Deno.args.map((arg) => arg.toLowerCase());

function hasFlag(flag: string, allowShort: boolean): boolean {
    return ParseFlag(flag, allowShort).some((f) => flags.includes(f));
}

if (hasFlag("help", true)) {
    await init();
    try {
        await TheHelper({ query: Deno.args[1] });
        Deno.exit(0);
    } catch (e) {
        console.error("Critical error", e);
        Deno.exit(1);
    }
}

if (hasFlag("experimental-audit", false)) {
    await init();
    try {
        await LogStuff(
            "Beware that, as an experimental features, errors are likely to happen. Report any issue, suggestion, or feedback on GitHub.",
            "warn",
            "bright-yellow",
        );
        await TheAuditer(
            Deno.args[1] ?? null,
            ParseFlag("strict", true).includes(Deno.args[2] ?? ""),
        );
        Deno.exit(0);
    } catch (e) {
        console.error("Critical error", e);
        Deno.exit(1);
    }
}

if (hasFlag("version", true) && !Deno.args[1]) {
    await LogStuff(VERSION, "bulb", "bright-green");
    Deno.exit(0);
}

async function main(command: string) {
    await init();

    /* this is a bit unreadable, i admit */
    const projectArg = (
            Deno.args[2] &&
            Deno.args[2].trim() !== "" &&
            (((!Deno.args[2].trim().startsWith("--") && !Deno.args[2].trim().startsWith("-")) &&
                !ParseFlag("self", false).includes(Deno.args[2])) || ParseFlag("self", false).includes(Deno.args[2]))
        )
        ? Deno.args[2]
        : 0 as const;

    const cleanerArgs: TheCleanerConstructedParams = {
        flags: {
            verbose: hasFlag("verbose", true),
            update: hasFlag("update", true),
            lint: hasFlag("lint", true),
            prettify: hasFlag("pretty", true),
            commit: hasFlag("commit", true),
            destroy: hasFlag("destroy", true),
        },
        parameters: {
            intensity: (Deno.args[1] && Deno.args[1].trim() !== "" && !Deno.args[1].trim().includes("--"))
                ? Deno.args[1]
                : (await GetSettings()).defaultCleanerIntensity,
            project: projectArg,
        },
    };

    try {
        switch (command.toLowerCase()) {
            case "clean":
                await TheCleaner(cleanerArgs);
                break;
            case "global-clean":
            case "hard-clean":
                await TheCleaner({
                    flags: { ...cleanerArgs["flags"] },
                    parameters: {
                        intensity: "hard-only",
                        project: projectArg,
                    },
                });
                break;
            case "manager":
                await TheManager(Deno.args);
                break;
            case "kickstart":
                await TheKickstarter({
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
                if (command.toLowerCase() === "self-update") await LogStuff("Use upgrade instead", "warn", "bright-yellow");
                await LogStuff(`Currently on version ${ColorString(VERSION, "green")}`);
                await LogStuff("Checking for updates...");
                await TheUpdater({ silent: false });
                break;
            case "about":
                await TheAbouter();
                break;
            case "stats":
                await TheStatistics(Deno.args[1] ?? "");
                break;
            case "documentation":
            case "docs":
            case "web":
            case "website":
                await LogStuff("Best documentation website for best CLI, live at https://zakahacecosas.github.io/FuckingNode/", "bulb");
                break;
            case "github":
            case "repo":
            case "repository":
            case "oss":
                await LogStuff(
                    "Free and open source, and free as in freedom, live at https://zakahacecosas.github.io/FuckingNode/repo\n(The above URL is a redirect to GitHub.)",
                    "bulb",
                );
                break;
            case "audit":
                await LogStuff(
                    "The Audit feature is experimental. It's only available for NodeJS projects using npm, and hidden behind '--experimental-audit'.",
                    "warn",
                    "bright-yellow",
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

await main(Deno.args[0]);
