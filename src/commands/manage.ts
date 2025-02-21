import { I_LIKE_JS } from "../constants.ts";
import { ColorString, LogStuff, ParseFlag } from "../functions/io.ts";
import { CheckForPath, ParsePath } from "../functions/filesystem.ts";
import { GetAllProjects, GetWorkspaces, NameProject, SpotProject, ValidateProject } from "../functions/projects.ts";
import TheHelper from "./help.ts";
import { FknError } from "../utils/error.ts";
import { GetProjectEnvironment } from "../functions/projects.ts";
import { GetAppPath } from "../functions/config.ts";
import { StringUtils, type UnknownString } from "@zakahacecosas/string-utils";

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

    const workspaceString: string[] = [];

    for (const ws of workspaces) {
        workspaceString.push(await NameProject(ws, "all"));
    }

    const addWorkspaces = await LogStuff(
        `Hey! This looks like a ${I_LIKE_JS.FKN} monorepo. We've found these workspaces:\n\n${
            workspaceString.join("\n")
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
 * @param {UnknownString} entry Path to the project.
 * @returns {Promise<void>}
 */
export async function RemoveProject(
    entry: UnknownString,
    showOutput: boolean = true,
): Promise<void> {
    try {
        const workingEntry = await SpotProject(entry);

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

        if (list.length > 0 && showOutput === true) {
            await LogStuff(
                `I'll guess: ${await NameProject(
                    workingEntry,
                    "name",
                )} was another "revolutionary cutting edge project" that's now gone, right?`,
                "tick-clear",
            );
        } else {
            if (showOutput === true) {
                await LogStuff(
                    `Removed ${await NameProject(
                        workingEntry,
                        "name",
                    )}. That was your last project, the list is now empty.`,
                    "moon-face",
                );
            }
        }
    } catch (e) {
        if (e instanceof FknError && e.code === "Generic__NonFoundProject") {
            await LogStuff(
                `Bruh, that mf doesn't exist yet.\nAnother typo? We took: ${entry} (=> ${entry ? await ParsePath(entry) : "undefined?"})`,
                "error",
            );
            return;
        } else {
            throw e;
        }
    }
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
    const list = await GetAllProjects(ignore);

    if (list.length === 0) {
        if (ignore === "limit") {
            await LogStuff(
                "Huh, you didn't ignore anything! Good to see you care about all your projects (not for long, I can bet).",
                "moon-face",
            );
            return;
        } else if (ignore === "exclude") {
            await LogStuff(
                "Huh, you ignored all of your projects! What did you download this CLI for?",
                "moon-face",
            );
            return;
        } else {
            await LogStuff(
                "Man, your mfs list is empty! Ain't nobody here!",
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
            const protection = (await GetProjectEnvironment(entry)).settings.divineProtection; // array
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

    await LogStuff(message, "bulb");
    for (const entry of StringUtils.sortAlphabetically(toPrint)) await LogStuff(entry);

    return;
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
            await LogStuff(
                "We removed the need to manually cleanup your projects - each time you run the CLI we auto-clean them for you.\nEnjoy!",
                "comrade",
            );
            break;
        default:
            await TheHelper({ query: "manager" });
    }
}
