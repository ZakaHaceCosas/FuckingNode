import type { CleanerIntensity } from "./config_params.ts";
import type { RIGHT_NOW_DATE } from "./misc.ts";

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
    settings: string;
}

export interface FKNODE_SETTINGS {
    updateFreq: number;
    defaultCleanerIntensity: CleanerIntensity;
    autoFlushFiles: {
        enabled: boolean;
        freq: number;
    };
}

export interface FkNodeConfigYaml {
    divineProtection?: ("*" | "updater" | "cleanup")[];
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
     * Latest version of the app. Uses the SemVer format.
     *
     * @type {string}
     */
    lastVer: string;
}
