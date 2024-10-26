import TheCleaner from "./clean.ts";
import TheManager from "./manage.ts";
import TheStatistics from "./stats.ts";
import TheMigrator from "./migrate.ts";
import TheHelper from "./help.ts";
import { APP_NAME, I_LIKE_JS, VERSION } from "./constants.ts";
import { CheckForUpdates, FreshSetup, LogStuff } from "./functions.ts";
import type { MANAGERS } from "./types.ts";
import { ParseFlag } from "./functions.ts";

const [command] = Deno.args;

if (!command) {
    await LogStuff(
        `Unknown command. Use 'clean' or 'manager'. Use '${APP_NAME.CLI} --help' to see the full list of commands.`,
        "what",
        true,
    );
    Deno.exit(1);
}

const flags = Deno.args.map((arg) => {
    return arg.toLowerCase();
});

const isVerbose = flags.includes("--verbose");
const wantsToUpdate = flags.includes("--update");

async function init(update?: boolean) {
    await CheckForUpdates(update);
    await FreshSetup();
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

switch (command.toLowerCase()) {
    case "clean":
        await init();
        if (Deno.args[1] && !["normal", "hard", "maxim"].includes(Deno.args[1])) {
            await LogStuff("Invalid intensity provided.", "error");
            Deno.exit(1);
        }
        await TheCleaner(isVerbose, wantsToUpdate, Deno.args[1] as "normal" | "hard" | "maxim" ?? "normal");
        break;
    case "manager":
        await init();
        await TheManager(Deno.args);
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
        await LogStuff(
            `Unknown command. Use 'clean' or 'manager'. Use '${APP_NAME.CLI} --help' to see the full list of commands.`,
            "what",
            true,
        );
        Deno.exit(1);
}
