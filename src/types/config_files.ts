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
     * @type {?("*" | "updater" | "cleanup")[]}
     */
    divineProtection?: ("*" | "updater" | "cleanup")[];
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
