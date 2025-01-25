import type { CleanerIntensity } from "./config_params.ts";
import type { RIGHT_NOW_DATE } from "./misc.ts";

/**
 * Supported code editors.
 *
 * @export
 */
export type SUPPORTED_EDITORS = "vscode" | "sublime" | "emacs" | "notepad++" | "atom" | "vscodium";

/**
 * User config
 *
 * @export
 * @interface CF_FKNODE_SETTINGS
 */
export interface CF_FKNODE_SETTINGS {
    /**
     * How often should the CLI check for updates.
     *
     * @type {number}
     */
    updateFreq: number;
    /**
     * How often should the CLI clear log files.
     *
     * @type {number}
     */
    logFlushFreq: number;
    /**
     * Default cleaner intensity, for running `clean` with no args.
     *
     * @type {CleanerIntensity}
     */
    defaultCleanerIntensity: CleanerIntensity;
    /**
     * User's favorite code editor.
     */
    favoriteEditor: SUPPORTED_EDITORS;
}

/**
 * A config file for scheduled tasks.
 *
 * @export
 * @interface CF_FKNODE_SCHEDULE
 */
export interface CF_FKNODE_SCHEDULE {
    /**
     * Updates.
     *
     * @type {{
     *         latestVer: string;
     *         lastCheck: RIGHT_NOW_DATE;
     *     }}
     */
    updater: {
        latestVer: string;
        lastCheck: RIGHT_NOW_DATE;
    };
    /**
     * Log flushes.
     *
     * @type {{
     *         lastFlush: RIGHT_NOW_DATE;
     *     }}
     */
    flusher: {
        lastFlush: RIGHT_NOW_DATE;
    };
}

/**
 * fknode.yaml file for configuring individual projects
 *
 * @export
 * @interface FkNodeYaml
 */
export interface FkNodeYaml {
    /**
     * Divine protection, basically to ignore stuff. Must always be an array.
     *
     * @type {?(("updater" | "cleaner" | "linter" | "prettifier" | "destroyer")[] | "*" | "disabled")}
     */
    divineProtection?: ("updater" | "cleaner" | "linter" | "prettifier" | "destroyer")[] | "*" | "disabled";
    /**
     * If `--lint` is passed to `clean`, this script will be used to lint the project. It must be a runtime script (defined in `package.json` -> `scripts`), and must be a single word (no need for "npm run" prefix). `__ESLINT` overrides these rules (it's the default).
     *
     * @type {?(string | "__ESLINT")}
     */
    lintCmd?: string | "__ESLINT";
    /**
     * If `--pretty` is passed to `clean`, this script will be used to prettify the project. It must be a runtime script (defined in `package.json` -> `scripts`), and must be a single word (no need for "npm run" prefix). `__PRETTIER` overrides these rules (it's the default).
     *
     * @type {?(string | "__PRETTIER")}
     */
    prettyCmd?: string | "__PRETTIER";
    /**
     * If provided, file paths in `targets` will be removed when `clean` is called with any of the `intensities`. If not provided defaults to `maxim` intensity and `node_modules` path. Specifying `targets` _without_ `node_modules` does not override it, meaning it'll always be cleaned.
     *
     * @type {?{
     *         intensities: (CleanerIntensity | "*")[],
     *         targets: string[]
     *     }}
     */
    destroy?: {
        /**
         * Intensities the destroyer should run at.
         *
         * @type {(CleanerIntensity | "*")[]}
         */
        intensities: (CleanerIntensity | "*")[];
        /**
         * Targets to be destroyed. Must be paths either relative to the **root** of the project or absolute.
         *
         * @type {string[]}
         */
        targets: string[];
    };
    /**
     * If true, if an action that changes the code is performed (update, prettify, or destroy) and the Git workspace is clean (no uncommitted stuff), a commit will be made.
     *
     * @type {?boolean}
     */
    commitActions?: boolean;
    /**
     * If provided, if a commit is made (`commitActions`) this will be the commit message. If not provided a default message is used. `__USE_DEFAULT` indicates to use the default.
     *
     * @type {?(string | "__USE_DEFAULT")}
     */
    commitMessage?: string | "__USE_DEFAULT";
    /**
     * If provided, uses the provided runtime script command for the updating stage, overriding the default command. Like `lintCmd` or `prettyCmd`, it must be a runtime script.
     *
     * @type {?(string | "__USE_DEFAULT")}
     */
    updateCmdOverride?: string | "__USE_DEFAULT";
    /**
     * Flagless features.
     *
     * @type {?{
     *         flaglessUpdate?: boolean;
     *         flaglessDestroy?: boolean;
     *         flaglessLint?: boolean;
     *         flaglessPretty?: boolean;
     *         flaglessCommit?: boolean;
     *     }}
     */
    flagless?: {
        flaglessUpdate?: boolean;
        flaglessDestroy?: boolean;
        flaglessLint?: boolean;
        flaglessPretty?: boolean;
        flaglessCommit?: boolean;
    };
    /**
     * A task (run) to be executed upon running the release command.
     *
     * @type {?string}
     */
    releaseCmd?: string;
    /**
     * If true, releases will always use `dry-run`.
     *
     * @type {?boolean}
     */
    releaseAlwaysDry?: boolean;
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
    if (!obj || typeof obj !== "object") {
        return false;
    }

    if (
        obj.divineProtection !== undefined &&
        obj.divineProtection !== "*" &&
        obj.divineProtection !== "disabled" &&
        !(
            Array.isArray(obj.divineProtection) &&
            obj.divineProtection.every(
                // deno-lint-ignore no-explicit-any
                (item: any) => {
                    return ["updater", "cleaner", "linter", "prettifier", "destroyer"].includes(item);
                },
            )
        )
    ) {
        return false;
    }

    if (
        obj.lintCmd !== undefined && typeof obj.lintCmd !== "string"
    ) {
        return false;
    }

    if (
        obj.prettyCmd !== undefined && typeof obj.prettyCmd !== "string"
    ) {
        return false;
    }

    if (obj.destroy !== undefined) {
        if (
            typeof obj.destroy !== "object" ||
            !Array.isArray(obj.destroy.targets) ||
            !obj.destroy.targets.every(
                // deno-lint-ignore no-explicit-any
                (target: any) => typeof target === "string",
            ) ||
            !(
                obj.destroy.intensities === "*" ||
                (Array.isArray(obj.destroy.intensities) &&
                    obj.destroy.intensities.every(
                        // deno-lint-ignore no-explicit-any
                        (intensity: any) => {
                            return ["low", "medium", "high", "*"].includes(intensity);
                        },
                    ))
            )
        ) {
            return false;
        }
    }

    if (obj.commitActions !== undefined && typeof obj.commitActions !== "boolean") {
        return false;
    }

    if (
        obj.commitMessage !== undefined &&
        typeof obj.commitMessage !== "string"
    ) {
        return false;
    }

    if (
        obj.updateCmdOverride !== undefined &&
        typeof obj.updateCmdOverride !== "string"
    ) {
        return false;
    }

    if (obj.flagless !== undefined) {
        if (typeof obj.flagless !== "object" || obj.flagless === null) {
            return false;
        }

        const validKeys = ["flaglessUpdate", "flaglessDestroy", "flaglessLint", "flaglessPretty", "flaglessCommit"];
        for (const [key, value] of Object.entries(obj.flagless)) {
            if (!validKeys.includes(key) || typeof value !== "boolean") {
                return false;
            }
        }
    }

    if (obj.releaseCmd !== undefined && typeof obj.releaseCmd !== "string") {
        return false;
    }

    if (obj.releaseAlwaysDry !== undefined && typeof obj.releaseAlwaysDry !== "boolean") {
        return false;
    }

    return true;
}
