import type { tURL } from "./types/misc.ts";
import type { SemVer } from "@std/semver/types";
import { format } from "@std/semver";
import type { CF_FKNODE_SETTINGS, FkNodeYaml } from "./types/config_files.ts";

/**
 * Current app version as a SemVer object.
 *
 * @type {SemVer}
 */
const _SV_VER: SemVer = {
    major: 2,
    minor: 0,
    patch: 2,
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
    STYLED: "F\*ckingNode",
};

/**
 * Different variants of the f-word for in-app usage. Not fully "explicit" as an asterisk is used, like in f*ck.
 *
 * @interface HE_LIKES_JS
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

/**
 * Default app settings.
 *
 * @type {CF_FKNODE_SETTINGS}
 */
export const DEFAULT_SETTINGS: CF_FKNODE_SETTINGS = {
    updateFreq: 5,
    defaultCleanerIntensity: "normal",
    favoriteEditor: "vscode",
};

/**
 * Default project settings.
 *
 * @type {FkNodeYaml}
 */
export const DEFAULT_FKNODE_YAML: FkNodeYaml = {
    divineProtection: "disabled",
    lintCmd: "__ESLINT",
    prettyCmd: "__PRETTIER",
    destroy: {
        intensities: ["maxim"],
        targets: [
            "node_modules",
        ],
    },
    commitActions: false,
    commitMessage: "__USE_DEFAULT",
    updateCmdOverride: "__USE_DEFAULT",
};
