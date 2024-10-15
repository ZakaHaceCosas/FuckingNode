import FuckingNodeCleaner from "./clean.ts";
import FuckingNodeManager from "./manage.ts";
import { HELP, VERSION } from "./constants.ts";
import { CheckForUpdates, FreshSetup, LogStuff } from "./functions.ts";

const [command] = Deno.args;
const flags = Deno.args.map((arg) => {
    return arg.toLowerCase();
});
const isVerbose = flags.includes("--verbose");
const wantsToUpdate = flags.includes("--update");
const wantsMaxim = flags.includes("--maxim");

switch (command ? command.toLowerCase() : "") {
    case "clean":
        await CheckForUpdates();
        await FreshSetup();
        await FuckingNodeCleaner(isVerbose, wantsToUpdate, wantsMaxim);
        break;
    case "manager":
        await CheckForUpdates();
        await FreshSetup();
        await FuckingNodeManager(Deno.args);
        break;
    case "--version":
        await CheckForUpdates();
        console.log(VERSION);
        break;
    case "--help":
        await CheckForUpdates();
        await LogStuff(HELP, "bulb", true);
        break;
    default:
        await LogStuff(
            "Unknown command. Use 'clean' or 'manager'. Use 'fuckingnode --help' to see the list of commands.",
            "what",
            true,
        );
        Deno.exit(1);
}
