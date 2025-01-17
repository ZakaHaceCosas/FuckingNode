import { compare, parse } from "@std/semver";
import { FetchGitHub } from "../utils/fetch.ts";
import { RELEASE_URL, VERSION } from "../constants.ts";
import type { GITHUB_RELEASE } from "../types/misc.ts";
import { GetDateNow } from "../functions/date.ts";
import type { TheUpdaterConstructedParams } from "./constructors/command.ts";
import { ColorString, LogStuff } from "../functions/io.ts";
import { parse as parseYaml, stringify as stringifyYaml } from "@std/yaml";
import { GetAppPath } from "../functions/config.ts";
import type { CF_FKNODE_SCHEDULE } from "../types/config_files.ts";

async function TellAboutUpdate(newVer: string): Promise<void> {
    await LogStuff(
        `There's a new version! ${newVer}. Consider downloading it from GitHub. You're on ${VERSION}, btw.`,
        "bulb",
    );
}

/**
 * Checks for updates.
 *
 * @export
 * @returns {Promise<void>}
 */
export default async function TheUpdater(params: TheUpdaterConstructedParams): Promise<void> {
    const scheduleFilePath = await GetAppPath("SCHEDULE");
    const scheduleFileContents = parseYaml(await Deno.readTextFile(scheduleFilePath)) as CF_FKNODE_SCHEDULE;

    const IsUpToDate: (tag: string) => boolean = (tag: string) => compare(parse(VERSION), parse(tag)) >= 0;

    async function CheckUpdates(): Promise<CF_FKNODE_SCHEDULE | "rl"> {
        try {
            const response = await FetchGitHub(RELEASE_URL);

            if (!response.ok) {
                if (response.status === 403) return "rl"; // (github has a rate limit, so this is not an error we should be really aware of)
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const content: GITHUB_RELEASE = await response.json();

            const dataToWrite: CF_FKNODE_SCHEDULE = {
                ...scheduleFileContents,
                updater: {
                    lastCheck: GetDateNow(),
                    latestVer: content.tag_name,
                },
            };

            await Deno.writeTextFile(scheduleFilePath, stringifyYaml(dataToWrite));
            return dataToWrite;
        } catch (e) {
            throw new Error("Error checking for updates: " + e);
        }
    }

    const needsToUpdate = await CheckUpdates();
    if (needsToUpdate === "rl") {
        await LogStuff(
            "Bro was rate-limited by GitHub (update provider). Try again in a few hours.",
            "bruh",
            "bright-yellow",
        );
        return;
    }

    const { latestVer } = needsToUpdate.updater;

    if (IsUpToDate(latestVer)) {
        if (params.silent) return;
        await LogStuff(`You're up to date! ${ColorString(VERSION, "bright-green")} is the latest.`, "tick");
        return;
    } else {
        await TellAboutUpdate(latestVer);
        return;
    }
}
