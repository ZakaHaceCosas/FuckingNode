import { I_LIKE_JS, VERSION } from "../../constants.ts";
import { Commander, CommandExists } from "../../functions/cli.ts";
import { GetSettings } from "../../functions/config.ts";
import { CheckForPath, JoinPaths, ParsePath } from "../../functions/filesystem.ts";
import { ColorString, LogStuff } from "../../functions/io.ts";
import { GetProjectEnvironment, GetProjectSettings, NameProject, SpotProject } from "../../functions/projects.ts";
import type { CleanerIntensity } from "../../types/config_params.ts";
import type { ALL_SUPPORTED_LOCKFILES } from "../../types/package_managers.ts";
import type { NodePkgJson, ProjectEnv } from "../../types/runtimes.ts";
import { FknError } from "../../utils/error.ts";
import { Git } from "../../utils/git.ts";
import type { tRESULT } from "../clean.ts";
import type { FkNodeYaml } from "../../types/config_files.ts";

/**
 * All project cleaning features.
 */
const ProjectCleaningFeatures = {
    Update: async (
        projectName: string,
        env: ProjectEnv,
        settings: FkNodeYaml,
        verbose: boolean,
    ) => {
        const { commands } = env;
        await LogStuff(
            `Updating ${projectName}.`,
            "working",
        );
        if (
            settings.updateCmdOverride && settings.updateCmdOverride.trim() !== "" &&
            settings.updateCmdOverride !== "__USE_DEFAULT"
        ) {
            await LogStuff(`${commands.run.join(" ")} ${settings.updateCmdOverride}`, "wip");
            const output = await Commander(
                commands.run[0],
                [commands.run[1], settings.updateCmdOverride],
                verbose,
            );
            if (output.success) await LogStuff(`Updated ${projectName}!`, "tick");
            return;
        } else {
            await LogStuff(`${commands.base} ${commands.update}`, "wip");
            const output = await Commander(
                commands.base,
                commands.update,
                verbose,
            );
            if (output.success) await LogStuff(`Updated ${projectName}!`, "tick");
            return;
        }
    },
    Clean: async (
        projectName: string,
        env: ProjectEnv,
        verbose: boolean,
    ) => {
        const { commands } = env;
        if (commands.clean === "__UNSUPPORTED") {
            await LogStuff(
                `Cannot clean ${projectName}: cleanup is unsupported for ${env.manager}.`,
                "warn",
                "bright-yellow",
            );
            return;
        }
        await LogStuff(
            `Cleaning ${projectName}.`,
            "working",
        );
        for (const args of commands.clean) {
            await LogStuff(`${commands.base} ${args.join(" ")}`, "wip");
            await Commander(commands.base, args, verbose);
        }
        await LogStuff(`Cleaned ${projectName}!`, "tick");

        return;
    },
    Lint: async (
        projectName: string,
        env: ProjectEnv,
        settings: FkNodeYaml,
        verbose: boolean,
    ) => {
        const { commands } = env;
        if (env.manager === "deno") return; // unsupported
        if (!settings.lintCmd || settings.lintCmd.trim() === "") return;
        await LogStuff(
            `Linting ${projectName}.`,
            "working",
        );
        if (settings.lintCmd === "__ESLINT") {
            const dependencies = (env.main.content as NodePkgJson).dependencies;
            if (!dependencies || !dependencies["eslint"]) {
                await LogStuff(
                    `Can't lint ${projectName}. No lint command was specified and ESLint is not installed.`,
                    "bruh",
                );
                return;
            }
            const output = await Commander(
                commands.exec[0],
                commands.exec.length === 1
                    ? [
                        "eslint",
                        "--fix",
                        ".",
                    ]
                    : [
                        commands.exec[1],
                        "eslint",
                        "--fix",
                        ".",
                    ],
                verbose,
            );
            if (output.success) await LogStuff(`Linted ${projectName}!`, "tick");
            return;
        } else {
            const output = await Commander(
                commands.base,
                ["run", settings.lintCmd],
                verbose,
            );
            if (output.success) await LogStuff(`Linted ${projectName}!`, "tick");
            return;
        }
    },
    Prettify: async (
        projectName: string,
        env: ProjectEnv,
        settings: FkNodeYaml,
        verbose: boolean,
    ) => {
        const { commands } = env;
        await LogStuff(
            `Prettifying ${projectName}.`,
            "working",
        );
        if (commands.base === "deno") {
            const output = await Commander(
                "deno",
                [
                    "fmt",
                ],
                verbose,
            ); // customization unsupported - it should work from deno.json, tho
            if (output.success) await LogStuff(`Prettified ${projectName}!`, "tick");
            return;
        }
        if (!settings.prettyCmd || settings.prettyCmd.trim() === "") {
            await LogStuff(
                `Can't prettify ${projectName}. No prettify command was specified.`,
                "bruh",
            );
            return;
        }
        if (settings.prettyCmd === "__PRETTIER") {
            const dependencies = (env.main.content as NodePkgJson).dependencies;
            if (!dependencies || !dependencies["prettier"]) {
                await LogStuff(
                    `Can't prettify ${projectName}. No prettify command was specified and Prettier is not installed.`,
                    "bruh",
                );
                return;
            }
            const output = await Commander(
                commands.exec[0],
                commands.exec.length === 1
                    ? [
                        "prettier",
                        "--w",
                        ".",
                    ]
                    : [
                        commands.exec[1],
                        "eslint",
                        "--w",
                        ".",
                    ],
                verbose,
            );
            if (output.success) await LogStuff(`Prettified ${projectName}!`, "tick");
            return;
        } else {
            const output = await Commander(
                commands.base,
                ["run", settings.prettyCmd],
                verbose,
            );
            if (output.success) await LogStuff(`Prettified ${projectName}!`, "tick");
            return;
        }
    },
    Destroy: async (
        settings: FkNodeYaml,
        project: string,
        intensity: CleanerIntensity,
        verbose: boolean,
    ) => {
        if (!settings.destroy) return;
        if (
            !settings.destroy.intensities.includes(intensity) &&
            !settings.destroy.intensities.includes("*")
        ) return;
        if (settings.destroy.targets.length === 0) return;
        for (const target of settings.destroy.targets) {
            if (target === "node_modules" && intensity === "maxim") continue; // avoid removing this thingy twice
            const path = await ParsePath(await JoinPaths(project, target));
            try {
                await Deno.remove(path, {
                    recursive: true,
                });
                await LogStuff(`Destroyed ${path} successfully`, "tick");
                continue;
            } catch (e) {
                if (String(e).includes("os error 2")) {
                    await LogStuff(
                        `Didn't destroy ${ColorString(path, "bold")}: it does not exist!`,
                        "warn",
                        "bright-yellow",
                        undefined,
                        verbose,
                    );
                    continue;
                }
                await LogStuff(`Error destroying ${path}: ${e}`, "error", "red", undefined, verbose);
                continue;
            }
        }
    },
    Commit: async (
        settings: FkNodeYaml,
        project: string,
        shouldUpdate: boolean,
        shouldLint: boolean,
        shouldPrettify: boolean,
        verbose: boolean,
    ) => {
        if (!shouldUpdate && !shouldLint && !shouldPrettify) {
            await LogStuff("No actions to be committed.", "bruh");
            return;
        }
        if (settings.commitActions === false) {
            await LogStuff("No committing allowed.", "bruh");
            return;
        }
        if ((await Git.IsWorkingTreeClean(project)) === true) {
            await LogStuff("Tree isn't clean, can't commit", "bruh");
            return;
        }
        const getCommitMessage = () => {
            if (settings.commitMessage && settings.commitMessage.trim() !== "" && settings.updateCmdOverride !== "__USE_DEFAULT") {
                return settings.commitMessage;
            }

            const tasks: string[] = [];

            if (shouldUpdate) tasks.push("updating");
            if (shouldLint) tasks.push("linting");
            if (shouldPrettify) tasks.push("prettifying");

            const taskString = tasks.join(" and ");
            return `Code ${taskString} tasks (Auto-generated by F*ckingNode v${VERSION})`;
        };

        await Git.Commit(await ParsePath(project), getCommitMessage(), verbose).then(
            async (success) => {
                if (success === 1) {
                    await LogStuff(`Committed your changes to ${await NameProject(project, "name")}!`, "tick");
                }
            },
        );
        return;
    },
};

/**
 * Cleans a project.
 *
 * @export
 * @async
 * @param {string} projectInQuestion
 * @param {boolean} shouldUpdate
 * @param {boolean} shouldClean
 * @param {boolean} shouldLint
 * @param {boolean} shouldPrettify
 * @param {boolean} shouldDestroy
 * @param {boolean} shouldCommit
 * @param {("normal" | "hard" | "maxim")} intensity
 * @param {boolean} verboseLogging
 * @returns {Promise<void>}
 */
export async function PerformCleaning(
    projectInQuestion: string,
    shouldUpdate: boolean,
    shouldClean: boolean,
    shouldLint: boolean,
    shouldPrettify: boolean,
    shouldDestroy: boolean,
    shouldCommit: boolean,
    intensity: "normal" | "hard" | "maxim",
    verboseLogging: boolean,
): Promise<void> {
    try {
        const motherfuckerInQuestion = await ParsePath(projectInQuestion);
        const projectName = await NameProject(motherfuckerInQuestion, "name");
        const workingEnv = await GetProjectEnvironment(motherfuckerInQuestion);
        const settings = await GetProjectSettings(motherfuckerInQuestion);

        /* "what should we do with the drunken sailor..." */
        const whatShouldWeDo: Record<
            "update" | "lint" | "pretty" | "destroy" | "commit",
            boolean
        > = {
            update: shouldUpdate || (settings.flagless?.flaglessUpdate === true),
            lint: shouldLint || (settings.flagless?.flaglessLint === true),
            pretty: shouldPrettify || (settings.flagless?.flaglessPretty === true),
            destroy: shouldDestroy || (settings.flagless?.flaglessDestroy === true),
            commit: shouldCommit || (settings.flagless?.flaglessCommit === true),
        };

        if (shouldClean) {
            await ProjectCleaningFeatures.Clean(
                projectName,
                workingEnv,
                verboseLogging,
            );
        }
        if (whatShouldWeDo["update"]) {
            await ProjectCleaningFeatures.Update(
                projectName,
                workingEnv,
                settings,
                verboseLogging,
            );
        }
        if (whatShouldWeDo["lint"]) {
            await ProjectCleaningFeatures.Lint(
                projectName,
                workingEnv,
                settings,
                verboseLogging,
            );
        }
        if (whatShouldWeDo["pretty"]) {
            await ProjectCleaningFeatures.Prettify(
                projectName,
                workingEnv,
                settings,
                verboseLogging,
            );
        }
        if (whatShouldWeDo["destroy"]) {
            await ProjectCleaningFeatures.Destroy(
                settings,
                motherfuckerInQuestion,
                intensity,
                verboseLogging,
            );
        }
        if (whatShouldWeDo["commit"]) {
            await ProjectCleaningFeatures.Commit(
                settings,
                motherfuckerInQuestion,
                whatShouldWeDo["update"],
                whatShouldWeDo["lint"],
                whatShouldWeDo["pretty"],
                verboseLogging,
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
        `Time for hard-pruning! ${ColorString("Wait patiently, please (caches will take a while to clean).", "italic")}`,
        "working",
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
            "NPM",
            "package",
            "red",
        );
        await Commander("npm", npmHardPruneArgs, true);
        await LogStuff("Done", "tick");
    }
    if (await CommandExists("pnpm")) {
        await LogStuff(
            "PNPM",
            "package",
            "bright-yellow",
        );
        await Commander("pnpm", pnpmHardPruneArgs, true);
        await LogStuff("Done", "tick");
    }
    if (await CommandExists("yarn")) {
        await LogStuff(
            "YARN",
            "package",
            "purple",
        );
        await Commander("yarn", yarnHardPruneArgs, true);
        await LogStuff("Done", "tick");
    }

    if (await CommandExists("bun")) {
        await LogStuff(
            "BUN",
            "package",
            "pink",
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
    // and it throws an error and exits the CLI
    // epic.
    if (await CommandExists("deno")) {
        try {
            const denoDir: string | undefined = Deno.env.get("DENO_DIR");
            if (!denoDir) throw "lmao";
            await LogStuff(
                "DENO",
                "package",
                "bright-blue",
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
            `[ERROR] Due to an unknown error, a temporal DIR wasn't deleted. DIR path:\n${tmp}\nError:\n${e}`,
            "error",
        );
    }

    return;
}

/**
 * Performs a maxim cleanup, AKA removes node_modules.
 *
 * @export
 * @async
 * @param {string[]} projects Projects to be cleaned.
 * @returns {Promise<void>}
 */
export async function PerformMaximCleanup(projects: string[]): Promise<void> {
    await LogStuff(
        `Time for maxim-pruning! ${ColorString("Wait patiently, please (node_modules takes a while to remove).", "italic")}`,
        "working",
    );

    for (const project of projects) {
        const workingProject = await SpotProject(project);
        const name = await NameProject(workingProject, "name");
        const env = await GetProjectEnvironment(workingProject);

        await LogStuff(
            `Maxim pruning for ${name}`,
            "trash",
        );
        if (!(await CheckForPath(env.hall_of_trash))) {
            await LogStuff(
                `Maxim pruning didn't find the node_modules DIR at ${name}. Skipping this ${I_LIKE_JS.MF}...`,
                "bruh",
            );
            return;
        }
        // hall_of_trash path should be absolute
        await Deno.remove(env.hall_of_trash, {
            recursive: true,
        });
        await LogStuff(
            `Maxim pruned ${name}.`,
            "tick",
        );
    }
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
    const cleanedIntensity = intensity.trim().toLowerCase();

    if (!["hard", "hard-only", "normal", "maxim", "maxim-only", "--"].includes(cleanedIntensity)) {
        throw new FknError("Cleaner__InvalidCleanerIntensity", `Provided intensity '${intensity}' is not valid.`);
    }

    const workingIntensity = cleanedIntensity as CleanerIntensity | "--";
    const defaultIntensity = (await GetSettings()).defaultCleanerIntensity;

    if (workingIntensity === "--") {
        return defaultIntensity;
    }

    if (workingIntensity === "normal") {
        return "normal";
    }

    if (workingIntensity === "hard") {
        return "hard";
    }

    if (workingIntensity === "hard-only") {
        return "hard-only";
    }

    if (workingIntensity === "maxim" || workingIntensity === "maxim-only") {
        const confirmMaxim = await LogStuff(
            "Are you sure you want to use maxim cleaning? It will entirely remove the node_modules DIR for ALL of your projects.",
            "warn",
            ["bold", "italic"],
            undefined,
            true,
        );
        return confirmMaxim === true ? workingIntensity : defaultIntensity;
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
    await LogStuff("Report:", "chart");
    const report: string[] = [];
    for (const result of results) {
        const name = await NameProject(result.path, "all");
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
    await LogStuff(sortedReport, undefined);
    await LogStuff(
        `Cleaning completed at ${new Date().toLocaleString()}`,
        "tick",
        "bright-green",
    );
}

/**
 * Resolves all lockfiles of a project.
 *
 * @export
 * @async
 * @param {string} path
 * @returns {Promise<ALL_SUPPORTED_LOCKFILES[]>} All lockfiles
 */
export async function ResolveLockfiles(path: string): Promise<ALL_SUPPORTED_LOCKFILES[]> {
    const lockfiles: ALL_SUPPORTED_LOCKFILES[] = [];
    const possibleLockfiles: ALL_SUPPORTED_LOCKFILES[] = [
        "pnpm-lock.yaml",
        "package-lock.json",
        "yarn.lock",
        "bun.lockb",
        "deno.lock",
    ];
    for (const lockfile of possibleLockfiles) {
        if (await CheckForPath(await JoinPaths(path, lockfile))) {
            lockfiles.push(lockfile);
        }
    }
    return lockfiles;
}
