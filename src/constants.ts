// app version

import type { SemVer } from "./types.ts";

/**
 * Current version of the app
 *
 * @type {SemVer}
 */
export const VERSION: SemVer = "1.0.2";

// help
const _USAGE = {
    clean: "                      clean   [--update] [--verbose]",
    add: "                      manager add <item> | remove <item> | list",
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
 * @interface heLikesJs
 * @typedef {heLikesJs}
 */
interface heLikesJs {
    /**
     * Base word. 4 letters.
     *
     * @type {string}
     */
    f: string;
    /**
     * Base word but with -ing.
     *
     * @type {string}
     */
    fkn: string;
    /**
     * Noun. What we call a project that's made with NodeJS. Base word but mentioning his mother (-er).
     *
     * @type {string}
     */
    mf: string;
    /**
     * Plural for `mf`.
     *
     * @type {string}
     */
    mfs: string;
    /**
     * Adjective. What we describe a project that's made with NodeJS as.
     *
     * @type {string}
     */
    mfn: string;
    /**
     * _"Something went **mother** + `fkn` + **ly**"_
     *
     * @type {string}
     */
    mfly: string;
}

/**
 * Different variants of the f-word for in-app usage. Not fully "explicit" as an asterisk is used, like in f*ck.
 *
 * @type {heLikesJs}
 */
export const iLikeJs: heLikesJs = {
    f: "f*ck",
    fkn: "f*cking",
    mf: "m*therf*cker",
    mfs: "m*therf*ckers",
    mfn: "m*therf*cking",
    mfly: "m*therf*ckingly",
};

/**
 * Best CLI app ever (it's name, so you don't, for example, miss-capitalize it).
 *
 * @type {"fuckingnode"}
 */
export const CliName: "fuckingnode" = "fuckingnode" as const;
