import { Commander } from "../functions/cli.ts";
import { ColorString, LogStuff } from "../functions/io.ts";
import { SpotProject } from "../functions/projects.ts";

export const Git = {
    /**
     * Checks if a local repository has uncommitted changes or not. Returns `true` if there ARE uncommitted changes, and `false` if otherwise.
     *
     * @export
     * @async
     * @param {string} path Path to the repo, or project name.
     * @returns {Promise<boolean>}
     */
    IsWorkingTreeClean: async (path: string): Promise<boolean> => {
        try {
            const resolvedPath = await SpotProject(path);

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

            // check for uncommitted changes
            const localChanges = await Commander(
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
                !localChanges.success || localChanges.stdout!.trim().length !== 0 // anything that isn't 0 means something is in the tree
            ) {
                return false; // if anything happens we assume the tree isn't clean, just in case.
            }

            // check if the local branch is behind the remote
            const remoteStatus = await Commander(
                "git",
                [
                    "-C",
                    resolvedPath,
                    "rev-list",
                    "--count",
                    "--left-only",
                    "@{u}...HEAD",
                ],
                false,
            );
            if (
                remoteStatus.success &&
                parseInt(remoteStatus.stdout!.trim(), 10) > 0
            ) {
                return false; // local branch is behind the remote, so we shouldn't change stuff
            }

            return true; // clean working tree and up to date with remote, we can do whatever we want
        } catch (e) {
            await LogStuff(`An error happened validating the Git working tree: ${e}`, "error");
            return false;
        }
    },
    Commit: async (project: string, message: string, showOutput: boolean): Promise<0 | 1> => {
        try {
            const path = await SpotProject(project);

            const addOutput = await Commander(
                "git",
                [
                    "-C",
                    path,
                    "add",
                    "-A",
                ],
                showOutput,
            );
            if (!addOutput.success) {
                throw new Error(addOutput.stdout);
            }
            const commitOutput = await Commander(
                "git",
                [
                    "-C",
                    path,
                    "commit",
                    "-m",
                    message.trim(),
                ],
                showOutput,
            );
            if (!commitOutput.success) {
                throw new Error(commitOutput.stdout);
            }
            return 0;
        } catch (e) {
            await LogStuff(
                `Error - could not create commit ${ColorString(message, "bold")} at ${ColorString(project, "bold")} because of error: ${e}`,
                "error",
            );
            return 1;
        }
    },
    Push: async (project: string, showOutput: boolean): Promise<0 | 1> => {
        try {
            const path = await SpotProject(project);

            const pushOutput = await Commander(
                "git",
                [
                    "-C",
                    path,
                    "push",
                ],
                showOutput,
            );
            if (!pushOutput.success) {
                throw new Error(pushOutput.stdout);
            }
            return 0;
        } catch (e) {
            await LogStuff(
                `Error - could not push at ${ColorString(project, "bold")} because of error: ${e}`,
                "error",
            );
            return 1;
        }
    },
};
