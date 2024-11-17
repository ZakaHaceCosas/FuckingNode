import { I_LIKE_JS, IGNORE_FILE } from "../constants.ts";
import type { CONFIG_FILES } from "../types.ts";
import { ColorString, ErrorMessage, LogStuff, ParseFlag } from "../functions/io.ts";
import { CheckForPath, JoinPaths, ParsePath } from "../functions/filesystem.ts";
import { CheckDivineProtection, GetAllProjects, GetWorkspaces, NameProject, ValidateProject } from "../functions/projects.ts";
import TheHelper from "./help.ts";
import GenericErrorHandler from "../utils/error.ts";

/**
 * Adds a new project.
 *
 * @async
 * @param {string} entry Path to the project.
 * @returns {Promise<void>}
 */
async function AddProject(
    entry: string,
    appPaths: CONFIG_FILES,
): Promise<void> {
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

    const validation = await ValidateProject(appPaths, workingEntry);

    if (validation === "NonExistingPath") {
        await LogStuff(
            `Huh? That path doesn't exist!\nPS. You typed ${workingEntry}, just in case it's a typo.`,
            "error",
        );
        return;
    }
    if (validation === "IsDuplicate") {
        await LogStuff(
            `Bruh, you already added this ${I_LIKE_JS.MF}! (${projectName})`,
            "error",
        );
        return;
    }
    if (validation === "NoPkgJson") {
        const addAnyway = await LogStuff(
            `This path doesn't have a package.json. Are you sure it's a Node project?\nConfirm you want to add it\nPS. You typed: ${workingEntry}`,
            "what",
            undefined,
            true,
        );
        if (!addAnyway) return;
        await addTheEntry();
        return;
    }
    if (validation === "IsCoolDeno") {
        const addAnyway = await LogStuff(
            // says 'good choice' because it's the same runtime as F*ckingNode. its not a real opinion lmao
            // idk whats better, deno or bun. i have both installed, i could try. one day, maybe.
            `This project uses the Deno runtime (good choice btw). It's not *fully* supported *yet*. Add anyway?`,
            "what",
            undefined,
            true,
        );
        if (!addAnyway) return;
        await addTheEntry();
        return;
    }
    if (validation === "IsBun") {
        const addAnyway = await LogStuff(
            `This project uses the Bun runtime. It's not *fully* supported *yet*. Add anyway?`,
            "what",
            undefined,
            true,
        );
        if (!addAnyway) return;
        await addTheEntry();
        return;
    }

    const workspaces = await GetWorkspaces(
        await JoinPaths(workingEntry, "package.json"),
    );

    if (!workspaces) {
        await addTheEntry();
        return;
    }

    const addWorkspaces = await LogStuff(
        `Hey! This looks like a ${I_LIKE_JS.FKN} monorepo. We've found these Node workspaces:\n\n${
            workspaces.map(
                async (thingy) => {
                    return await NameProject(thingy);
                },
            )
        }.\n\nShould we add them to your list as well, so they're all cleaned?`,
        "bulb",
        undefined,
        true,
    );

    if (!addWorkspaces) {
        await addTheEntry();
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

    await LogStuff(
        `Added all of your projects. Many mfs less to care about!`,
        "tick-clear",
    );
    return;
}

/**
 * Removes a project.
 *
 * @async
 * @param {string} entry
 * @returns {Promise<void>}
 */
async function RemoveProject(
    entry: string,
    appPaths: CONFIG_FILES,
): Promise<void> {
    const workingEntry = await ParsePath(entry);
    const list = await GetAllProjects(appPaths);
    const index = list.indexOf(workingEntry);

    if (list.includes(workingEntry)) {
        if (index !== -1) list.splice(index, 1); // remove only 1st coincidence, to avoid issues
        if (list.length > 0) {
            await Deno.writeTextFile(appPaths.projects, list.join("\n") + "\n");
            await LogStuff(
                `Let me guess: ${await NameProject(
                    workingEntry,
                )} was another "revolutionary cutting edge project" that you're now removing, right?`,
                "tick-clear",
            );
        } else {
            await Deno.remove(appPaths.projects);
            await LogStuff(
                "Removed the last entry. The list is now empty.",
                "moon-face",
            );
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
            const validation = await ValidateProject(appPaths, project);
            if (validation !== true) listOfRemovals.push(project);
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
            if (countMap[project] && countMap[project] >= 1) {
                result.push(project);
            }
        }
        // (no i didn't write that)

        return result;
    }
    const list = await GetProjectsToRemove();
    if (list.length === 0) {
        await LogStuff(
            `You're on the clear! Your list doesn't have any wrong ${I_LIKE_JS.MF}`,
            "tick",
        );
        return 1;
    }
    await LogStuff(
        `We've found issues! We're talking about getting rid of:`,
        "bulb",
    );
    // doesn't use NameProject as it's likely to point to an invalid path
    for (const idiot of list) {
        await LogStuff(
            `\n${idiot} ${ColorString("Code: " + (await ValidateProject(appPaths, idiot)), "half-opaque")}\n`,
            undefined,
            true,
        );
    }
    const del = await LogStuff(
        `Will you remove all of these ${I_LIKE_JS.MFS}?`,
        "what",
        undefined,
        true,
    );
    if (!del) {
        await LogStuff(
            `I don't know why you'd keep those wrong projects, but okay...`,
            "bruh",
        );
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
async function ListProjects(
    ignoredOnly: boolean,
    appPaths: CONFIG_FILES,
): Promise<void> {
    try {
        const list = await GetAllProjects(appPaths);
        list.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        if (list.length === 0) {
            await LogStuff(
                "Bruh, your mfs list is empty! Ain't nobody here!",
                "moon-face",
            );
            return;
        }

        if (ignoredOnly) {
            const ignoreList: string[] = [];

            for (const entry of list) {
                const protection = await CheckDivineProtection(entry);
                if (!protection) continue;
                ignoreList.push(entry);
            }

            if (ignoreList.length === 0) {
                await LogStuff(
                    "Huh, you didn't ignore anything! Good to see you care about all your projects (not for long, I can bet).",
                    "moon-face",
                );
                return;
            }

            await LogStuff(
                `Here are the ${I_LIKE_JS.MFS} you added (and ignored) so far:\n`,
                "bulb",
            );
            for (const entry of ignoreList) {
                await LogStuff(await NameProject(entry));
            }

            return;
        }

        await LogStuff(
            `Here are the ${I_LIKE_JS.MFS} you added so far:\n`,
            "bulb",
        );
        for (const entry of list) {
            await LogStuff(await NameProject(entry));
        }
        return;
    } catch (e) {
        await GenericErrorHandler(e);
    }
}

/**
 * Ignores (or stops ignoring) a project by adding (or removing) a `.fknodeignore` file to it's root.
 *
 * @async
 * @param {boolean} ignore True if you want to ignore, false if you want to stop ignoring.
 * @param {string} entry The path to the project's root.
 * @param {string} ignoranceLevel Allows to specify whether this project should ignore updates, cleanup, or both, by writing stuff to the ignore file.
 * @returns {Promise<0 | 1 | 2>} 0 if success, 1 if failure (will log the error), 2 if the project's status is not valid (e.g. ignoring an already ignored project or stop ignoring a project that was not ignored).
 */
async function HandleIgnoreProject(
    ignore: boolean,
    entry: string,
    ignoranceLevel: "updater" | "cleanup" | "*",
): Promise<0 | 1 | 2> {
    try {
        const workingEntry = await ParsePath(entry);
        const pathToIgnoreFile = await JoinPaths(workingEntry, IGNORE_FILE);
        const hasIgnoreFile = await CheckForPath(pathToIgnoreFile);

        // const currentLevels = hasIgnoreFile ? (await Deno.readTextFile(pathToIgnoreFile)).split(".\n") : [];

        if (ignore === true) {
            try {
                let toWrite: string[];
                if (ignoranceLevel === "*") {
                    toWrite = ["*"];
                } else {
                    toWrite = [ignoranceLevel];
                }

                /* else if (!currentLevels.includes(ignoranceLevel) && !currentLevels.includes("*")) */

                if (toWrite.toString() === (await CheckDivineProtection(workingEntry))) throw 1;

                await Deno.writeTextFile(
                    pathToIgnoreFile,
                    (toWrite.includes("*") && toWrite.length === 1) ? "*" : toWrite.join(".\n"),
                );

                await LogStuff(
                    `Divine powers have successfully created ${ignoranceLevel} protection for this ${I_LIKE_JS.MF}`,
                    "tick",
                );
            } catch (exception) {
                if (exception === 1) {
                    await LogStuff(
                        "This project is already protected!",
                        "error",
                    );
                    return 2;
                }
                throw exception;
            }
            return 0;
        } else if (ignore === false) {
            if (!hasIgnoreFile) {
                await LogStuff(`${I_LIKE_JS.MF} isn't ignored yet!`, "error");
                return 2;
            }

            await Deno.remove(pathToIgnoreFile);

            await LogStuff(
                `Divine powers have abandoned this ${I_LIKE_JS.MF}`,
                "tick",
            );
            return 0;
        } else {
            throw new Error("Invalid option. Ignore or stop ignore?");
        }
    } catch (e) {
        await LogStuff(`Something went ${I_LIKE_JS.FKN} wrong: ${e}`, "error");
        return 1;
    }
}

// run functions based on args
export default async function TheManager(args: string[], CF: CONFIG_FILES) {
    if (!args || args.length === 0) {
        await TheHelper({ query: "manager" });
        Deno.exit(1);
    }

    const command = args[1];
    const secondArg = args[2] ? args[2].trim() : null;
    const thirdArg = args[3] ? args[3].trim() : null;

    if (!command) {
        await TheHelper({ query: "manager" });
        return;
    }

    async function validateArgumentsForIgnoreHandler(
        secondArg: string | null,
        thirdArg: string | null,
    ) {
        if (!secondArg) {
            await ErrorMessage(
                "Manager__ProjectInteractionInvalidCauseNoPathProvided",
            );
            return false;
        }
        if (thirdArg && !["updater", "cleanup", "*"].includes(thirdArg)) {
            await LogStuff("err, provide level");
            return false;
        }
        return true;
    }

    async function handleIgnoreInteraction(
        isIgnoring: boolean,
        secondArg: string,
        thirdArg?: "updater" | "cleanup" | "*",
    ) {
        await HandleIgnoreProject(isIgnoring, secondArg, thirdArg ?? "*");
    }

    switch (command.toLowerCase()) {
        case "add":
            if (!secondArg || secondArg === null) {
                ErrorMessage(
                    "Manager__ProjectInteractionInvalidCauseNoPathProvided",
                );
                return;
            }
            await AddProject(secondArg, CF);
            break;
        case "remove":
            if (!secondArg || secondArg === null) {
                ErrorMessage(
                    "Manager__ProjectInteractionInvalidCauseNoPathProvided",
                );
                return;
            }
            await RemoveProject(secondArg, CF);
            break;
        case "ignore":
            if (await validateArgumentsForIgnoreHandler(secondArg, thirdArg)) {
                await handleIgnoreInteraction(
                    true,
                    secondArg!,
                    thirdArg as "updater" | "cleanup" | "*",
                );
            }
            break;
        case "revive":
            if (await validateArgumentsForIgnoreHandler(secondArg, thirdArg)) {
                await handleIgnoreInteraction(
                    false,
                    secondArg!,
                );
            }
            break;
        case "list":
            await ListProjects(
                ParseFlag("ignored", false).includes(secondArg ?? ""),
                CF,
            );
            break;
        case "cleanup":
            await CleanProjects(CF);
            break;
        default:
            await ErrorMessage("Manager__InvalidArgumentPassed");
            Deno.exit(1);
    }
}
