import { greaterThan, parse } from "@std/semver";
import { FetchGitHub } from "../utils/fetch.ts";
import { RELEASE_URL, VERSION } from "../constants.ts";
import { CONFIG_FILES, type GITHUB_RELEASE, RIGHT_NOW_DATE_REGEX, type UPDATE_FILE } from "../types.ts";
import { GetDateNow, MakeRightNowDateStandard } from "./date.ts";
import { CheckForPath } from "./filesystem.ts";
import { LogStuff } from "./io.ts";

// made by chatgpt i'll be honest
/**
 * Compares two SemVer versions. Returns the difference between both, so if `versionB` is more recent than `versionA` you'll get a positive number, or you'll get 0 if they're equal.
 *
 * @param {string} versionA 1st version to compare.
 * @param {string} versionB 2nd version to compare.
 * @returns {boolean} True if `versionA` is NEWER than `versionB`, false otherwise.
 */
function IsSemverNewer(versionA: string, versionB: string): boolean {
    const version1 = parse(versionA);
    const version2 = parse(versionB);

    return greaterThan(version1, version2);
}

/**
 * Checks for updates (in case it needs to do so). If you want to force it to check for updates, pass `true` as the 1st argument. Otherwise, pass false or no argument at all.
 *
 * @export
 * @returns {Promise<void>}
 */
export default async function TheUpdater(paths: CONFIG_FILES, force?: boolean): Promise<void> {
    const tellAboutUpdate = async (newVer: string) => {
        await LogStuff(
            `There's a new version! ${newVer}. Consider downloading it from GitHub. You're on ${VERSION}, btw.`,
            "bulb",
        );
    };

    const UpdaterFilePath = paths.updates;

    async function Update() {
        try {
            const response = await FetchGitHub(
                RELEASE_URL,
            );

            if (!response.ok) {
                if (response.status === 403) return; // (github has a rate limit, so this is not an error we should be really aware of)
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const content: GITHUB_RELEASE = await response.json();

            const isUpToDate = IsSemverNewer(content.tag_name, VERSION);
            if (!isUpToDate) await tellAboutUpdate(content.tag_name);

            if (force) await LogStuff(`You're up to date! (v${VERSION})`, "tick-clear");

            const dataToWrite: UPDATE_FILE = {
                isUpToDate: isUpToDate,
                lastVer: content.tag_name,
                lastCheck: GetDateNow(),
            };
            await Deno.writeTextFile(UpdaterFilePath, JSON.stringify(dataToWrite)); // if it checks successfully, it doesn't check again until 5 days later, so no waste of net resources.
        } catch (e) {
            throw new Error("Error checking for updates: " + e);
        }
    }

    async function VerifyItNeedsToUpdate(): Promise<boolean> {
        let needsToWait: boolean = true;

        if (!(await CheckForPath(UpdaterFilePath))) {
            const dataToWrite: UPDATE_FILE = {
                isUpToDate: true,
                lastVer: VERSION,
                lastCheck: GetDateNow(),
            };

            await Deno.writeTextFile(UpdaterFilePath, JSON.stringify(dataToWrite));
            needsToWait = false;
        }

        const unparsedUpdateFile = await Deno.readTextFile(UpdaterFilePath);
        const updateFile: UPDATE_FILE = JSON.parse(unparsedUpdateFile);
        if (!RIGHT_NOW_DATE_REGEX.test(updateFile.lastCheck)) {
            throw new Error(
                "Unable to parse date of last update. Got " + updateFile.lastCheck + ".",
            );
        }

        if (!updateFile.isUpToDate) {
            await tellAboutUpdate(updateFile.lastVer);
            return true;
        }

        let needsToCheck = true;

        if (needsToWait) {
            const currentCompatibleDate = MakeRightNowDateStandard(
                GetDateNow(),
            );
            const lastCompatibleDate = MakeRightNowDateStandard(updateFile.lastCheck);

            if (!(currentCompatibleDate > lastCompatibleDate)) return false; // no need to update

            // 5 days
            const differenceInMilliseconds = currentCompatibleDate.getTime() - lastCompatibleDate.getTime();

            // actually 5 days and not 5 days in milliseconds
            const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

            needsToCheck = differenceInDays >= 5;
        }

        return needsToCheck;
    }

    if (force) {
        Update();
        return;
    } else {
        if (!(await VerifyItNeedsToUpdate())) return;
        Update();
        return;
    }
}
