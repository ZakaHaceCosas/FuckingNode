/**
 * Date in a YEAR-MONTH-DAY HOUR:MINUTE format.
 *
 * @export
 */
export type RIGHT_NOW_DATE = `${number}-${string}-${string} ${string}:${string}`;

/**
 * RegEx for RIGHT_NOW_DATE
 */
export const RIGHT_NOW_DATE_REGEX: RegExp = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

/**
 * Valid emojis
 *
 * @export
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
 * A GitHub release asset.
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
 */
export interface GITHUB_RELEASE {
    /**
     * Version of a release. Uses the SemVer format.
     *
     * @type {string}
     */
    tag_name: string;
    /**
     * Assets of a release.
     *
     * @type {GitHubReleaseAsset[]}
     */
    assets: GitHubReleaseAsset[];
}

/**
 * A string preceded with "https://"
 *
 * @export
 */
export type tURL = `https://${string}`;

/**
 * Colors that can be used to spice up the CLI's stdout.
 */
export type tValidColors =
    | "red"
    | "white"
    | "bold"
    | "blue"
    | "green"
    | "cyan"
    | "purple"
    | "pink"
    | "half-opaque"
    | "bright-green"
    | "italic"
    | "bright-blue"
    | "bright-yellow"
    | "orange";
