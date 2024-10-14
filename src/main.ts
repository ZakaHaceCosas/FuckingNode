import FuckingNodeCleaner from "./clean.ts";
import FuckingNodeManager from "./manage.ts";

const [command] = Deno.args;

switch (command) {
    case "clean":
        await FuckingNodeCleaner();
        break;
    case "manager":
        await FuckingNodeManager(Deno.args);
        break;
    default:
        console.error("Unknown command. Use 'clean' or 'manager'.");
        Deno.exit(1);
}
