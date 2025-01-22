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
 * Info about a JavaScript project's environment (runtime and package manager).
 *
 * @interface JsProjectEnvironment
 */
export interface JsProjectEnvironment {
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
         * Name of the main file.
         *
         * @type {("package.json" | "deno.json" | "deno.jsonc")}
         */
        name: "package.json" | "deno.json" | "deno.jsonc";
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
         * @type {SUPPORTED_JAVASCRIPT_LOCKFILE}
         */
        name: SUPPORTED_JAVASCRIPT_LOCKFILE;
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
         * Run commands. `string[]` as it's always made of two parts.
         *
         * @type {(["deno", "task"] | ["npm", "run"] | ["bun", "run"] | ["pnpm", "run"] | ["yarn", "run"])}
         */
        run: ["deno", "task"] | ["npm", "run"] | ["bun", "run"] | ["pnpm", "run"] | ["yarn", "run"];
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
         * @type {(["audit", "--ignore-registry-errors"] | ["audit", "--include-workspace-root"] | "__UNSUPPORTED")}
         */
        audit: ["audit", "--ignore-registry-errors"] | ["audit", "--include-workspace-root"] | "__UNSUPPORTED";
        /**
         * Package publish commands.
         *
         * @type {(["publish"] | ["publish", "--non-interactive"] | ["publish", "--check=all"])}
         */
        publish: ["publish"] | ["publish", "--non-interactive"] | ["publish", "--check=all"];
    };
    /**
     * File paths to valid workspaces.
     *
     * @type {(string[] | "no")}
     */
    workspaces: string[] | "no";
}

/**
 * Supported lockfile type that the app recognizes as fully cleanable (NodeJS).
 *
 * @export
 */
export type SUPPORTED_JS_NODE_LOCKFILE =
    | "package-lock.json"
    | "pnpm-lock.yaml"
    | "yarn.lock";

/**
 * Supported lockfile type that the app recognizes as partially cleanable (Deno and Bun)
 *
 * @export
 */
export type SUPPORTED_JS_ANTINODE_LOCKFILE =
    | "deno.lock"
    | "bun.lockb"
    | "bun.lock";

/**
 * All supported lockfiles.
 *
 * @export
 */
export type SUPPORTED_JAVASCRIPT_LOCKFILE = SUPPORTED_JS_NODE_LOCKFILE | SUPPORTED_JS_ANTINODE_LOCKFILE;

/**
 * Type guard to check if the lockfile is a SUPPORTED_NODE_LOCKFILE.
 *
 * @param lockfile The lockfile to check.
 * @returns True if lockfile is a SUPPORTED_NODE_LOCKFILE, false otherwise.
 */
export function IsLockfileNodeLockfile(lockfile: string): lockfile is SUPPORTED_JS_NODE_LOCKFILE {
    return (
        lockfile === "package-lock.json" ||
        lockfile === "pnpm-lock.yaml" ||
        lockfile === "yarn.lock"
    );
}

/**
 * Package manager commands for supported managers.
 *
 * @export
 */
export type NODE_PKG_MANAGERS = "pnpm" | "npm" | "yarn";

export type ANTINODE_PKG_MANAGERS = "deno" | "bun";

export type SUPPORTED_JAVASCRIPT_MANAGER = ANTINODE_PKG_MANAGERS | NODE_PKG_MANAGERS;
