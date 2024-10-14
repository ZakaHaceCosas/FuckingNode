import FuckingNodeCleaner from "./clean.ts";
import FuckingNodeManager from "./manage.ts";
import { VERSION, FreshSetup } from "./constants.ts";

const [command] = Deno.args;
const isVerbose = Deno.args[1] === "--verbose";

switch (command) {
    case "clean":
        await FreshSetup();
        await FuckingNodeCleaner(isVerbose);
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
