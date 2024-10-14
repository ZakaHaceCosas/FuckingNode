// app version
export const VERSION = "1.0.1";

const _USAGE = {
    clean: "    clean   [--update] [--verbose]",
    add: "    manager add <item> | remove <item> | list",
    version: "            [--version]"
}
const USAGE = _USAGE.clean + "\n" + _USAGE.add + "\n" + _USAGE.version
const _OPTIONS = {
    update: "    --update     Update all your projects before cleaning them.",
    verbose: "    --verbose    Show more detailed ('verbose') logs.",
    version: "    --version    Show the version of FuckingNode you're currently on."
}
const OPTIONS = _OPTIONS.update + "\n" + _OPTIONS.verbose + "\n" + _OPTIONS.version
export const HELP = "Usage: fuckingnode\n" + USAGE + "\n\nOptions:\n" + OPTIONS

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
export async function LogStuff(message: string) {
    console.log(message);
    try {
        const logged = `${message} ... @ ${new Date().toLocaleString()}` + "\n";

        await Deno.writeTextFile(GetPath("LOGS"), logged, {
            append: true,
        });
    } catch (e) {
        console.error(`Error logging stuff: ${e}`);
    }
}
