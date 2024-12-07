import { Commander } from "../functions/cli.ts";
import { ParsePath } from "../functions/filesystem.ts";

/**
 * Checks if a local repository has uncommitted changes or not. Returns `true` if there ARE uncommitted changes, and `false` if otherwise.
 *
 * @export
 * @async
 * @param {string} path Path to the repo.
 * @returns {Promise<boolean>}
 */
export async function IsWorkingTreeClean(path: string): Promise<boolean> {
    const output = await Commander(
        "git",
        [
            "-C",
            await ParsePath(path),
            "status",
            "--porcelain",
        ],
        false,
    );
    if (!output.success) return false; // if an error happens we assume the tree isn't clean, just in case.
    if (output.stdout.trim().length === 0) return false;
    return true;
}
