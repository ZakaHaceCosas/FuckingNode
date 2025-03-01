import { I_LIKE_JS } from "../constants.ts";
import { ColorString, LogStuff } from "../functions/io.ts";
import { AddProject, GetAllProjects, GetProjectEnvironment, NameProject, RemoveProject } from "../functions/projects.ts";
import TheHelper from "./help.ts";
import { DEBUG_LOG } from "../functions/error.ts";
import { StringUtils } from "@zakahacecosas/string-utils";

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
    DEBUG_LOG("FULL PROJECT LIST", list);
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
                if (StringUtils.testFlag(secondArg, "ignored")) {
                    ignoreParam = "limit";
                } else if (StringUtils.testFlag(secondArg, "alive")) {
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
