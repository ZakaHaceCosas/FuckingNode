// date type and regex
export type RIGHT_NOW_DATE = `${number}-${string}-${string} ${string}:${string}`;
export const RIGHT_NOW_DATE_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

// supported lockfile types
export type SUPPORTED_LOCKFILE =
    | "package-lock.json"
    | "pnpm-lock.yaml"
    | "yarn.lock";

// emojis
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

// semver
type SemVer = `${number}.${number}.${number}`; // always SemVer compliant (1.2.3, 1.0.34, etc...)

// github api response
export interface GITHUB_RELEASE {
    tag_name: SemVer;
}

// update file
export interface UPDATE_FILE {
    lastCheck: RIGHT_NOW_DATE;
    isUpToDate: boolean;
    lastVer: SemVer;
}
