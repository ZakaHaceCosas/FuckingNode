import { I_LIKE_JS } from "../constants.ts";
import { ColorString, LogStuff, ParseFlag } from "../functions/io.ts";
import { CheckForPath, JoinPaths, ParsePath } from "../functions/filesystem.ts";
import { GetAllProjects, GetProjectSettings, GetWorkspaces, NameProject, SpotProject, ValidateProject } from "../functions/projects.ts";
import TheHelper from "./help.ts";
import GenericErrorHandler, { FknError } from "../utils/error.ts";
import { GetProjectEnvironment } from "../functions/projects.ts";
import { GetAppPath } from "../functions/config.ts";

/**
 * Adds a new project.
 *
 * @export
 * @async
 * @param {string} entry Path to the project.
 * @param {boolean} force If true, it'll skip Deno & Bun warnings.
 * @returns {Promise<void>}
 */
export async function AddProject(
    entry: string,
    force?: boolean,
): Promise<void> {
    const workingEntry = await ParsePath(entry);
    if (!(await CheckForPath(workingEntry))) {
        throw new FknError("Manager__NonExistingPath", `Path "${workingEntry}" doesn't exist.`);
    }
    const projectName = await NameProject(workingEntry, "name-ver");

    async function addTheEntry() {
        await Deno.writeTextFile(await GetAppPath("MOTHERFKRS"), `${workingEntry}\n`, {
            append: true,
        });
        await LogStuff(
            `Congrats! ${projectName} was added to your list. One mf less to care about!`,
            "tick-clear",
        );
    }

    const validation = await ValidateProject(workingEntry);
    const env = await GetProjectEnvironment(workingEntry);

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
    if (env.runtime === "deno" || force !== true) {
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
    if (env.runtime === "bun" || force !== true) {
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
                    return await NameProject(thingy, "all");
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

    await Deno.writeTextFile(await GetAppPath("MOTHERFKRS"), `${workingEntry}\n`, {
        append: true,
    });
    for (const workspace of workspaces) {
        await Deno.writeTextFile(await GetAppPath("MOTHERFKRS"), `${workspace}\n`, {
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
 * @param {string} entry Path to the project.
 * @param {boolean} isBareRemoval If true, it'll remove the project without spotting, assuming it's a valid path.
 * @returns {Promise<void>}
 */
async function RemoveProject(
    entry: string,
    isBareRemoval: boolean,
): Promise<void> {
    const workingEntry = isBareRemoval ? await ParsePath(entry) : await SpotProject(entry.trim());

    if (!workingEntry) {
        await LogStuff(
            `Bruh, that mf wasn't found.\nAnother typo? We took: ${entry.trim()}`,
            "error",
        );
        return;
    }

    const list = await GetAllProjects(false);
    const index = list.indexOf(workingEntry);

    if (!list.includes(workingEntry)) {
        await LogStuff(
            `Bruh, that mf doesn't exist yet.\nAnother typo? We took: ${workingEntry}`,
            "error",
        );
        return;
    }

    if (index !== -1) list.splice(index, 1); // remove only 1st coincidence, to avoid issues
    await Deno.writeTextFile(await GetAppPath("MOTHERFKRS"), list.join("\n") + "\n");

    if (list.length > 0) {
        await LogStuff(
            `Let me guess: ${await NameProject(
                workingEntry,
                "name",
            )} was another "revolutionary cutting edge project" that's now gone, right?`,
            "tick-clear",
        );
    } else {
        await LogStuff(
            `Removed ${await NameProject(
                workingEntry,
                "name",
            )}. That was your last project, the list is now empty.`,
            "moon-face",
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
        const list = await GetAllProjects();
        const listOfRemovals: string[] = [];

        for (const project of list) {
            const validation = await ValidateProject(project);
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
        `We've found issues! We're talking about getting rid of:\n`,
        "bulb",
    );
    // doesn't use NameProject as it's likely to point to an invalid path
    for (const idiot of list) {
        await LogStuff(
            `${idiot} ${ColorString("Code: " + (await ValidateProject(idiot)), "half-opaque")}`,
            "trash",
        );
    }
    console.log(""); // glue fix
    const del = await LogStuff(
        `Remove all of these ${I_LIKE_JS.MFS}?`,
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
        await RemoveProject(target, true);
    }
    await LogStuff(`That worked out!`, "tick");
    return 0;
}

/**
 * Lists all projects.
 *
 * @async
 * @param {"limit" | "exclude" | false} ignore
 * @returns {Promise<void>}
 */
async function ListProjects(
    ignore: "limit" | "exclude" | false,
): Promise<void> {
    try {
        const list = await GetAllProjects();

        if (list.length === 0) {
            await LogStuff(
                "Bruh, your mfs list is empty! Ain't nobody here!",
                "moon-face",
            );
            return;
        }

        if (ignore === "limit") {
            const ignoreList = await GetAllProjects("limit");

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
            const toReturn: string[] = [];
            for (const entry of ignoreList) {
                const protection = (await GetProjectSettings(entry)).divineProtection; // array
                let protectionString: string;
                if (!(Array.isArray(protection))) protectionString = "ERROR: CANNOT READ SETTINGS, CHECK YOUR FKNODE.YAML!";
                else protectionString = protection.join(" and ");

                toReturn.push(
                    `${await NameProject(entry, "all")} (${
                        ColorString(
                            protectionString,
                            "bold",
                        )
                    })\n`,
                );
            }
            await LogStuff(toReturn.join("\n"));
            return;
        }

        if (ignore === "exclude") {
            const notIgnoreList = await GetAllProjects("exclude");

            await LogStuff(
                `Here are the ${I_LIKE_JS.MFS} you added (and haven't ignored) so far:\n`,
                "bulb",
            );
            const toReturn: string[] = [];
            for (const entry of notIgnoreList) {
                toReturn.push(await NameProject(entry, "all"));
            }
            await LogStuff(toReturn.join("\n"));
            return;
        }
        await LogStuff(
            `Here are the ${I_LIKE_JS.MFS} you added so far:\n`,
            "bulb",
        );
        for (const entry of list) {
            await LogStuff(await NameProject(entry, "all"));
        }
        return;
    } catch (e) {
        await GenericErrorHandler(e);
    }
}

export default async function TheManager(args: string[]) {
    if (!args || args.length === 0) {
        await TheHelper({ query: "manager" });
        Deno.exit(1);
    }

    const command = args[1];
    const secondArg = args[2] ? args[2].trim() : null;

    if (!command) {
        await TheHelper({ query: "manager" });
        return;
    }

    switch (command.toLowerCase()) {
        case "add":
            if (!secondArg || secondArg === null) {
                throw new FknError(
                    "Manager__ProjectInteractionInvalidCauseNoPathProvided",
                    "You didn't provide a path.",
                );
            }
            await AddProject(secondArg);
            break;
        case "remove":
            if (!secondArg || secondArg === null) {
                throw new FknError(
                    "Manager__ProjectInteractionInvalidCauseNoPathProvided",
                    "You didn't provide a path.",
                );
            }
            await RemoveProject(secondArg, false);
            break;
        case "list":
            if (secondArg) {
                let ignoreParam: false | "limit" | "exclude" = false;
                if (ParseFlag("ignored", false).includes(secondArg)) {
                    ignoreParam = "limit";
                } else if (ParseFlag("alive", false).includes(secondArg)) {
                    ignoreParam = "exclude";
                }
                await ListProjects(
                    ignoreParam,
                );
            } else {
                await ListProjects(
                    false,
                );
            }
            break;
        case "cleanup":
            await CleanProjects();
            break;
        default:
            throw new FknError(
                "Manager__InvalidArgumentPassed",
                `${command} is not a valid argument.`,
            );
    }
}
