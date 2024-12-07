import type { CleanerIntensity } from "./config_params.ts";
import type { RIGHT_NOW_DATE } from "./misc.ts";

/**
 * User config
 *
 * @export
 * @interface CF_FKNODE_SETTINGS
 * @typedef {CF_FKNODE_SETTINGS}
 */
export interface CF_FKNODE_SETTINGS {
    /**
     * How often should the CLI check for updates.
     *
     * @type {number}
     */
    updateFreq: number;
    /**
     * Default cleaner intensity, for running `clean` with no args.
     *
     * @type {CleanerIntensity}
     */
    defaultCleanerIntensity: CleanerIntensity;
    /**
     * Auto flush config files
     */
    autoFlushFiles: {
        enabled: boolean;
        freq: number;
    };
}

/**
 * fknode.yaml file for configuring individual projects
 *
 * @export
 * @interface FkNodeYaml
 * @typedef {FkNodeYaml}
 */
export interface FkNodeYaml {
    /**
     * Divine protection, basically to ignore stuff.
     *
     * @type {"*" | "all" | "updater" | "cleanup" | "disabled"}
     */
    divineProtection?: "*" | "all" | "updater" | "cleanup" | "disabled";
    /**
     * If `--lint` is passed to `clean`, this script will be used to lint the project. It must be a runtime script (defined in `package.json` -> `scripts`), and must be a single word (no need for "npm run" prefix).
     *
     * @type {?string}
     */
    lintCmd?: string;
    /**
     * If `--pretty` is passed to `clean`, this script will be used to prettify the project. It must be a runtime script (defined in `package.json` -> `scripts`), and must be a single word (no need for "npm run" prefix).
     *
     * @type {?string}
     */
    prettyCmd?: string;
    /**
     * If provided, file paths in `targets` will be removed when `clean` is called with any of the `intensities`.
     *
     * @type {?{
     *         intensities: CleanerIntensity[] | "*" | "all",
     *         targets: string[]
     *     }}
     */
    destroy?: {
        intensities: CleanerIntensity[] | "*" | "all";
        targets: string[];
    };
    /**
     * If true, if an action that changes the code is performed (update, prettify, or destroy) and the Git workspace is clean (no uncommitted stuff), a commit will be made.
     *
     * @type {?boolean}
     */
    commitActions?: boolean;
    /**
     * If provided, if a commit is made (`commitActions`) this will be the commit message. If not provided a default message is used.
     *
     * @type {?string}
     */
    commitMessage?: string;
}

/**
 * Validates if whatever you pass to this is a valid FkNodeYaml file.
 *
 * @export
 * @param {*} obj Whatever
 * @returns {obj is FkNodeYaml}
 */
export function ValidateFkNodeYaml(
    // deno-lint-ignore no-explicit-any
    obj: any,
): obj is FkNodeYaml {
    if (obj.divineProtection && !["*", "all", "updater", "cleanup", "disabled"].includes(obj.divineProtection)) {
        return false;
    }

    if (obj.lintCmd && typeof obj.lintCmd !== "string") {
        return false;
    }
    if (obj.prettyCmd && typeof obj.prettyCmd !== "string") {
        return false;
    }

    if (obj.destroy) {
        if (
            !Array.isArray(obj.destroy.targets) ||
            !obj.destroy.targets.every((
                // deno-lint-ignore no-explicit-any
                target: any,
            ) => {
                return typeof target === "string";
            })
        ) {
            return false;
        }

        if (!["*", "all"].includes(obj.destroy.intensities) && !Array.isArray(obj.destroy.intensities)) {
            return false;
        }
    }

    if (obj.commitActions !== undefined && typeof obj.commitActions !== "boolean") {
        return false;
    }

    if (obj.commitMessage && typeof obj.commitMessage !== "string") {
        return false;
    }

    return true;
}

/**
 * File where info for the updater is stored in YAML format.
 *
 * @export
 * @interface CF_FKNODE_UPDATES
 * @typedef {CF_FKNODE_UPDATES}
 */
export interface CF_FKNODE_UPDATES {
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
     * Latest version of the app. Uses the SemVer format.
     *
     * @type {string}
     */
    lastVer: string;
}
