import FuckingNodeCleaner from "./clean.ts";
import FuckingNodeManager from "./manage.ts";
import { APP_NAME, HELP, VERSION } from "./constants.ts";
import { CheckForUpdates, FreshSetup, LogStuff } from "./functions.ts";
import GetFuckingStats from "./stats.ts";

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
        await FuckingNodeCleaner(isVerbose, wantsToUpdate, wantsMaxim);
        break;
    case "manager":
        await init();
        await FuckingNodeManager(Deno.args);
        break;
    case "stats":
        await init();
        await GetFuckingStats(statsModular);
        break;
    case "--version":
        await init();
        console.log(VERSION);
        break;
    case "--help":
        await init();
        await LogStuff(HELP, "bulb", true);
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
