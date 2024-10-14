import FuckingNodeCleaner from "./clean.ts";
import FuckingNodeManager from "./manage.ts";
import { FreshSetup, VERSION, HELP } from "./constants.ts";

const [command] = Deno.args;
const flags = Deno.args.map((arg) => {
    return arg.toLowerCase();
});
const isVerbose = flags.includes("--verbose");
const wantsToUpdate = flags.includes("--update");

switch (command.toLowerCase()) {
    case "clean":
        await FreshSetup();
        await FuckingNodeCleaner(isVerbose, wantsToUpdate);
        break;
    case "manager":
        await FreshSetup();
        await FuckingNodeManager(Deno.args);
        break;
    case "--version":
        console.log(VERSION);
        break;
    case "--help":
        console.log(HELP);
        break;
    default:
        console.error("Unknown command. Use 'clean' or 'manager'.");
        Deno.exit(1);
}
