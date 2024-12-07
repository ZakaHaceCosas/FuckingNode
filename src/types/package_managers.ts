/**
 * Supported package files.
 *
 * @export
 * @typedef {SUPPORTED_PROJECT_FILE}
 */
export type SUPPORTED_PROJECT_FILE =
    | "package.json"
    | "deno.json";

/**
 * Supported lockfile type that the app recognizes as fully cleanable (NodeJS).
 *
 * @export
 * @typedef {SUPPORTED_NODE_LOCKFILE}
 */
export type SUPPORTED_NODE_LOCKFILE =
    | "package-lock.json"
    | "pnpm-lock.yaml"
    | "yarn.lock";

/**
 * Supported lockfile type that the app recognizes as partially cleanable (Deno and Bun)
 *
 * @export
 * @typedef {SUPPORTED_NOT_NODE_LOCKFILE}
 */
export type SUPPORTED_NOT_NODE_LOCKFILE =
    | "deno.lock"
    | "bun.lockb";

/**
 * All supported lockfiles.
 *
 * @export
 * @typedef {SUPPORTED_LOCKFILES}
 */
export type SUPPORTED_LOCKFILES = SUPPORTED_NODE_LOCKFILE | SUPPORTED_NOT_NODE_LOCKFILE;

/**
 * Type guard to check if the lockfile is a SUPPORTED_NODE_LOCKFILE.
 *
 * @param lockfile The lockfile to check.
 * @returns True if lockfile is a SUPPORTED_NODE_LOCKFILE, false otherwise.
 */
export function IsLockfileNodeLockfile(lockfile: string): lockfile is SUPPORTED_NODE_LOCKFILE {
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
 * @typedef {MANAGERS}
 */
export type MANAGERS = "pnpm" | "npm" | "yarn" | "deno" | "bun";

/**
 * im tired, ill do better jsdoc later.
 *
 * @interface NodeManagerUt
 * @typedef {NodeManagerUt}
 */
export interface NodeManagerUt {
    name: "npm" | "pnpm" | "yarn";
    file: "package-lock.json" | "pnpm-lock.yaml" | "yarn.lock";
}
