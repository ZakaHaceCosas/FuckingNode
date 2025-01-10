import type { CleanerIntensity } from "./config_params.ts";
import type { RIGHT_NOW_DATE } from "./misc.ts";

export type SUPPORTED_EDITORS = "vscode" | "sublime" | "emacs" | "notepad++" | "atom" | "vscodium"

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
 * fknode.yaml file for configuring individual projects
 *
 * @export
 * @interface FkNodeYaml
 */
export interface FkNodeYaml {
    /**
     * Divine protection, basically to ignore stuff. Must always be an array.
     *
     * @type {("updater" | "cleaner" | "linter" | "prettifier" | "destroyer")[] | "*" | "disabled"}
     */
    divineProtection?: ("updater" | "cleaner" | "linter" | "prettifier" | "destroyer")[] | "*" | "disabled";
    /**
     * If `--lint` is passed to `clean`, this script will be used to lint the project. It must be a runtime script (defined in `package.json` -> `scripts`), and must be a single word (no need for "npm run" prefix). `__ESLINT` overrides these rules (it's the default).
     *
     * @type {string}
     */
    lintCmd?: string | "__ESLINT";
    /**
     * If `--pretty` is passed to `clean`, this script will be used to prettify the project. It must be a runtime script (defined in `package.json` -> `scripts`), and must be a single word (no need for "npm run" prefix). `__PRETTIER` overrides these rules (it's the default).
     *
     * @type {string}
     */
    prettyCmd?: string | "__PRETTIER";
    /**
     * If provided, file paths in `targets` will be removed when `clean` is called with any of the `intensities`. If not provided defaults to `maxim` intensity and `node_modules` path. Specifying `targets` _without_ `node_modules` does not override it, meaning it'll always be cleaned.
     *
     * @type {{
     *         intensities: (CleanerIntensity | "*")[],
     *         targets: string[]
     *     }}
     */
    destroy?: {
        intensities: (CleanerIntensity | "*")[];
        targets: string[];
    };
    /**
     * If true, if an action that changes the code is performed (update, prettify, or destroy) and the Git workspace is clean (no uncommitted stuff), a commit will be made.
     *
     * @type {boolean}
     */
    commitActions?: boolean;
    /**
     * If provided, if a commit is made (`commitActions`) this will be the commit message. If not provided a default message is used. `__USE_DEFAULT` indicates to use the default.
     *
     * @type {(string | "__USE_DEFAULT")}
     */
    commitMessage?: string | "__USE_DEFAULT";
    /**
     * If provided, uses the provided runtime script command for the updating stage, overriding the default command. Like `lintCmd` or `prettyCmd`, it must be a runtime script.
     *
     * @type {(string | "__USE_DEFAULT")}
     */
    updateCmdOverride?: string | "__USE_DEFAULT";
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

    return true;
}

/**
 * File where info for the updater is stored in YAML format.
 *
 * @export
 * @interface CF_FKNODE_UPDATES
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
