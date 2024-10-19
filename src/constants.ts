import type { SemVer } from "./types.ts";

/**
 * Current version of the app
 *
 * @type {SemVer}
 */
export const VERSION: SemVer = "1.1.0";

// help
const _USAGE = {
    clean: "                      clean   [--update] [--verbose]",
    add: "                      manager add <item> | remove <item> | ignore <item> | list",
    stats: "                      stats   [--full]",
    version: "                              [--version]",
    help: "                              [--help]",
};
const USAGE = _USAGE.clean +
    "\n" +
    _USAGE.add +
    "\n" +
    _USAGE.stats +
    "\n" +
    _USAGE.version +
    "\n" +
    _USAGE.help;
const _OPTIONS = {
    version: "    --version    Show the version of F*ckingNode you're currently on.",
};
const OPTIONS = _OPTIONS.version;
const _CLEAN_OPTIONS = {
    update: "    --update     Update all your projects before cleaning them.",
    verbose: "    --verbose    Show more detailed ('verbose') logs.",
    maxim: "    --maxim      Maxim clean all projects (recursively remove node_modules/).",
};
const CLEAN_OPTIONS = _CLEAN_OPTIONS.update +
    "\n" +
    _CLEAN_OPTIONS.verbose +
    "\n" +
    _CLEAN_OPTIONS.maxim;
export const HELP = "Usage: fuckingnode\n" +
    USAGE +
    "\n\n'clean' will clean your added projects. Flags:\n" +
    CLEAN_OPTIONS +
    "\n\nAdditional flags:\n" +
    OPTIONS;

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
 * Best CLI app ever (it's name, so you don't, for example, miss-capitalize it).
 *
 * @type {string}
 */
export const APP_NAME: string = "fuckingnode";

/**
 * Name of the ignore file.
 *
 * @type {string}
 */
export const IGNORE_FILE: string = ".fknodeignore";
