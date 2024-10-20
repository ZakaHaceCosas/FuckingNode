import { APP_NAME, I_LIKE_JS, IGNORE_FILE } from "./constants.ts";
import { CheckForPath, GetMotherfuckers, GetPath, LogStuff, ParsePath } from "./functions.ts";

/**
 * Shorthand function to show errors in here.
 *
 * @async
 * @param {("noArgument" | "invalidArgument")} errorCode
 * @returns {Promise<void>}
 */
async function Error(errorCode: "noArgument" | "invalidArgument"): Promise<void> {
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

/**
 * Adds a new project.
 *
 * @async
 * @param {string} entry
 * @returns {Promise<void>}
 */
async function addEntry(entry: string): Promise<void> {
    const workingEntry = ParsePath("list", entry) as string;
    const list = await GetMotherfuckers();
    if (list.includes(workingEntry)) {
        await LogStuff(`Bruh, you already added this ${I_LIKE_JS.MF}! ${workingEntry}`, "error");
    } else {
        if (!(await CheckForPath(workingEntry))) {
            await LogStuff(`Huh? That path doesn't exist!\nPS. You typed ${workingEntry}, just in case it's a typo.`, "error");
        }
        await Deno.writeTextFile(GetPath("MOTHERFKRS"), `${workingEntry}\n`, {
            append: true,
        });
        await LogStuff(
            `Congrats! ${workingEntry} was added to your list. One mf less to care about!`,
            "tick-clear",
        );
    }
}

/**
 * Removes a project.
 *
 * @async
 * @param {string} entry
 * @returns {Promise<void>}
 */
async function removeEntry(entry: string): Promise<void> {
    const workingEntry = ParsePath("list", entry) as string;
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

/**
 * Lists all projects.
 *
 * @async
 * @returns {Promise<void>}
 */
async function listEntries(): Promise<void> {
    const list = await GetMotherfuckers();
    if (list.length > 0) {
        await LogStuff(`Here are the ${I_LIKE_JS.MFS} you added so far:\n`, "bulb");
        list.forEach(async (entry) => await LogStuff(entry));
    } else {
        await LogStuff("Bruh, your mfs list is empty! Ain't nobody here!", "moon-face");
    }
}

/**
 * Ignores a project by adding a `.fknodeignore` file to it's root.
 *
 * @async
 * @param {string} entry The path to the project's root.
 * @returns {Promise<0 | 1 | 2>} 0 if success, 1 if failure (will log the error), 2 if the project's already ignored.
 */
async function ignoreEntry(entry: string): Promise<0 | 1 | 2> {
    const workingEntry = ParsePath("list", entry) as string;
    const pathToIgnoreFile = `${workingEntry}/${IGNORE_FILE}`;

    if (await CheckForPath(pathToIgnoreFile)) {
        LogStuff(`${I_LIKE_JS.MF} is already ignored!`, "error");
        return 2;
    } else {
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
