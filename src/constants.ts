import type { tURL } from "./types/misc.ts";
import type { SemVer } from "@std/semver/types";
import { format } from "@std/semver";
import type { FKNODE_SETTINGS } from "./types/config_files.ts";

const _SV_VER: SemVer = {
    major: 2,
    minor: 0,
    patch: 0,
    prerelease: ["alpha", 3],
};

/**
 * Current version of the app. Uses the SemVer format.
 *
 * @type {string}
 */
export const VERSION: string = format(_SV_VER);

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
export const IGNORE_FILE: string = "fknode.yaml";

/**
 * GitHub REST API URL from where releases are obtained.
 *
 * @type {tURL}
 */
export const RELEASE_URL: tURL = `https://api.github.com/repos/ZakaHaceCosas/${APP_NAME.CASED}/releases/latest`;

export const DEFAULT_SETTINGS: FKNODE_SETTINGS = {
    updateFreq: 5,
    defaultCleanerIntensity: "normal",
    autoFlushFiles: {
        enabled: true,
        freq: 30,
    },
};
