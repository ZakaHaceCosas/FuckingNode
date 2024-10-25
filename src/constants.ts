import type { SemVer, tURL } from "./types.ts";
import { SpaceString } from "./functions.ts";

/**
 * Current version of the app
 *
 * @type {SemVer}
 */
export const VERSION: SemVer = "1.4.0";

/**
 * Best CLI app ever (it's name, so you don't, for example, miss-capitalize it).
 *
 * @type {{CASED: string, CLI: string, STYLED: string}}
 */
export const APP_NAME: { CASED: string; CLI: string; STYLED: string } = {
    CASED: "FuckingNode",
    CLI: "fuckingnode",
    STYLED: "F*ckingNode",
};

// help
const _USAGE = {
    clean: SpaceString("clean   [--update] [--verbose]", 8),
    manager: SpaceString("manager add <path> | remove <path> | ignore <path> | revive <path> | list | cleanup", 8),
    stats: SpaceString("stats   [--full]", 8),
    migrate: SpaceString("migrate", 8),
    self_update: SpaceString("self-update", 8),
    version: SpaceString("[--version]", 8),
    help: SpaceString("[--help]", 8),
};
const USAGE = `${_USAGE.clean}\n${_USAGE.manager}\n${_USAGE.stats}\n${_USAGE.self_update}\n${_USAGE.version}\n${_USAGE.help}`;
const _OPTIONS = {
    version: SpaceString(`--version       Show the version of ${APP_NAME.STYLED} you're currently on.`, 4),
};
const OPTIONS = _OPTIONS.version;
const _CLEAN_OPTIONS = {
    update: SpaceString("--update        Update all your projects before cleaning them.", 4),
    verbose: SpaceString("--verbose       Show more detailed ('verbose') logs.", 4),
    maxim: SpaceString("--maxim         Maxim clean all projects (recursively remove node_modules/).", 4),
};
const _MANAGER_OPTIONS = {
    add: SpaceString("add <path>      Adds a project to your list.", 4),
    remove: SpaceString("remove <path>   Removes a project from your list.", 4),
    ignore: SpaceString("ignore <path>   Ignores a project so it's not cleaned or updated but still on your list.", 4),
    revive: SpaceString("revive <path>   Stops ignoring an ignored project.", 4),
    list: SpaceString("list            Lists all of your added projects.", 4),
    cleanup: SpaceString(
        "cleanup         Shows projects that aren't valid (invalid path, no package.json, duplicates...) and lets you remove them.",
        4,
    ),
};
const MANAGER_OPTIONS =
    `${_MANAGER_OPTIONS.add}\n${_MANAGER_OPTIONS.remove}\n${_MANAGER_OPTIONS.ignore}\n${_MANAGER_OPTIONS.list}\n${_MANAGER_OPTIONS.cleanup}`;
const CLEAN_OPTIONS = _CLEAN_OPTIONS.update +
    "\n" +
    _CLEAN_OPTIONS.verbose +
    "\n" +
    _CLEAN_OPTIONS.maxim;
export const HELP = `Usage: ${APP_NAME.CLI}\n` +
    USAGE +
    "\n\n'clean' will clean your added projects. Flags:\n" +
    CLEAN_OPTIONS +
    "\n\n'manager' will let you manage projects. Flags:\n" +
    MANAGER_OPTIONS +
    "\n\nAdditional flags:\n" +
    OPTIONS +
    "\n\nAdditional commands:\n" +
    SpaceString("self-update     Checks the GitHub repo for updates.", 4);

/**
 * Different variants of the f-word for in-app usage. Not fully "explicit" as an asterisk is used, like in f*ck.
 *
 * @interface HE_LIKES_JS
 * @typedef {HE_LIKES_JS}
 */
interface HE_LIKES_JS {
    /**
     * Base word. 4 letters.
     *
     * @type {string}
     */
    FK: string;
    /**
     * Base word but with -ing.
     *
     * @type {string}
     */
    FKN: string;
    /**
     * Noun. What we call a project that's made with NodeJS. Base word but mentioning his mother (-er).
     *
     * @type {string}
     */
    MF: string;
    /**
     * Plural for `mf`.
     *
     * @type {string}
     */
    MFS: string;
    /**
     * Adjective. What we describe a project that's made with NodeJS as.
     *
     * @type {string}
     */
    MFN: string;
    /**
     * _"Something went **mother** + `fkn` + **ly**"_
     *
     * @type {string}
     */
    MFLY: string;
}

/**
 * Different variants of the f-word for in-app usage. Not fully "explicit" as an asterisk is used, like in f*ck.
 *
 * @type {HE_LIKES_JS}
 */
export const I_LIKE_JS: HE_LIKES_JS = {
    FK: "f*ck",
    FKN: "f*cking",
    MF: "m*therf*cker",
    MFS: "m*therf*ckers",
    MFN: "m*therf*cking",
    MFLY: "m*therf*ckingly",
};

/**
 * Name of the ignore file.
 *
 * @type {string}
 */
export const IGNORE_FILE: string = ".fknodeignore";

/**
 * GitHub REST API URL from where releases are obtained.
 *
 * @type {tURL}
 */
export const RELEASE_URL: tURL = `https://api.github.com/repos/ZakaHaceCosas/${APP_NAME.CASED}/releases/latest`;
