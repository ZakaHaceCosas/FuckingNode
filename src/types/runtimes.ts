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
     * Path to the **root** of the project.
     *
     * @type {string}
     */
    root: string;
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
     * Path to `node_modules`.
     *
     * @type {string}
     */
    hall_of_trash: string;
    /**
     * CLI commands for this project.
     *
     * @type {{
     *         base: "npm" | "pnpm" | "yarn" | "deno" | "bun";
     *         exec: string[],
     *         update: string[],
     *         clean: string[] | "__UNSUPPORTED",
     *         hardClean: string[]
     *     }}
     */
    commands: {
        /**
         * Base command.
         *
         * @type {("npm" | "pnpm" | "yarn" | "deno" | "bun")}
         */
        base: "npm" | "pnpm" | "yarn" | "deno" | "bun";
        /**
         * Exec command(s). `string[]` because it can be, e.g., `pnpm dlx`.
         *
         * @type {(["deno", "run"] | ["bunx"] | ["npx"] | ["pnpm", "dlx"] | ["yarn", "dlx"])}
         */
        exec: ["deno", "run"] | ["bunx"] | ["npx"] | ["pnpm", "dlx"] | ["yarn", "dlx"];
        /**
         * Update commands.
         *
         * @type {(["update"] | ["outdated", "--update"] | ["upgrade"])}
         */
        update: ["update"] | ["outdated", "--update"] | ["upgrade"];
        /**
         * Clean commands.
         *
         * @type {(string[][] | "__UNSUPPORTED")}
         */
        clean: string[][] | "__UNSUPPORTED";
        /**
         * Audit commands.
         *
         * @type {(string[] | "__UNSUPPORTED")}
         */
        audit: string[] | "__UNSUPPORTED";
    };
    /**
     * File paths to valid workspaces.
     *
     * @type {(string[] | "no")}
     */
    workspaces: string[] | "no";
}
