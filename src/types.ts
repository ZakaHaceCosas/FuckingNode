/**
 * Date in a YEAR-MONTH-DAY HOUR:MINUTE format.
 *
 * @export
 * @typedef {RIGHT_NOW_DATE}
 */
export type RIGHT_NOW_DATE = `${number}-${string}-${string} ${string}:${string}`;

/**
 * RegEx for RIGHT_NOW_DATE
 */
export const RIGHT_NOW_DATE_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

/**
 * Supported package files.
 *
 * @export
 * @typedef {SUPPORTED_PROJECT_FILE}
 */
export type SUPPORTED_PROJECT_FILE = "package.json";
// | "deno.json"

/**
 * Supported lockfile type that the app recognizes as cleanable.
 *
 * @export
 * @typedef {SUPPORTED_LOCKFILE}
 */
export type SUPPORTED_LOCKFILE =
    | "package-lock.json"
    | "pnpm-lock.yaml"
    | "yarn.lock";
// | "deno.lock"
// | "bun.lockb";

/**
 * Package manager commands for supported managers.
 *
 * @export
 * @typedef {MANAGERS}
 */
export type MANAGERS = "pnpm" | "npm" | "yarn" | "deno" | "bun";

/**
 * Valid emojis
 *
 * @export
 * @typedef {SUPPORTED_EMOJIS}
 */
export type SUPPORTED_EMOJIS =
    | "danger"
    | "prohibited"
    | "wip"
    | "what"
    | "bulb"
    | "tick"
    | "tick-clear"
    | "error"
    | "heads-up"
    | "working"
    | "moon-face"
    | "bruh"
    | "warn"
    | "package"
    | "trash"
    | "chart";

/**
 * Always SemVer compliant (1.2.3, 1.0.34, etc...) type. Doesn't support tags like `-alpha`, for example.
 *
 * @export
 * @typedef {SemVer}
 */
export type SemVer = `${number}.${number}.${number}`;

/**
 * A GitHub release asset.
 *
 * @typedef {GitHubReleaseAsset}
 */
type GitHubReleaseAsset = {
    url: string;
    name: string;
    label: string | null;
    size: number;
    download_count: number;
    /**
     * URL to download the asset. This is what we mostly care about.
     *
     * @type {string}
     */
    browser_download_url: string;
};

/**
 * An interface so we can type responses from GitHub's REST API.
 *
 * @export
 * @interface GITHUB_RELEASE
 * @typedef {GITHUB_RELEASE}
 */
export interface GITHUB_RELEASE {
    /**
     * Version of a release.
     *
     * @type {SemVer}
     */
    tag_name: SemVer;
    /**
     * Assets of a release.
     *
     * @type {GitHubReleaseAsset[]}
     */
    assets: GitHubReleaseAsset[];
}

/**
 * File where info for the updater is stored in JSON format.
 *
 * @export
 * @interface UPDATE_FILE
 * @typedef {UPDATE_FILE}
 */
export interface UPDATE_FILE {
    /**
     * Last time the app has checked for updates.
     *
     * @type {RIGHT_NOW_DATE}
     */
    lastCheck: RIGHT_NOW_DATE;
    /**
     * Whether the current version is up to date.
     *
     * @type {boolean}
     */
    isUpToDate: boolean;
    /**
     * Latest version of the app.
     *
     * @type {SemVer}
     */
    lastVer: SemVer;
}

/**
 * A string preceded with "https://"
 *
 * @export
 * @typedef {tURL}
 */
export type tURL = `https://${string}`;

/**
 * `package.json` props we need.
 *
 * @export
 * @interface PkgJson
 * @typedef {PkgJson}
 */
export interface PkgJson {
    name?: string;
    workspaces?: string[] | {
        packages: string[];
        nohoist?: string[];
    };
}

/**
 * All possible error codes.
 *
 * @export
 * @typedef {ERROR_CODES}
 */
export type ERROR_CODES = "Manager__ProjectInteractionInvalidCauseNoPathProvided" | "Manager__InvalidArgumentPassed";

/**
 * An object with paths to all config files.
 *
 * @export
 * @typedef {CONFIG_FILES}
 */
export interface CONFIG_FILES {
    projects: string;
    logs: string;
    updates: string;
}
