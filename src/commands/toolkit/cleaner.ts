import { I_LIKE_JS, VERSION } from "../../constants.ts";
import { Commander, CommandExists } from "../../functions/cli.ts";
import { GetSettings } from "../../functions/config.ts";
import { CheckForPath, JoinPaths, ParsePath } from "../../functions/filesystem.ts";
import { ColorString, LogStuff } from "../../functions/io.ts";
import { GetProjectEnvironment, GetProjectSettings, NameProject, UnderstandProjectSettings } from "../../functions/projects.ts";
import type { CleanerIntensity } from "../../types/config_params.ts";
import type { ALL_SUPPORTED_LOCKFILES } from "../../types/package_managers.ts";
import type { NodePkgJson, ProjectEnv } from "../../types/runtimes.ts";
import { FknError } from "../../utils/error.ts";
import { IsWorkingTreeClean } from "../../utils/git.ts";
import type { tRESULT } from "../clean.ts";
import type { FkNodeYaml } from "../../types/config_files.ts";

type tBaseCommand = "npm" | "pnpm" | "yarn" | "deno" | "bun";
type tExecCommand = ["npx"] | ["pnpm", "dlx"] | ["yarn", "dlx"] | ["bunx"] | ["deno", "run"];

const ProjectCleaningFeatures = {
    Update: async (
        command: string,
        project: string,
        args: string[],
    ) => {
        await LogStuff(
            `Updating using ${command} for ${project}.`,
            "package",
        );
        await LogStuff(`${command} ${args}\n`, "package");
        await Commander(command, args);
    },
    Clean: async (
        command: string,
        project: string,
        args: string[][],
        intensity: CleanerIntensity,
        maximPath: string,
    ) => {
        await LogStuff(
            `Cleaning using ${command} for ${project}.`,
            "package",
        );
        for (const arg of args!) {
            await LogStuff(`${command} ${args.join(" ")}\n`, "package");
            await Commander(command, arg);
        }
        if (intensity === "maxim") {
            await LogStuff(
                `Maxim pruning for ${project} (path: ${maximPath}).`,
                "trash",
            );
            if (!(await CheckForPath(maximPath))) {
                await LogStuff(
                    `An error happened with maxim pruning at ${project}. Skipping this ${I_LIKE_JS.MF}...`,
                    "bruh",
                );
            }
            await Deno.remove(maximPath, {
                recursive: true,
            });
            await LogStuff(
                `Maxim pruned ${project}.`,
                "tick-clear",
            );
        }
    },
    Lint: async (
        settings: FkNodeYaml,
        project: string,
        baseCommand: tBaseCommand,
        execCommand: tExecCommand,
        env: ProjectEnv,
    ) => {
        if (baseCommand === "deno") return; // unsupported
        if (!settings.lintCmd || settings.lintCmd.trim() === "") return;
        if (settings.lintCmd === "__ESLINT") {
            const lockfile: NodePkgJson = await JSON.parse(await Deno.readTextFile(env.lockfile));
            if (!lockfile.dependencies || !lockfile.dependencies["eslint"]) {
                await LogStuff(
                    `Can't lint ${NameProject(project)}. No lint command was specified and ESLint is not installed.`,
                );
                return;
            }
            if (execCommand.length === 1) {
                await Commander(
                    execCommand[0],
                    [
                        "eslint",
                        "--fix",
                        ".",
                    ],
                );
            } else {
                await Commander(execCommand[0], [
                    execCommand[1],
                    "eslint",
                    "--fix",
                    ".",
                ]);
            }
        } else {
            await Commander(
                baseCommand,
                ["run", settings.lintCmd],
            );
        }
    },
    Prettify: async (
        settings: FkNodeYaml,
        project: string,
        baseCommand: tBaseCommand,
        execCommand: tExecCommand,
        env: ProjectEnv,
    ) => {
        if (baseCommand === "deno") {
            await Commander(
                "deno",
                [
                    "fmt",
                ],
            ); // customization unsupported
            return;
        }
        if (!settings.prettyCmd || settings.prettyCmd.trim() === "") return;
        if (settings.prettyCmd === "__PRETTIER") {
            const lockfile: NodePkgJson = await JSON.parse(await Deno.readTextFile(env.lockfile));
            if (!lockfile.dependencies || !lockfile.dependencies["eslint"]) {
                await LogStuff(
                    `Can't prettify ${NameProject(project)}. No prettify command was specified and Prettier is not installed.`,
                );
                return;
            }
            if (execCommand.length === 1) {
                await Commander(
                    execCommand[0],
                    [
                        "prettier",
                        ".",
                    ],
                );
            } else {
                await Commander(execCommand[0], [
                    execCommand[1],
                    "prettier",
                    ".",
                ]);
            }
        } else {
            await Commander(
                baseCommand,
                ["run", settings.prettyCmd],
            );
        }
    },
    Commit: async (
        settings: FkNodeYaml,
        isGitClean: boolean,
        shouldUpdate: boolean,
        shouldLint: boolean,
        shouldPrettify: boolean,
    ) => {
        if (!shouldUpdate && !shouldLint && !shouldPrettify) {
            await LogStuff("No actions to be committed.", "bruh");
            return;
        }
        if (settings.commitActions === false) {
            await LogStuff("No committing allowed.", "bruh");
            return;
        }
        if (!isGitClean) {
            await LogStuff("Tree isn't clean, can't commit", "bruh");
        }
        const getCommitMessage = () => {
            if (settings.commitMessage) {
                return settings.commitMessage;
            }

            const tasks: string[] = [];

            if (shouldUpdate) tasks.push("updating");
            if (shouldLint) tasks.push("linting");
            if (shouldPrettify) tasks.push("prettifying");

            const taskString = tasks.join(" and ");
            return `Code ${taskString} tasks (Auto-generated by F*ckingNode v${VERSION})`;
        };

        const commitMessage = getCommitMessage();

        await Commander(
            "git",
            [
                "add",
                "-A",
            ],
        );
        await Commander(
            "git",
            [
                "commit",
                "-m",
                commitMessage,
            ],
        );
    },
    Destroy: async (
        settings: FkNodeYaml,
        project: string,
        intensity: CleanerIntensity,
    ) => {
        if (!settings.destroy) return;
        if (!(settings.destroy.intensities.includes(intensity))) return;
        if (settings.destroy.targets.length === 0) return;
        for (const target of settings.destroy.targets) {
            if (target === "node_modules" && intensity === "maxim") continue; // avoid removing this thingy twice
            const path = await ParsePath(await JoinPaths(project, target));
            try {
                await Deno.remove(path);
                await LogStuff(`Destroyed ${path} successfully`, "tick");
                continue;
            } catch (e) {
                await LogStuff(`Error destroying ${path}: ${e}`, "error");
                continue;
            }
        }
    },
};

/**
 * Cleans a project.
 *
 * @export
 * @async
 * @param {ALL_SUPPORTED_LOCKFILES} lockfile
 * @param {string} projectInQuestion
 * @param {boolean} shouldUpdate
 * @param {boolean} shouldClean
 * @param {boolean} shouldPrettify
 * @param {boolean} shouldCommit
 * @param {("normal" | "hard" | "maxim")} intensity
 * @returns {Promise<void>}
 */
export async function PerformCleaning(
    lockfile: ALL_SUPPORTED_LOCKFILES,
    projectInQuestion: string,
    shouldUpdate: boolean,
    shouldClean: boolean,
    shouldLint: boolean,
    shouldPrettify: boolean,
    shouldCommit: boolean,
    intensity: "normal" | "hard" | "maxim",
): Promise<void> {
    try {
        const motherfuckerInQuestion = await ParsePath(projectInQuestion);
        const maximPath = await JoinPaths(
            motherfuckerInQuestion,
            "node_modules",
        );
        const workingEnv = await GetProjectEnvironment(motherfuckerInQuestion);
        const isGitClean = await IsWorkingTreeClean(motherfuckerInQuestion);
        const settings = await GetProjectSettings(motherfuckerInQuestion);

        let baseCommand: tBaseCommand;
        let execCommand: tExecCommand;
        let pruneArgs: string[][];
        let updateArgs: string[];
        let canClean: boolean;
        switch (lockfile) {
            case "package-lock.json":
                baseCommand = "npm";
                pruneArgs = [["dedupe"], ["prune"]];
                updateArgs = ["update"];
                execCommand = ["npx"];
                canClean = true;
                break;
            case "pnpm-lock.yaml":
                baseCommand = "pnpm";
                pruneArgs = [["dedupe"], ["prune"]];
                updateArgs = ["update"];
                execCommand = ["pnpm", "dlx"];
                canClean = true;
                break;
            case "yarn.lock":
                baseCommand = "yarn";
                pruneArgs = [["autoclean", "--force"]];
                updateArgs = ["upgrade"];
                execCommand = ["yarn", "dlx"];
                canClean = true;
                break;
            case "bun.lockb":
                baseCommand = "bun";
                updateArgs = ["update"];
                execCommand = ["bunx"];
                canClean = false;
                break;
            case "deno.lock":
                baseCommand = "deno";
                updateArgs = ["outdated", "--update"];
                execCommand = ["deno", "run"];
                canClean = false;
                break;
        }

        if (shouldUpdate) {
            await ProjectCleaningFeatures.Update(
                baseCommand,
                motherfuckerInQuestion,
                updateArgs,
            );
        }
        if (canClean && shouldClean) {
            await ProjectCleaningFeatures.Clean(
                baseCommand,
                motherfuckerInQuestion,
                pruneArgs!,
                intensity,
                maximPath,
            );
        }
        if (shouldLint) {
            await ProjectCleaningFeatures.Lint(
                settings,
                motherfuckerInQuestion,
                baseCommand,
                execCommand,
                workingEnv,
            );
        }
        if (shouldPrettify) {
            await ProjectCleaningFeatures.Prettify(
                settings,
                motherfuckerInQuestion,
                baseCommand,
                execCommand,
                workingEnv,
            );
        }
        if (shouldCommit) {
            ProjectCleaningFeatures.Commit(
                settings,
                isGitClean,
                shouldUpdate,
                shouldLint,
                shouldPrettify,
            );
        }
    } catch (e) {
        throw e;
    }
}

// cache cleaning is global, so doing these for every project like we used to do
// is a waste of resources
/**
 * Performs a hard cleanup, AKA cleans global caches.
 *
 * @export
 * @async
 * @returns {Promise<void>}
 */
export async function PerformHardCleanup(): Promise<void> {
    await LogStuff(
        ColorString("Time for hard-pruning! Wait patiently, please (caches can take a while to clean).", "italic"),
        "package",
    );

    const tmp = await Deno.makeTempDir({
        prefix: "FKNODE-HARD-CLEAN-TMP",
    }); // we make a temporal dir where we'll do "placebo" inits, as bun requires you to be in a bun project for it to clean stuff
    // for deno idk if its necessary but i'll do it anyway

    Deno.chdir(tmp); // assuming this is called from the main cleaner, which at the end returns to the DIR it should.

    const npmHardPruneArgs: string[] = ["cache", "clean", "--force"];
    const pnpmHardPruneArgs: string[] = ["store", "prune"];
    const yarnHardPruneArgs: string[] = ["cache", "clean"];
    // bun and deno don't support yet project-wide cleanup
    // but they do support system-wide cleanup thanks to this
    // now F*kingNode is F*ckingJavascriptRuntimes :]
    const bunHardPruneArgs: string[] = ["pm", "cache", "rm"];
    // const denoHardPruneArgs: string[] = ["clean"];

    if (await CommandExists("npm")) {
        await LogStuff(
            ColorString("NPM", "red"),
            "package",
        );
        await Commander("npm", npmHardPruneArgs, true);
        await LogStuff("Done", "tick");
    }
    if (await CommandExists("pnpm")) {
        await LogStuff(
            ColorString("PNPM", "bright-yellow"),
            "package",
        );
        await Commander("pnpm", pnpmHardPruneArgs, true);
        await LogStuff("Done", "tick");
    }
    if (await CommandExists("yarn")) {
        await LogStuff(
            ColorString("YARN", "purple"),
            "package",
        );
        await Commander("yarn", yarnHardPruneArgs, true);
        await LogStuff("Done", "tick");
    }

    if (await CommandExists("bun")) {
        await LogStuff(
            ColorString("BUN", "pink"),
            "package",
        );
        await Commander("bun", ["init", "-y"], false); // placebo
        await Commander("bun", bunHardPruneArgs, true);
        await LogStuff("Done", "tick");
    }
    /* if (await CommandExists("deno")) {
        await Commander("deno", ["init"], false); // placebo 2
        await Commander("deno", denoHardPruneArgs, true);
    } */

    // deno requires this glue fix
    // because apparently i cannot clear the cache of deno
    // using a program thats written in deno
    // and it throws an error and exists the CLI
    // epic.
    if (await CommandExists("deno")) {
        try {
            const denoDir: string | undefined = Deno.env.get("DENO_DIR");
            if (!denoDir) throw "lmao";
            await LogStuff(
                ColorString("DENO", "bright-blue"),
                "package",
            );
            await Deno.remove(denoDir);
            await LogStuff("Done", "tick");
            // the CLI calls this kind of behaviors "maxim" cleanup
            // yet we're doing from the "hard" preset and not the
            // "maxim" one
            // epic.
        } catch {
            // nothing happened.
        }
    }

    try {
        await Deno.remove(tmp, {
            recursive: true,
        }); // free the user's space
    } catch (e) {
        await LogStuff(
            "[ERROR] Due to an unknown error, a temporal DIR wasn't deleted. DIR path:\n" + tmp + "\nError:\n" + e,
            "error",
            undefined,
            undefined,
            false,
        );
    }

    return;
}

/**
 * Validates the provided intensity and handles stuff like `--`.
 *
 * @export
 * @async
 * @param {string} intensity
 * @returns {Promise<CleanerIntensity>}
 */
export async function ValidateIntensity(intensity: string): Promise<CleanerIntensity> {
    if (!["hard", "hard-only", "normal", "maxim", "--"].includes(intensity)) {
        throw new FknError("Cleaner__InvalidCleanerIntensity", `Provided intensity '${intensity}' is not valid.`);
    }

    const workingIntensity = intensity as CleanerIntensity | "--";
    const defaultIntensity = (await GetSettings()).defaultCleanerIntensity;

    if (workingIntensity === "--") {
        return defaultIntensity;
    }

    if (workingIntensity === "hard-only") {
        return "hard-only";
    }

    if (workingIntensity === "maxim") {
        const confirmMaxim = await LogStuff(
            ColorString(
                "Are you sure you want to use maxim cleaning? It will entirely remove the node_modules DIR for ALL of your projects.",
                "italic",
            ),
            "warn",
            undefined,
            true,
        );
        return confirmMaxim === true ? "maxim" : defaultIntensity;
    } else {
        return defaultIntensity;
    }
}

/**
 * Shows a basic report.
 *
 * @export
 * @async
 * @param {{ path: string; status: string }[]} results
 * @returns {Promise<void>}
 */
export async function ShowReport(results: tRESULT[]): Promise<void> {
    // shows a report
    await LogStuff("Report:", "chart", false);
    const report: string[] = [];
    for (const result of results) {
        const name = await NameProject(result.path);
        const status = ColorString(result.status, "bold");
        const elapsedTime = ColorString(result.elapsedTime, "italic");

        const theResult = `${name} -> ${status}, taking us ${elapsedTime}`;
        report.push(theResult);
    }
    const sortedReport = report.sort((a, b) => {
        return a
            .toLowerCase()
            .localeCompare(b.toLowerCase());
    }).join("\n");
    await LogStuff(sortedReport, undefined, false);
    await LogStuff(
        ColorString(`Cleaning completed at ${new Date().toLocaleString()}`, "bright-green"),
        "tick",
        false,
    );
}

/**
 * Tells you about the protection of a project.
 *
 * @export
 * @async
 * @param {(string )} path
 * @param {boolean} update
 * @returns {{
 *     doClean: boolean;
 *     doUpdate: boolean;
 *     preliminaryStatus?: "Fully protected" | "Cleanup protected" | "Update protected";
 * }}
 */
export async function ResolveProtection(path: string, update: boolean): Promise<{
    doClean: boolean;
    doUpdate: boolean;
    preliminaryStatus?: "Fully protected" | "Cleanup protected" | "Update protected";
}> {
    const protection = UnderstandProjectSettings.protection(await GetProjectSettings(path));
    switch (protection) {
        case "*":
            return { doClean: false, doUpdate: false, preliminaryStatus: "Fully protected" };
        case "cleanup":
            return { doClean: false, doUpdate: true, preliminaryStatus: "Cleanup protected" };
        case "updater":
            return { doClean: true, doUpdate: false, preliminaryStatus: "Update protected" };
        case null:
            return { doClean: true, doUpdate: update };
    }
}
