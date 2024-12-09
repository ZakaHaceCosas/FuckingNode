import { Commander } from "../functions/cli.ts";
import { ParsePath } from "../functions/filesystem.ts";
import { LogStuff } from "../functions/io.ts";

/**
 * Checks if a local repository has uncommitted changes or not. Returns `true` if there ARE uncommitted changes, and `false` if otherwise.
 *
 * @export
 * @async
 * @param {string} path Path to the repo.
 * @returns {Promise<boolean>}
 */
export async function IsWorkingTreeClean(path: string): Promise<boolean> {
    try {
        const resolvedPath = await ParsePath(path);

        // make sure we're in a repo
        const isRepo = await Commander(
            "git",
            [
                "-C",
                resolvedPath,
                "rev-parse",
                "--is-inside-work-tree",
            ],
            false,
        );
        if (
            !isRepo.success ||
            isRepo.stdout!.trim() !== "true"
        ) {
            return false;
        }

        const output = await Commander(
            "git",
            [
                "-C",
                resolvedPath,
                "status",
                "--porcelain",
            ],
            false,
        );
        if (
            !output.success ||
            output.stdout!.trim().length !== 0 // anything that isn't 0 means something is in the tree
        ) {
            return false; // if anything happens we assume the tree isn't clean, just in case.
        }
        return true;
    } catch (e) {
        await LogStuff(`An error happened validating the Git working tree: ${e}`, "error");
        return false;
    }
}
