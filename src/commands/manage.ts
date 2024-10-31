import { expandGlob } from "@std/fs";
import { I_LIKE_JS, IGNORE_FILE } from "../constants.ts";
import type { CONFIG_FILES, PkgJson } from "../types.ts";
import { ErrorMessage, LogStuff, ParseFlag } from "../functions/io.ts";
import { CheckForPath, JoinPaths, ParsePath } from "../functions/filesystem.ts";
import { GetAllProjects, NameProject } from "../functions/projects.ts";
import TheHelper from "./help.ts";

/**
 * Given a path, returns a number based on if it's a valid Node project or not.
 *
 * `0` = valid. `1` = not valid, no package.json. `2` = not fully valid, not node_modules. `3` = not fully valid, duplicate. `4` = path doesn't exist. `5` | `6` = project uses an unsupported runtime (5 = Deno, 6 = Bun).
 *
 * @async
 * @param {string} entry Path to the project.
 * @returns {Promise<0 | 1 | 2 | 3 | 4>}
 */
async function ValidateNodeProject(entry: string, appPaths: CONFIG_FILES): Promise<0 | 1 | 2 | 3 | 4 | 5 | 6> {
    const workingEntry = await ParsePath(entry);
    const list = await GetAllProjects(appPaths);
    const isDuplicate = (list.filter((item) => item === workingEntry).length) > 1;

    if (!(await CheckForPath(workingEntry))) {
        return 4;
    }
    if (isDuplicate) {
        return 3;
    }
    if (!(await CheckForPath(await JoinPaths(workingEntry, "node_modules")))) {
        return 2;
    }
    if (!(await CheckForPath(await JoinPaths(workingEntry, "package.json")))) {
        if (await CheckForPath(await JoinPaths(workingEntry, "bun.lockb"))) { // we use bun's lockfile as, AFAIK, it doesn't have its own package file
            return 6;
        }
        if (await CheckForPath(await JoinPaths(workingEntry, "deno.json"))) {
            return 5;
        }
        return 1;
    }
    return 0;
}

/**
 * Checks for workspaces within a Node project.
 *
 * @async
 * @param {string} pkgJsonPath Path to the package.json file.
 * @returns {Promise<string[] | null>}
 */
async function GetWorkspaces(pkgJsonPath: string): Promise<string[] | null> {
    try {
        if (!(await CheckForPath(await ParsePath(pkgJsonPath)))) throw new Error("Requested path doesn't exist.");

        const pkgJson: PkgJson = JSON.parse(await Deno.readTextFile(pkgJsonPath));

        const absoluteWorkspaces: string[] = [];

        const workspacePaths = Array.isArray(pkgJson.workspaces) ? pkgJson.workspaces : pkgJson.workspaces?.packages;

        if (!workspacePaths) return null;

        for (const path of workspacePaths) {
            for await (const dir of expandGlob(path)) {
                if (dir.isDirectory) {
                    absoluteWorkspaces.push(dir.path);
                }
            }
        }

        return absoluteWorkspaces;
    } catch (e) {
        await LogStuff(`Error looking for workspaces: ${e}`, "error");
        return null;
    }
}

/**
 * Adds a new project.
 *
 * @async
 * @param {string} entry Path to the project.
 * @returns {Promise<void>}
 */
async function AddProject(entry: string, appPaths: CONFIG_FILES): Promise<void> {
    const workingEntry = await ParsePath(entry);
    const projectName = await NameProject(workingEntry);

    async function addTheEntry() {
        await Deno.writeTextFile(appPaths.projects, `${workingEntry}\n`, {
            append: true,
        });
        await LogStuff(
            `Congrats! ${projectName} was added to your list. One mf less to care about!`,
            "tick-clear",
        );
    }

    const validation = await ValidateNodeProject(workingEntry, appPaths);

    if (validation === 3) {
        await LogStuff(`Bruh, you already added this ${I_LIKE_JS.MF}! (${projectName})`, "error");
        return;
    }
    if (validation === 2) {
        const addAnyway = await LogStuff(
            `${projectName} doesn't have a node_modules DIR, so adding it would be kinda useless. Confirm you want to add it.\nPS. You typed: ${workingEntry}`,
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
            `This path doesn't have a package.json. Are you sure it's a Node project?\nConfirm you want to add it\nPS. You typed: ${workingEntry}`,
            "what",
            undefined,
            true,
        );
        if (!addAnyway) return;
        addTheEntry();
        return;
    }
    if (validation === 4) {
        await LogStuff(`Huh? That path doesn't exist!\nPS. You typed ${workingEntry}, just in case it's a typo.`, "error");
        return;
    }
    if (validation === 5) {
        await LogStuff(
            `The Deno runtime? You got a good taste for choosing a JS runtime. Sadly we don't support Deno... yet.`,
            "bruh",
        );
        return;
    }
    if (validation === 6) {
        await LogStuff(
            `The Bun runtime? We don't support that... yet.`,
            "bruh",
        );
        return;
    }

    const workspaces = await GetWorkspaces(await JoinPaths(workingEntry, "package.json"));

    if (!workspaces) {
        addTheEntry();
        return;
    }

    const addWorkspaces = await LogStuff(
        `Hey! This looks like a ${I_LIKE_JS.FKN} monorepo. We've found these Node workspaces:\n\n${
            workspaces.map(async (thingy) => {
                return await NameProject(thingy);
            })
        }.\n\nShould we add them to your list as well, so they're all cleaned?`,
        "bulb",
        undefined,
        true,
    );

    if (!addWorkspaces) {
        addTheEntry();
        return;
    }

    await Deno.writeTextFile(appPaths.projects, `${workingEntry}\n`, {
        append: true,
    });
    for (const workspace of workspaces) {
        await Deno.writeTextFile(appPaths.projects, `${workspace}\n`, {
            append: true,
        });
    }

    await LogStuff(`Added all of your projects. Many mfs less to care about!`, "tick-clear");
    return;
}

/**
 * Removes a project.
 *
 * @async
 * @param {string} entry
 * @returns {Promise<void>}
 */
async function RemoveProject(entry: string, appPaths: CONFIG_FILES): Promise<void> {
    const workingEntry = await ParsePath(entry);
    const list = await GetAllProjects(appPaths);
    const index = list.indexOf(workingEntry);

    if (list.includes(workingEntry)) {
        if (index !== -1) list.splice(index, 1); // remove only 1st coincidence, to avoid issues
        if (list.length > 0) {
            await Deno.writeTextFile(
                appPaths.projects,
                list.join("\n") + "\n",
            );
            await LogStuff(
                `Let me guess: ${await NameProject(
                    workingEntry,
                )} was another "revolutionary cutting edge project" that you're now removing, right?`,
                "tick-clear",
            );
        } else {
            await Deno.remove(appPaths.projects);
            await LogStuff("Removed the last entry. The list is now empty.", "moon-face");
        }
    } else {
        await LogStuff(
            `Bruh, that mf doesn't exist yet.\nAnother typo? We took: ${workingEntry}`,
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
async function CleanProjects(appPaths: CONFIG_FILES): Promise<0 | 1 | 2> {
    async function GetProjectsToRemove() {
        const list = await GetAllProjects(appPaths);
        const listOfRemovals: string[] = [];

        for (const project of list) {
            const validation = await ValidateNodeProject(project, appPaths);
            if (validation !== 0) listOfRemovals.push(project);
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
            if (countMap[project] && countMap[project] >= 1) result.push(project);
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
    // doesn't use NameProject as it's likely to point to an invalid path
    await LogStuff(`\n${list.toString().replaceAll(",", ",\n")}\n`, undefined, true);
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
        await RemoveProject(target, appPaths);
    }
    await LogStuff(`That worked out!`, "tick");
    return 0;
}

/**
 * Lists all projects.
 *
 * @async
 * @param {boolean} ignoredOnly If true, only ignored projects will be shown.
 * @returns {Promise<void>}
 */
async function ListProjects(ignoredOnly: boolean, appPaths: CONFIG_FILES): Promise<void> {
    const list = await GetAllProjects(appPaths);
    if (list.length === 0) {
        await LogStuff("Bruh, your mfs list is empty! Ain't nobody here!", "moon-face");
        return;
    }
    if (!ignoredOnly) {
        await LogStuff(`Here are the ${I_LIKE_JS.MFS} you added so far:\n`, "bulb");
        list.forEach(async (entry) => await LogStuff(await NameProject(entry)));
        return;
    }
    await LogStuff(`Here are the ${I_LIKE_JS.MFS} you ignored so far:\n`, "bulb");
    list.forEach(async (entry) => {
        if (!(await CheckForPath(await JoinPaths(entry, IGNORE_FILE)))) return;
        await LogStuff(await NameProject(entry));
    });
    return;
}

/**
 * Ignores (or stops ignoring) a project by adding (or removing) a `.fknodeignore` file to it's root.
 *
 * @async
 * @param {boolean} ignore True if you want to ignore, false if you want to stop ignoring.
 * @param {string} entry The path to the project's root.
 * @returns {Promise<0 | 1 | 2>} 0 if success, 1 if failure (will log the error), 2 if the project's status is not valid (e.g. ignoring an already ignored project or stop ignoring a project that was not ignored).
 */
async function HandleIgnoreProject(ignore: boolean, entry: string): Promise<0 | 1 | 2> {
    try {
        const workingEntry = await ParsePath(entry);
        const pathToIgnoreFile = JoinPaths(workingEntry, IGNORE_FILE);

        if (ignore) {
            if (await CheckForPath(await pathToIgnoreFile)) {
                LogStuff(`${I_LIKE_JS.MF} is already ignored!`, "error");
                return 2;
            } else {
                try {
                    await Deno.create(await pathToIgnoreFile);
                    LogStuff(`Divine powers have successfully ignored this ${I_LIKE_JS.MF}`, "tick");
                    return 0;
                } catch (e) {
                    LogStuff(`Something went ${I_LIKE_JS.FKN} wrong: ${e}`, "error");
                    return 1;
                }
            }
        } else if (!ignore) {
            if (!(await CheckForPath(await pathToIgnoreFile))) {
                LogStuff(`${I_LIKE_JS.MF} isn't ignored yet!`, "error");
                return 2;
            } else {
                try {
                    await Deno.remove(await pathToIgnoreFile);
                    LogStuff(`Divine powers have abandoned this ${I_LIKE_JS.MF}`, "tick");
                    return 0;
                } catch (e) {
                    LogStuff(`Something went ${I_LIKE_JS.FKN} wrong: ${e}`, "error");
                    return 1;
                }
            }
        } else {
            throw new Error("Whether to ignore or stop ignoring wasn't correctly specified.");
        }
    } catch (e) {
        await LogStuff(`Error: ${e}`, "error");
        throw e;
    }
}

// run functions based on args
export default async function TheManager(args: string[], CF: CONFIG_FILES) {
    if (!args || args.length === 0) {
        await TheHelper("manager");
        Deno.exit(1);
    }

    const command = args[1];
    const secondArg = args[2] ? args[2].trim() : null;

    if (!command) {
        await TheHelper("manager");
        return;
    }

    switch (command.toLowerCase()) {
        case "add":
            if (!secondArg || secondArg === null) {
                ErrorMessage("Manager__ProjectInteractionInvalidCauseNoPathProvided");
                return;
            }
            await AddProject(secondArg, CF);
            break;
        case "remove":
            if (!secondArg || secondArg === null) {
                ErrorMessage("Manager__ProjectInteractionInvalidCauseNoPathProvided");
                return;
            }
            await RemoveProject(secondArg, CF);
            break;
        case "ignore":
            if (!secondArg || secondArg === null) {
                ErrorMessage("Manager__ProjectInteractionInvalidCauseNoPathProvided");
                return;
            }
            await HandleIgnoreProject(true, secondArg);
            break;
        case "revive":
            if (!secondArg || secondArg === null) {
                await ErrorMessage("Manager__ProjectInteractionInvalidCauseNoPathProvided");
                return;
            }
            await HandleIgnoreProject(false, secondArg);
            break;
        case "list":
            await ListProjects(ParseFlag("ignored", false).includes(secondArg ?? ""), CF);
            break;
        case "cleanup":
            await CleanProjects(CF);
            break;
        default:
            await ErrorMessage("Manager__InvalidArgumentPassed");
            Deno.exit(1);
    }
}
