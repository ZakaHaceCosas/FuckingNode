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
                `Why didn't you provide a valid argument? Remember: ${usage}`,
                "what",
            );
            break;
        case "invalidArgument":
            await LogStuff(
                `BRO IT'S SO ${I_LIKE_JS.MFN} EASY!!\n${usage}\n\nRemember to provide exact path, AKA C:\\Users\\coolDude\\notCoolNodeProject. Must be the root, AKA where your lockfile and node_module DIR live.`,
                "warn",
            );
            break;
    }
}

/**
 * Given a path, returns a number based on if it's a valid Node project or not. It can also return `false` if the DIR does not exist at all.
 *
 * `0` = valid. `1` = not valid, no package.json. `2` = not fully valid, not node_modules. `3` = not fully valid, duplicate.
 *
 * @async
 * @param {string} entry The path.
 * @returns {Promise<0 | 1 | 2 | 3 | false>}
 */
async function validateEntryAsNodeProject(entry: string): Promise<0 | 1 | 2 | 3 | false> {
    const workingEntry = ParsePath("path", entry) as string;
    const list = await GetMotherfuckers();
    const isDuplicate = (list.filter((item) => item === workingEntry).length) >= 1;

    if (!(await CheckForPath(workingEntry))) {
        return false;
    }
    if (isDuplicate) {
        return 3;
    }
    if (!(await CheckForPath(`${workingEntry}/node_modules`))) {
        return 2;
    }
    if (!(await CheckForPath(`${workingEntry}/package.json`))) {
        return 1;
    }
    return 0;
}

/**
 * Adds a new project.
 *
 * @async
 * @param {string} entry Path to the project.
 * @returns {Promise<void>}
 */
async function addEntry(entry: string): Promise<void> {
    const workingEntry = ParsePath("path", entry) as string;
    async function addTheEntry() {
        await Deno.writeTextFile(GetPath("MOTHERFKRS"), `${workingEntry}\n`, {
            append: true,
        });
        await LogStuff(
            `Congrats! ${workingEntry} was added to your list. One mf less to care about!`,
            "tick-clear",
        );
    }
    const validation = await validateEntryAsNodeProject(workingEntry);
    if (validation === 3) {
        await LogStuff(`Bruh, you already added this ${I_LIKE_JS.MF}! ${workingEntry}`, "error");
        return;
    }
    if (validation === 2) {
        const addAnyway = await LogStuff(
            `This path doesn't have a node_modules DIR, so adding it would be useless. Confirm you want to add it.\nPS. You typed: ${workingEntry}`,
            "what",
            undefined,
            true,
        );
        if (!addAnyway) return;
        addTheEntry();
        return;
    }
    if (validation === 1) {
        const addAnyway = await LogStuff(
            `This path doesn't have a package.json. Are you sure it's a node project?\nConfirm you want to add it\nPS. You typed: ${workingEntry}`,
            "what",
            undefined,
            true,
        );
        if (!addAnyway) return;
        addTheEntry();
        return;
    }
    if (validation === false) {
        await LogStuff(`Huh? That path doesn't exist!\nPS. You typed ${workingEntry}, just in case it's a typo.`, "error");
        return;
    }
    addTheEntry();
}

/**
 * Removes a project.
 *
 * @async
 * @param {string} entry
 * @returns {Promise<void>}
 */
async function removeEntry(entry: string): Promise<void> {
    const workingEntry = ParsePath("path", entry) as string;
    const list = await GetMotherfuckers();
    const index = list.indexOf(workingEntry);

    if (list.includes(workingEntry)) {
        if (index !== -1) list.splice(index, 1); // remove only 1st coincidence, to avoid issues
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
 * Cleans up projects that are invalid and probably we won't be able to clean.
 *
 * @async
 * @returns {Promise<0 | 1 | 2>} 0 if success, 1 if no projects to remove, 2 if the user doesn't remove them.
 */
async function CleanProjects(): Promise<0 | 1 | 2> {
    async function GetProjectsToRemove() {
        const list = await GetMotherfuckers();
        const listOfRemovals: string[] = [];

        for (const project of list) {
            const validation = await validateEntryAsNodeProject(project);
            if (validation === 0) continue;
            listOfRemovals.push(project);
        }

        // this should handle duplicates, so all duplicates EXCEPT ONE are removed
        // otherwise, if you have a project duplicate, all entries get removed and you loose it

        // it creates an object where key is the project and the value is (i think) the number of times the project has been found
        const countMap: { [key: string]: number } = {};
        // iterates over the full list of to-be-removed projects to add them with the count of times they've been found
        listOfRemovals.forEach((project: string) => {
            countMap[project] = (countMap[project] || 0) + 1;
        });

        // the array we will return to the user
        const result: string[] = [];
        // for each project of the object, if it exists, we push it, and this somehow returns only one entry per project
        for (const project of Object.keys(countMap)) {
            if (countMap[project] && countMap[project] > 1) result.push(project);
        }
        // (no i didn't write that)

        return result;
    }
    const list = await GetProjectsToRemove();
    if (list.length === 0) {
        await LogStuff(`You're on the clear! Your list doesn't have any wrong ${I_LIKE_JS.MF}`, "tick");
        return 1;
    }
    await LogStuff(
        `We've found issues! We're talking about getting rid of:`,
        "bulb",
    );
    console.log(`\n${list.toString().replaceAll(",", ",\n")}\n`);
    const del = await LogStuff(
        `Will you remove all of these ${I_LIKE_JS.MFS}?`,
        "what",
        undefined,
        true,
    );
    if (!del) {
        await LogStuff(`I don't know why you'd keep those wrong projects, but okay...`, "bruh");
        return 2;
    }
    for (const target of list) {
        await removeEntry(target);
    }
    await LogStuff(`That worked out!`, "tick");
    return 0;
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
    const workingEntry = ParsePath("path", entry) as string;
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
export default async function TheManager(args: string[]) {
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
        case "cleanup":
            await CleanProjects();
            break;
        default:
            Error("invalidArgument");
            Deno.exit(1);
    }
}
