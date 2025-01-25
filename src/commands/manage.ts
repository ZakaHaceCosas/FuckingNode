import { I_LIKE_JS } from "../constants.ts";
import { ColorString, LogStuff, ParseFlag } from "../functions/io.ts";
import { CheckForPath, ParsePath } from "../functions/filesystem.ts";
import { GetAllProjects, GetProjectSettings, GetWorkspaces, NameProject, SpotProject, ValidateProject } from "../functions/projects.ts";
import TheHelper from "./help.ts";
import GenericErrorHandler, { FknError } from "../utils/error.ts";
import { GetProjectEnvironment } from "../functions/projects.ts";
import { GetAppPath } from "../functions/config.ts";
import type { PROJECT_ERROR_CODES } from "../types/errors.ts";
import { StringUtils } from "@zakahacecosas/string-utils";

/**
 * Adds a new project.
 *
 * @export
 * @async
 * @param {string} entry Path to the project.
 * @returns {Promise<void>}
 */
export async function AddProject(
    entry: string | null,
): Promise<void> {
    if (!entry || entry === null) {
        throw new FknError(
            "Manager__ProjectInteractionInvalidCauseNoPathProvided",
            "You didn't provide a path.",
        );
    }

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

    const validation = await ValidateProject(workingEntry, false);
    const env = await GetProjectEnvironment(workingEntry);

    if (validation === "IsDuplicate") {
        await LogStuff(
            `Bruh, you already added the ${projectName} ${I_LIKE_JS.MF}!`,
            "error",
        );
        return;
    }

    if (env.runtime === "deno") {
        await LogStuff(
            // says 'good choice' because it's the same runtime as F*ckingNode. its not a real opinion lmao
            // idk whats better, deno or bun. i have both installed, i could try. one day, maybe.
            `This project uses the Deno runtime (good choice btw). Keep in mind it's not *fully* supported *yet*.`,
            "bruh",
            "italic",
        );
    }
    if (env.runtime === "bun") {
        await LogStuff(
            `This project uses the Bun runtime. Keep in mind it's not *fully* supported *yet*.`,
            "what",
            "italic",
        );
    }

    const workspaces = await GetWorkspaces(
        env.root,
    );

    if (!workspaces || workspaces.length === 0) {
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
 * @returns {Promise<void>}
 */
export async function RemoveProject(
    entry: string | null,
): Promise<void> {
    if (!entry) {
        throw new FknError(
            "Manager__ProjectInteractionInvalidCauseNoPathProvided",
            "You didn't provide a path.",
        );
    }

    try {
        const workingEntry = await SpotProject(entry.trim());

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
    } catch (e) {
        if (e instanceof FknError && e.code === "Generic__NonFoundProject") {
            await LogStuff(
                `Bruh, that mf doesn't exist yet.\nAnother typo? We took: ${await ParsePath(entry)}`,
                "error",
            );
            return;
        } else {
            throw e;
        }
    }
}

/**
 * Cleans up projects that are invalid and probably we won't be able to clean.
 *
 * @async
 * @returns {Promise<0 | 1 | 2>} 0 if success, 1 if no projects to remove, 2 if the user doesn't remove them.
 */
async function CleanupProjects(): Promise<0 | 1 | 2> {
    const listOfRemovals: { project: string; issue: PROJECT_ERROR_CODES }[] = [];

    for (const project of (await GetAllProjects())) {
        const validation = await ValidateProject(project, true);
        if (validation !== true) listOfRemovals.push({ project: project, issue: validation });
    }

    // remove duplicates
    const result = Array.from(
        new Map(
            listOfRemovals.map((item) => [JSON.stringify(item), item]), // make it a string so we can actually compare it's values
        ).values(),
    );

    if (result.length === 0) {
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
    for (const idiot of result) {
        await LogStuff(
            `${idiot.project} ${ColorString(`Code: ${idiot.issue}`, "half-opaque")}`,
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
    for (const target of result) {
        await RemoveProject(target.project);
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
        const list = await GetAllProjects(ignore);

        if (list.length === 0) {
            if (ignore === "limit") {
                await LogStuff(
                    "Huh, you didn't ignore anything! Good to see you care about all your projects (not for long, I can bet).",
                    "moon-face",
                );
                return;
            } else {
                await LogStuff(
                    "Bruh, your mfs list is empty! Ain't nobody here!",
                    "moon-face",
                );
                return;
            }
        }

        const toPrint: string[] = [];
        let message: string;

        if (ignore === "limit") {
            message = `Here are the ${I_LIKE_JS.MFS} you added (and ignored) so far:\n`;
            for (const entry of list) {
                const protection = (await GetProjectSettings(entry)).divineProtection; // array
                let protectionString: string;
                if (!(Array.isArray(protection))) {
                    protectionString = "ERROR: CANNOT READ SETTINGS, CHECK YOUR FKNODE.YAML!";
                } else {
                    protectionString = protection.join(" and ");
                }

                toPrint.push(
                    `${await NameProject(entry, "all")} (${
                        ColorString(
                            protectionString,
                            "bold",
                        )
                    })\n`,
                );
            }
        } else if (ignore === "exclude") {
            message = `Here are the ${I_LIKE_JS.MFS} you added (and haven't ignored) so far:\n`;
            for (const entry of list) {
                toPrint.push(await NameProject(entry, "all"));
            }
        } else {
            message = `Here are the ${I_LIKE_JS.MFS} you added so far:\n`;
            for (const entry of list) {
                toPrint.push(await NameProject(entry, "all"));
            }
        }

        await LogStuff(
            message,
            "bulb",
        );
        for (const entry of StringUtils.sortAlphabetically(toPrint)) {
            await LogStuff(entry);
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
            await AddProject(secondArg);
            break;
        case "remove":
            await RemoveProject(secondArg);
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
            await CleanupProjects();
            break;
        default:
            await TheHelper({ query: "manager" });
    }
}
