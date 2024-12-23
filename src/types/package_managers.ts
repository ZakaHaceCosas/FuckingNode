/**
 * Supported lockfile type that the app recognizes as fully cleanable (NodeJS).
 *
 * @export
 */
export type SUPPORTED_NODE_LOCKFILES =
    | "package-lock.json"
    | "pnpm-lock.yaml"
    | "yarn.lock";

/**
 * Supported lockfile type that the app recognizes as partially cleanable (Deno and Bun)
 *
 * @export
 */
export type SUPPORTED_NOT_NODE_LOCKFILES =
    | "deno.lock"
    | "bun.lockb";

/**
 * All supported lockfiles.
 *
 * @export
 */
export type ALL_SUPPORTED_LOCKFILES = SUPPORTED_NODE_LOCKFILES | SUPPORTED_NOT_NODE_LOCKFILES;

/**
 * Type guard to check if the lockfile is a SUPPORTED_NODE_LOCKFILE.
 *
 * @param lockfile The lockfile to check.
 * @returns True if lockfile is a SUPPORTED_NODE_LOCKFILE, false otherwise.
 */
export function IsLockfileNodeLockfile(lockfile: string): lockfile is SUPPORTED_NODE_LOCKFILES {
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
export type PKG_MANAGERS = "pnpm" | "npm" | "yarn" | "deno" | "bun";

/**
 * Name and lockfile of a NodeJS package manager.
 *
 * @interface NodePkgManagerProps
 */
export interface NodePkgManagerProps {
    name: "npm" | "pnpm" | "yarn";
    file: "package-lock.json" | "pnpm-lock.yaml" | "yarn.lock";
}
