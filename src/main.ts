import TheCleaner from "./clean.ts";
import TheManager from "./manage.ts";
import { APP_NAME, HELP, VERSION } from "./constants.ts";
import { CheckForUpdates, FreshSetup, LogStuff } from "./functions.ts";
import GetFuckingStats from "./stats.ts";
import TheMigrator from "./migrate.ts";
import type { MANAGERS } from "./types.ts";

const [command] = Deno.args;
const flags = Deno.args.map((arg) => {
    return arg.toLowerCase();
});

const isVerbose = flags.includes("--verbose");
const wantsToUpdate = flags.includes("--update");
const wantsMaxim = flags.includes("--maxim");

const statsModular = flags.includes("--full");

async function init(update?: boolean) {
    await CheckForUpdates(update);
    await FreshSetup();
}

switch (command ? command.toLowerCase() : "") {
    case "clean":
        await init();
        await TheCleaner(isVerbose, wantsToUpdate, wantsMaxim);
        break;
    case "manager":
        await init();
        await TheManager(Deno.args);
        break;
    case "stats":
        await init();
        await GetFuckingStats(statsModular);
        break;
    case "migrate":
        await init();
        await TheMigrator(Deno.args[1]!, Deno.args[2]! as MANAGERS);
        break;
    case "--version":
        await init();
        console.log(VERSION);
        break;
    case "--help":
    case "-h":
    case "help":
    case "-help":
        await init();
        await LogStuff(HELP, undefined, true);
        break;
    case "self-update":
        await init(true);
        break;
    default:
        await LogStuff(
            `Unknown command. Use 'clean' or 'manager'. Use '${APP_NAME.CLI} --help' to see the full list of commands.`,
            "what",
            true,
        );
        Deno.exit(1);
}
