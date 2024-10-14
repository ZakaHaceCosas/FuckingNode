import FuckingNodeCleaner from "./clean.ts";
import FuckingNodeManager from "./manage.ts";
import { FreshSetup, VERSION } from "./constants.ts";

const [command] = Deno.args;
const isVerbose = Deno.args[1].toLowerCase() === "--verbose";
const wantsToUpdate = Deno.args[2].toLowerCase() === "--update";

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
    default:
        console.error("Unknown command. Use 'clean' or 'manager'.");
        Deno.exit(1);
}
