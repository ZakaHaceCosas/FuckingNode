import { compare, greaterThan, parse } from "@std/semver";
import { FetchGitHub } from "../utils/fetch.ts";
import { RELEASE_URL, VERSION } from "../constants.ts";
import { type GITHUB_RELEASE, RIGHT_NOW_DATE_REGEX, type UPDATE_FILE } from "../types.ts";
import { GetDateNow, MakeRightNowDateStandard } from "../functions/date.ts";
import { CheckForPath } from "../functions/filesystem.ts";
import type { TheUpdaterConstructedParams } from "./constructors/command.ts";
import { LogStuff } from "../functions/io.ts";
import { stringify as stringifyYaml, parse as parseYaml } from '@std/yaml';

/**
 * Compares two SemVer versions. Returns the difference between both, so if `versionB` is more recent than `versionA` you'll get a positive number, or you'll get 0 if they're equal.
 *
 * @param {string} versionA 1st version to compare.
 * @param {string} versionB 2nd version to compare.
 * @returns {boolean | 0} True if `versionA` is NEWER than `versionB`, false otherwise. `0` if they're the same.
 */
function IsSemverNewer(versionA: string, versionB: string): boolean | 0 {
    const version1 = parse(versionA);
    const version2 = parse(versionB);

    return (compare(version1, version2) === 0 ? 0 : greaterThan(version1, version2));
}

/**
 * Checks for updates (in case it needs to do so). If you want to force it to check for updates, pass `true` as the 1st argument. Otherwise, pass false or no argument at all.
 *
 * @export
 * @returns {Promise<void>}
 */
export default async function TheUpdater(params: TheUpdaterConstructedParams): Promise<void> {
    async function TellAboutUpdate(newVer: string) {
        await LogStuff(
            `There's a new version! ${newVer}. Consider downloading it from GitHub. You're on ${VERSION}, btw.`,
            "bulb",
        );
    }

    const UpdaterFilePath = params.CF.updates;

    async function CheckUpdates(): Promise<UPDATE_FILE | "rl"> {
        try {
            const response = await FetchGitHub(
                RELEASE_URL,
            );

            if (!response.ok) {
                if (response.status === 403) return "rl"; // (github has a rate limit, so this is not an error we should be really aware of)
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const content: GITHUB_RELEASE = await response.json();

            const isUpToDate = typeof IsSemverNewer(content.tag_name, VERSION) === "boolean"
                ? (IsSemverNewer(content.tag_name, VERSION) as boolean)
                : true;

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

        if (!updateFile.isUpToDate) {
            return true;
        }

        const currentDate = MakeRightNowDateStandard(GetDateNow());
        const lastDate = MakeRightNowDateStandard(updateFile.lastCheck);
        const differenceInDays = (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24); // if it checks successfully, it doesn't check again until 5 days later, so no waste of net resources.

        return differenceInDays >= 5; // check for updates each five days
    }

    if (!params.force) {
        if (!(await VerifyItNeedsToUpdate())) return;
    }
    const needsToUpdate = await CheckUpdates();
    if (needsToUpdate === "rl") await LogStuff("Bro was rate-limited by GitHub (update provider). Try again in a few hours.", "bruh");
    if ((needsToUpdate as UPDATE_FILE).isUpToDate) {
        TellAboutUpdate((needsToUpdate as UPDATE_FILE).lastVer);
        return;
    }

    if (!params.silent) await LogStuff(`You're up to date! ${VERSION} is the latest.`, "tick");
}
