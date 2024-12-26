import type { ALL_SUPPORTED_LOCKFILES } from "./package_managers.ts";

/**
 * NodeJS and BunJS `package.json` props, only the ones we need.
 *
 * @export
 * @interface NodePkgJson
 */
export interface NodePkgJson {
    name?: string;
    version?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    workspaces?: string[] | {
        packages: string[];
        nohoist?: string[];
    };
}

/**
 * DenoJS `deno.json` props, only the ones we need.
 *
 * @export
 * @interface DenoPkgJson
 */
export interface DenoPkgJson {
    name?: string;
    version?: string;
    imports?: Record<string, string>;
}

/**
 * Info about a project to know its environment (runtime and package manager).
 *
 * @interface ProjectEnv
 */
export interface ProjectEnv {
    /**
     * JS runtime.
     *
     * @type {("node" | "deno" | "bun")}
     */
    runtime: "node" | "deno" | "bun";
    /**
     * Package manager. For Deno and Bun it just says "deno" and "bun" instead of JSR or NPM (afaik Bun uses NPM) to avoid confusion.
     *
     * @type {("npm" | "pnpm" | "yarn" | "deno" | "bun")}
     */
    manager: "npm" | "pnpm" | "yarn" | "deno" | "bun";
    /**
     * Project's lockfile
     */
    lockfile: {
        /**
         * Parsed path to lockfile.
         *
         * @type {string}
         */
        path: string;
        /**
         * Bare name of the lockfile (`package-lock.json`, `deno.lock`)
         *
         * @type {ALL_SUPPORTED_LOCKFILES}
         */
        name: ALL_SUPPORTED_LOCKFILES;
    };
    /**
     * Path to `node_modules`.
     *
     * @type {string}
     */
    hall_of_trash: string;
    /**
     * Main file (`package.json`, `deno.json`...)
     */
    main: {
        /**
         * Path to the main file
         *
         * @type {string}
         */
        path: string;
        /**
         * Contents of the main file
         *
         * @type {(NodePkgJson | DenoPkgJson)}
         */
        content: NodePkgJson | DenoPkgJson;
    };
}
