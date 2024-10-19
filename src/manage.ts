import { APP_NAME, I_LIKE_JS, IGNORE_FILE } from "./constants.ts";
import { GetMotherfuckers, GetPath, LogStuff } from "./functions.ts";

// function to show messages
async function Error(errorCode: "noArgument" | "invalidArgument") {
    const usage = `Usage:\n${APP_NAME} manager add <path> / remove <path> / ignore <path> / list`;

    switch (errorCode) {
        case "noArgument":
            await LogStuff(
                "Why didn't ya provide an argument? " + usage,
                "what",
            );
            break;
        case "invalidArgument":
            await LogStuff(
                `BRO IT'S SO ${I_LIKE_JS.MFN} EASY!!1!1` + usage +
                    "\n\nRemember to provide exact path, AKA C:\\Users\\coolDude\\notCoolNodeProject. Must be the root, AKA where package-lock.json / pnpm-lock.yaml lives.",
                "warn",
            );
            break;
    }
}

// parse entry
function parseEntry(entry: string): string {
    const cleanEntry = entry.trimEnd().trimStart();
    let cleanerEntry: string;
    if (cleanEntry.endsWith("/") || cleanEntry.endsWith("\\")) {
        cleanerEntry = entry.trimEnd().trimStart().slice(0, -1);
    } else {
        cleanerEntry = entry.trimEnd().trimStart();
    }

    return cleanerEntry;
}

// write new entry to file
async function addEntry(entry: string) {
    const workingEntry = parseEntry(entry);
    const list = await GetMotherfuckers();
    if (list.includes(workingEntry)) {
        await LogStuff(`Bruh, you already added this ${I_LIKE_JS.MF}! ${workingEntry}`, "error");
    } else {
        try {
            await Deno.stat(workingEntry);
            await Deno.writeTextFile(GetPath("MOTHERFKRS"), `${workingEntry}\n`, {
                append: true,
            });
            await LogStuff(
                `Congrats! ${parseEntry(workingEntry)} was added to your list. One mf less to care about!`,
                "tick-clear",
            );
        } catch {
            await LogStuff(`Huh? That path doesn't exist!\nPS. You typed ${workingEntry}, just in case it's a typo.`, "error");
        }
    }
}

// remove entry from file
async function removeEntry(entry: string) {
    const workingEntry = parseEntry(entry);
    let list = await GetMotherfuckers();
    if (list.includes(workingEntry)) {
        list = list.filter((item) => item !== workingEntry);
        if (list.length > 0) {
            await Deno.writeTextFile(
                GetPath("MOTHERFKRS"),
                list.join("\n") + "\n",
            );
            await LogStuff(
                `Let me guess: ${workingEntry} was another "revolutionary cutting edge project" that you're now removing, right?`,
                "tick-clear",
            );
        } else {
            await Deno.remove(GetPath("MOTHERFKRS"));
            await LogStuff("Removed the last entry. The list is now empty.", "moon-face");
        }
    } else {
        await LogStuff(
            `Bruh, that mf doesn't exist yet.\nAnother typo? We took: ${workingEntry}\n(PS. You wrote: ${entry} - input sometimes gets cleaned up)`,
            "error",
        );
    }
}

// list entries
async function listEntries() {
    const list = await GetMotherfuckers();
    if (list.length > 0) {
        await LogStuff(`Here are the ${I_LIKE_JS.MFS} you added so far:\n`, "bulb");
        list.forEach(async (entry) => await LogStuff(entry));
    } else {
        await LogStuff("Bruh, your mfs list is empty! Ain't nobody here!", "moon-face");
    }
}

// ignore a project
async function ignoreEntry(entry: string): Promise<0 | 1 | 2> {
    const workingEntry = parseEntry(entry);
    const pathToIgnoreFile = `${workingEntry}/${IGNORE_FILE}`;

    try {
        await Deno.stat(pathToIgnoreFile);
        LogStuff(`${I_LIKE_JS.MF} is already ignored!`, "error");
        return 2;
    } catch {
        try {
            await Deno.create(pathToIgnoreFile);
            LogStuff(`Divine powers have successfully ignored this ${I_LIKE_JS.MF}`, "tick");
            return 0;
        } catch (e) {
            LogStuff(`Something went ${I_LIKE_JS.FKN} wrong: ${e}`, "error");
            return 1;
        }
    }
}

// run functions based on args
export default async function FuckingNodeManager(args: string[]) {
    if (!args || args.length === 0) {
        Error("noArgument");
        Deno.exit(1);
    }

    const command = args[1];
    const entry = args[2] ? args[2].trim() : null;

    if (!command) {
        Error("noArgument");
        return;
    }

    switch (command.toLowerCase()) {
        case "add":
            if (!entry || entry === null) {
                Error("invalidArgument");
                return;
            }
            await addEntry(entry);
            break;
        case "remove":
            if (!entry || entry === null) {
                Error("invalidArgument");
                return;
            }
            await removeEntry(entry);
            break;
        case "ignore":
            if (!entry || entry === null) {
                Error("invalidArgument");
                return;
            }
            await ignoreEntry(entry);
            break;
        case "list":
            await listEntries();
            break;
        default:
            Error("invalidArgument");
            Deno.exit(1);
    }
}
