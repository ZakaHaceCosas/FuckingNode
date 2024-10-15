// app version
export const VERSION = "1.0.1";

// supported lockfile types
export type SUPPORTED_LOCKFILE =
    | "package-lock.json"
    | "pnpm-lock.yaml"
    | "yarn.lock";

// help
const _USAGE = {
    clean: "    clean   [--update] [--verbose]",
    add: "    manager add <item> | remove <item> | list",
    version: "            [--version]",
    help: "            [--help]",
};
const USAGE = _USAGE.clean +
    "\n" +
    _USAGE.add +
    "\n" +
    _USAGE.version +
    "\n" +
    _USAGE.help;
const _OPTIONS = {
    version: "    --version    Show the version of FuckingNode you're currently on.",
};
const OPTIONS = _OPTIONS.version;
const _CLEAN_OPTIONS = {
    update: "    --update     Update all your projects before cleaning them.",
    verbose: "    --verbose    Show more detailed ('verbose') logs.",
    maxim: "    --maxim      Maxim clean all projects (recursively remove node_modules/).",
};
const CLEAN_OPTIONS = _CLEAN_OPTIONS.update +
    "\n" +
    _CLEAN_OPTIONS.verbose +
    "\n" +
    _CLEAN_OPTIONS.maxim;
export const HELP = "Usage: fuckingnode\n" +
    USAGE +
    "\n\nClean options:\n" +
    CLEAN_OPTIONS +
    "\n\nOptions:\n" +
    OPTIONS;

// get path (a constant if you think abt it)
export function GetPath(path: "BASE" | "MOTHERFUCKERS" | "LOGS"): string {
    const appDataPath = Deno.env.get("APPDATA");
    if (!appDataPath) {
        console.error(
            "Motherfucking APPDATA variable not found. Something seriously went motherfucking wrong.",
        );
        Deno.exit(1);
    }

    const BASE_DIR = `${appDataPath}/FuckingNode/`;
    const MOTHERFUCKERS_DIR = `${BASE_DIR}/fuckingNode-motherfuckers.txt`;
    const LOGS_DIR = `${BASE_DIR}/fuckingNode-Logs.log`;

    switch (path) {
        case "BASE":
            return BASE_DIR;
        case "MOTHERFUCKERS":
            return MOTHERFUCKERS_DIR;
        case "LOGS":
            return LOGS_DIR;
        default:
            throw new Error("Invalid path requested");
    }
}

// create files if they don't exist (fresh setup)
export async function FreshSetup(): Promise<void> {
    try {
        await Deno.mkdir(GetPath("BASE"), { recursive: true });

        try {
            await Deno.stat(GetPath("MOTHERFUCKERS"));
        } catch {
            await Deno.writeTextFile(GetPath("MOTHERFUCKERS"), "");
        }

        try {
            await Deno.stat(GetPath("LOGS"));
        } catch {
            await Deno.writeTextFile(GetPath("LOGS"), "");
        }
    } catch (error) {
        console.error(`Error with FreshSetup: ${error}`);
        Deno.exit(1);
    }
}

// function to log messages
export async function LogStuff(message: string, emoji?: SUPPORTED_EMOJIS) {
    const finalMessage = emoji ? Emojify(message, emoji) : message;
    console.log(finalMessage);

    try {
        const logged = `${finalMessage} ... @ ${new Date().toLocaleString()}` + "\n";

        await Deno.writeTextFile(GetPath("LOGS"), logged, {
            append: true,
        });
    } catch (e) {
        console.error(`Error logging stuff: ${e}`);
    }
}

type SUPPORTED_EMOJIS =
    | "danger"
    | "prohibited"
    | "wip"
    | "what"
    | "bulb"
    | "tick"
    | "tick-clear"
    | "error"
    | "heads-up"
    | "working"
    | "moon-face"
    | "bruh"
    | "warn"
    | "package"
    | "trash"
    | "chart";

// emojis
export function Emojify(message: string, emoji: SUPPORTED_EMOJIS): string {
    switch (emoji) {
        case "danger":
            return `🛑 ${message}`;
        case "prohibited":
            return `⛔ ${message}`;
        case "wip":
            return `🚧 ${message}`;
        case "what":
            return `❓ ${message}`;
        case "bulb":
            return `💡 ${message}`;
        case "tick":
            return `✅ ${message}`;
        case "tick-clear":
            return `✔ ${message}`;
        case "error":
            return `❌ ${message}`;
        case "warn":
            return `⚠️ ${message}`;
        case "heads-up":
            return `🚨 ${message}`;
        case "working":
            return `🔄 ${message}`;
        case "moon-face":
            return `🌚 ${message}`;
        case "bruh":
            return `😐 ${message}`;
        case "package":
            return `📦 ${message}`;
        case "trash":
            return `🗑 ${message}`;
        case "chart":
            return `📊 ${message}`;
        default:
            return message;
    }
}
