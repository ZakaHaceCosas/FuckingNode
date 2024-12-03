import { compare, parse } from "@std/semver";
import { FetchGitHub } from "../utils/fetch.ts";
import { RELEASE_URL, VERSION } from "../constants.ts";
import { type GITHUB_RELEASE, RIGHT_NOW_DATE_REGEX, type UPDATE_FILE } from "../types.ts";
import { GetDateNow, MakeRightNowDateStandard } from "../functions/date.ts";
import { CheckForPath } from "../functions/filesystem.ts";
import type { TheUpdaterConstructedParams } from "./constructors/command.ts";
import { LogStuff } from "../functions/io.ts";
import { parse as parseYaml, stringify as stringifyYaml } from "@std/yaml";
import { GetSettings } from "../functions/config.ts";

/**
 * Checks for updates (in case it needs to do so). If you want to force it to check for updates, pass `true` as the 1st argument. Otherwise, pass false or no argument at all.
 *
 * @export
 * @returns {Promise<void>}
 */
export default async function TheUpdater(params: TheUpdaterConstructedParams): Promise<void> {
    async function TellAboutUpdate(newVer: string): Promise<void> {
        await LogStuff(
            `There's a new version! ${newVer}. Consider downloading it from GitHub. You're on ${VERSION}, btw.`,
            "bulb",
        );
    }

    const UpdaterFilePath = params.CF.updates;

    async function CheckUpdates(): Promise<UPDATE_FILE | "rl"> {
        try {
            const response = await FetchGitHub(RELEASE_URL);

            if (!response.ok) {
                if (response.status === 403) return "rl"; // (github has a rate limit, so this is not an error we should be really aware of)
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const content: GITHUB_RELEASE = await response.json();

            const isUpToDate = (compare(parse(content.tag_name), parse(VERSION))) >= 1;

            const dataToWrite: UPDATE_FILE = {
                isUpToDate: isUpToDate,
                lastVer: content.tag_name,
                lastCheck: GetDateNow(),
            };

            await Deno.writeTextFile(UpdaterFilePath, stringifyYaml(dataToWrite));
            return dataToWrite;
        } catch (e) {
            throw new Error("Error checking for updates: " + e);
        }
    }

    async function VerifyItNeedsToUpdate(): Promise<boolean> {
        if (!(await CheckForPath(UpdaterFilePath))) {
            const dataToWrite: UPDATE_FILE = {
                isUpToDate: true,
                lastVer: VERSION,
                lastCheck: GetDateNow(),
            };
            await Deno.writeTextFile(UpdaterFilePath, stringifyYaml(dataToWrite));
            return false;
        }

        const updateFile: UPDATE_FILE = parseYaml(await Deno.readTextFile(UpdaterFilePath)) as UPDATE_FILE;

        if (!RIGHT_NOW_DATE_REGEX.test(updateFile.lastCheck)) {
            throw new Error(`Unable to parse date of last update. Got ${updateFile.lastCheck}.`);
        }

        if (!updateFile.isUpToDate) return true;

        const currentDate = MakeRightNowDateStandard(GetDateNow());
        const lastDate = MakeRightNowDateStandard(updateFile.lastCheck);
        const differenceInDays = (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24); // if it checks successfully, it doesn't check again until 5 days (by default) later, so no waste of net resources.

        return differenceInDays >= (await GetSettings()).updateFreq;
    }

    if (!params.force && !(await VerifyItNeedsToUpdate())) return;

    const needsToUpdate = await CheckUpdates();
    if (needsToUpdate === "rl") {
        await LogStuff("Bro was rate-limited by GitHub (update provider). Try again in a few hours.", "bruh");
        return;
    }

    const { isUpToDate, lastVer } = needsToUpdate as UPDATE_FILE;

    if (isUpToDate) {
        if (!params.silent) {
            await LogStuff(`You're up to date! ${VERSION} is the latest.`, "tick");
        }
        return;
    } else {
        if (!params.mute) {
            await TellAboutUpdate(lastVer);
        }
        return;
    }
}
