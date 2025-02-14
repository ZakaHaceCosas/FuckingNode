import { Commander } from "../functions/cli.ts";
import { JoinPaths } from "../functions/filesystem.ts";
import { ColorString, LogStuff } from "../functions/io.ts";
import { GetProjectEnvironment, SpotProject } from "../functions/projects.ts";
import { FULL_NAME } from "../constants.ts";
import { StringUtils } from "@zakahacecosas/string-utils";

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
    Commit: async (project: string, message: string, add: string[] | "all" | "none", avoid: string[]): Promise<0 | 1> => {
        try {
            const path = await SpotProject(project);

            const toAdd = add === "none" ? [] : add === "all" ? ["-A"] : [];

            if (toAdd.length > 0) {
                const addOutput = await Commander(
                    "git",
                    [
                        "-C",
                        path,
                        "add",
                        ...toAdd,
                    ],
                    false,
                );
                if (!addOutput.success) {
                    throw new Error(addOutput.stdout);
                }
            }
            if (avoid.length > 0) {
                const restoreOutput = await Commander(
                    "git",
                    [
                        "-C",
                        path,
                        "restore",
                        "--staged",
                        ...avoid,
                    ],
                    false,
                );
                if (!restoreOutput.success) {
                    throw new Error(restoreOutput.stdout);
                }
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
                false,
            );
            if (!commitOutput.success) {
                if (commitOutput.stdout?.includes("working tree clean")) return 0;
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
    Push: async (project: string, branch: string | false): Promise<0 | 1> => {
        try {
            const path = await SpotProject(project);

            const pushToBranch = branch === false ? [] : ["origin", branch.trim()];

            const pushOutput = await Commander(
                "git",
                [
                    "-C",
                    path,
                    "push",
                    ...pushToBranch,
                ],
                false,
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
    /**
     * Make sure to `Git.Commit()` changes to `.gitignore`.
     */
    Ignore: async (project: string, toBeIgnored: string): Promise<0 | 1> => {
        try {
            const path = await SpotProject(project);
            const env = await GetProjectEnvironment(path);
            const gitIgnoreFile = await JoinPaths(env.root, ".gitignore");
            const gitIgnoreContent = await Deno.readTextFile(gitIgnoreFile);

            if (gitIgnoreContent.includes(toBeIgnored)) return 0;

            await Deno.writeTextFile(
                gitIgnoreFile,
                `# auto-added by ${FULL_NAME} release command\n${toBeIgnored}`,
                {
                    append: true,
                },
            );

            await LogStuff(
                `Ignored ${toBeIgnored} successfully`,
                "tick",
            );

            return 0;
        } catch (e) {
            await LogStuff(
                `Error - could not ignore file ${toBeIgnored} at ${ColorString(project, "bold")} because of error: ${e}`,
                "error",
            );

            return 1;
        }
    },
    Tag: async (project: string, tag: string, push: boolean): Promise<0 | 1> => {
        try {
            const path = await SpotProject(project);
            const tagOutput = await Commander(
                "git",
                [
                    "-C",
                    path,
                    "tag",
                    tag.trim(),
                ],
                false,
            );
            if (!tagOutput.success) {
                throw new Error(tagOutput.stdout);
            }
            if (push) {
                const pushOutput = await Commander(
                    "git",
                    [
                        "-C",
                        path,
                        "push",
                        "origin",
                        "--tags",
                    ],
                    false,
                );
                if (!pushOutput.success) {
                    throw new Error(pushOutput.stdout);
                }
            }
            return 0;
        } catch (e) {
            await LogStuff(
                `Error - could not create tag ${tag} at ${ColorString(project, "bold")} because of error: ${e}`,
                "error",
            );

            return 1;
        }
    },
    GetLatestTag: async (project: string): Promise<string | undefined> => {
        try {
            const path = await SpotProject(project);
            const getTagOutput = await Commander(
                "git",
                [
                    "-C",
                    path,
                    "describe",
                    "--tags",
                    "--abbrev=0",
                ],
                false,
            );
            if (!getTagOutput.success) {
                throw new Error(getTagOutput.stdout);
            }
            if (!getTagOutput.stdout) {
                throw new Error(`git describe --tags --abbrev=0 returned an undefined output for ${path}`);
            }
            return getTagOutput.stdout.trim(); // describe --tags --abbrev=0 should return a string with nothing but the latest tag, so this will do
        } catch (e) {
            await LogStuff(
                `Error - could not get latest tag at ${ColorString(project, "bold")} because of error: ${e}`,
                "error",
            );

            return undefined;
        }
    },
    GetFilesReadyForCommit: async (project: string): Promise<string[]> => {
        try {
            const path = await SpotProject(project);
            const getFilesOutput = await Commander(
                "git",
                [
                    "-C",
                    path,
                    "diff",
                    "--cached",
                    "--name-only",
                ],
                false,
            );
            if (!getFilesOutput.success) {
                throw new Error(getFilesOutput.stdout);
            }
            if (!getFilesOutput.stdout) {
                throw new Error(`git diff --cached --name-only returned an undefined output for ${path}`);
            }
            return StringUtils.softlyNormalizeArray(getFilesOutput.stdout.split("\n"));
        } catch (e) {
            await LogStuff(
                `Error - could not get staged files at ${ColorString(project, "bold")} because of error: ${e}`,
                "error",
            );
            return [];
        }
    },
    GetBranches: async (project: string): Promise<{ current: string; all: string[] }> => {
        try {
            const path = await SpotProject(project);
            const getBranchesOutput = await Commander(
                "git",
                [
                    "-C",
                    path,
                    "branch",
                ],
                false,
            );
            if (!getBranchesOutput.success) {
                throw new Error(getBranchesOutput.stdout);
            }
            if (!getBranchesOutput.stdout) {
                throw new Error(`git diff --cached --name-only returned an undefined output for ${path}`);
            }
            const current = getBranchesOutput.stdout.match(/^\* (.+)$/m)![1]!;
            return {
                current,
                all: StringUtils.sortAlphabetically(StringUtils.softlyNormalizeArray(getBranchesOutput.stdout.replace("*", "").split("\n"))),
            };
        } catch (e) {
            await LogStuff(
                `Error - could not get staged files at ${ColorString(project, "bold")} because of error: ${e}`,
                "error",
            );

            return { current: "__ERROR", all: [] };
        }
    },
};
