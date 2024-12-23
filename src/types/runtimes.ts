/**
 * NodeJS `package.json` props, only the ones we need.
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
 * Bun `bunfig.toml` props, only the ones we need.
 *
 * @export
 * @interface BunfigToml
 */
export interface BunfigToml {
    name?: string;
    version?: string;
    /* main?: string;
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>; */
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
     * Parsed path to lockfile.
     *
     * @type {string}
     */
    lockfile: string;
    /**
     * Path to `node_modules`.
     *
     * @type {string}
     */
    hall_of_trash: string;
    /**
     * Path to main file (`package.json`, `deno.json`...)
     *
     * @type {string}
     */
    main: string;
}
