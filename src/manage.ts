import { GetPath, LogStuff } from "./constants.ts";

// function to show messages
async function Error(errorCode: "noArgument" | "invalidArgument") {
    const usage = "Usage: fuckingNode manager add `projectPathHere` / remove `projectPathHere` / list";

    switch (errorCode) {
        case "noArgument":
            await LogStuff(
                "Why didn't ya provide an argument? " + usage,
                "what",
            );
            break;
        case "invalidArgument":
            await LogStuff(
                "BRO IT'S SO MOTHERFUCKING EASY!!1!1 " + usage +
                    "\n\nRemember to provide exact path, AKA C:\\Users\\coolDude\\notCoolNodeProject. Must be the root, AKA where package-lock.json / pnpm-lock.yaml lives.",
                "warn",
            );
            break;
    }
}

// read file content
async function getList() {
    try {
        const content = await Deno.readTextFile(GetPath("MOTHERFUCKERS"));
        return content.split("\n").filter(Boolean);
    } catch (error) {
        await LogStuff(
            `Failed to read the file: ${GetPath("MOTHERFUCKERS")} - ${error}`,
            "error",
        );
        Deno.exit(1);
    }
}

// write new entry to file
async function addEntry(entry: string) {
    const list = await getList();
    if (list.includes(entry)) {
        await LogStuff(`Bruh, you already added this motherfucker! ${entry}`, "error");
    } else {
        const cleanEntry = entry.trimEnd().trimStart();
        let cleanerEntry: string;
        if (cleanEntry.endsWith("/") || cleanEntry.endsWith("\\")) {
            cleanerEntry = entry.trimEnd().trimStart().slice(0, -1);
        } else {
            cleanerEntry = entry.trimEnd().trimStart();
        }
        await Deno.writeTextFile(GetPath("MOTHERFUCKERS"), `${cleanerEntry}\n`, {
            append: true,
        });
        await LogStuff(`Congrats! ${cleanerEntry} was added to your list. One mf less to care about!`, "tick-clear");
    }
}

// remove entry from file
async function removeEntry(entry: string) {
    let list = await getList();
    if (list.includes(entry)) {
        list = list.filter((item) => item !== entry);
        if (list.length > 0) {
            await Deno.writeTextFile(
                GetPath("MOTHERFUCKERS"),
                list.join("\n") + "\n",
            );
            await LogStuff(
                `Let me guess: ${entry} was another "revolutionary cutting edge project" that you're now removing, right?`,
                "tick-clear",
            );
        } else {
            await Deno.remove(GetPath("MOTHERFUCKERS"));
            await LogStuff("Removed the last entry. The list is now empty.", "moon-face");
        }
    } else {
        await LogStuff(
            `Bruh, that mf doesn't exist yet.\nAnother typo? You wrote: ${entry}`,
            "error",
        );
    }
}

// list entries
async function listEntries() {
    const list = await getList();
    if (list.length > 0) {
        await LogStuff("Here are the motherfuckers you added so far:\n", "bulb");
        list.forEach(async (entry) => await LogStuff(entry));
    } else {
        await LogStuff("Bruh, your mfs list is empty! Ain't nobody here!", "moon-face");
    }
}

// run functions based on args
export default async function FuckingNodeManager(args: string[]) {
    if (args.length === 0 || args.length === 1) {
        // 1 argument equals "manager" with no arg, so it also flags the noArgument error
        Error("noArgument");
        Deno.exit(1);
    }

    const command = args[1];
    const entry = args[2]?.trim();

    switch (command.toLowerCase()) {
        case "add":
            if (entry) {
                await addEntry(entry);
            } else {
                Error("invalidArgument");
            }
            break;
        case "remove":
            if (entry) {
                await removeEntry(entry);
            } else {
                Error("invalidArgument");
            }
            break;
        case "list":
            await listEntries();
            break;
        default:
            Error("invalidArgument");
            Deno.exit(1);
    }
}
