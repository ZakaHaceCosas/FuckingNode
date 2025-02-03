import type { UnknownString } from "@zakahacecosas/string-utils";

/**
 * The Cleaner.
 * @author ZakaHaceCosas
 *
 * @export
 * @interface TheCleanerConstructedParams
 */
export interface TheCleanerConstructedParams {
    /**
     * `--flags` to be used.
     *
     * @type {{
     *         verbose: boolean;
     *         update: boolean;
     *         lint: boolean;
     *         prettify: boolean;
     *         commit: boolean;
     *         destroy: boolean;
     *     }}
     */
    flags: {
        verbose: boolean;
        update: boolean;
        lint: boolean;
        prettify: boolean;
        commit: boolean;
        destroy: boolean;
    };
    /**
     * Configuration parameters.
     *
     * @type {{
     *         intensity: string;
     *         project: string | 0;
     *     }}
     */
    parameters: {
        intensity: string;
        project: string | 0;
    };
}

/**
 * The Helper.
 * @author ZakaHaceCosas
 *
 * @export
 * @interface TheHelperConstructedParams
 */
export interface TheHelperConstructedParams {
    /**
     * What to help with.
     *
     * @type {?(string | undefined)}
     */
    query?: string | undefined;
}

/**
 * The Migrator.
 *
 * @export
 * @interface TheMigratorConstructedParams
 */
export interface TheMigratorConstructedParams {
    /**
     * Project to be migrated.
     *
     * @type {UnknownString}
     */
    projectPath: UnknownString;
    /**
     * The manager to migrate to.
     *
     * @type {UnknownString}
     */
    wantedManager: UnknownString;
}

/**
 * The Settings.
 *
 * @export
 * @interface TheSettingsConstructedParams
 */
export interface TheSettingsConstructedParams {
    /**
     * Arguments.
     *
     * @type {string[]}
     */
    args: string[];
}

/**
 * The Updater.
 *
 * @export
 * @interface TheUpdaterConstructedParams
 */
export interface TheUpdaterConstructedParams {
    /**
     * If true, when you're up to date nothing's shown.
     *
     * @type {boolean}
     */
    silent: boolean;
}

/**
 * The Kickstarter.
 *
 * @export
 * @interface TheKickstarterConstructedParams
 */
export interface TheKickstarterConstructedParams {
    /**
     * URL of the Git repository.
     *
     * @type {string}
     */
    gitUrl: string;
    /**
     * Where to clone.
     *
     * @type {?string}
     */
    path?: string;
    /**
     * Package manager to be used, if you want to override upstream repo's manager.
     *
     * @type {?string}
     */
    manager?: string;
}

/**
 * The Releaser.
 * @author ZakaHaceCosas
 *
 * @export
 * @interface TheReleaserConstructedParams
 */
export interface TheReleaserConstructedParams {
    /**
     * Project to be released.
     *
     * @type {UnknownString}
     */
    project: UnknownString;
    /**
     * SemVer version to be released.
     *
     * @type {UnknownString}
     */
    version: UnknownString;
    /**
     * If true, changes are pushed to remote `origin`.
     *
     * @type {boolean}
     */
    push: boolean;
    /**
     * If true, a "dry-run" is made (no release command executed).
     *
     * @type {boolean}
     */
    dry: boolean;
}

/**
 * The Exporter
 * @author ZakaHaceCosas
 *
 * @export
 * @interface TheExporterConstructedParams
 */
export interface TheExporterConstructedParams {
    /**
     * Project to generate FnCPF for.
     *
     * @type {UnknownString}
     */
    project: UnknownString;
    /**
     * Whether to use JSON or not.
     *
     * @type {boolean}
     */
    json: boolean;
    /**
     * Whether to output the file to the CLI too.
     *
     * @type {boolean}
     */
    cli: boolean;
}

/**
 * The Compater
 * @author ZakaHaceCosas
 *
 * @export
 * @interface TheCompaterConstructedParams
 */
export interface TheCompaterConstructedParams {
    /**
     * Feature to fetch compat for.
     *
     * @type {?UnknownString}
     */
    target?: UnknownString;
}

/**
 * The Committer
 * @author ZakaHaceCosas
 *
 * @export
 * @interface TheCommitterConstructedParams
 */
export interface TheCommitterConstructedParams {
    /**
     * Commit message.
     *
     * @type {UnknownString}
     */
    message: UnknownString;
    /**
     * Whether to push changes to remote or not.
     *
     * @type {boolean}
     */
    push: boolean;
    /**
     * Branch to commit to. Optional.
     *
     * @type {?UnknownString}
     */
    branch?: UnknownString;
}
