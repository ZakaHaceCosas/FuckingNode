import { FULL_NAME, I_LIKE_JS, isDef } from "../../constants.ts";
import { Commander, CommandExists } from "../../functions/cli.ts";
import { GetSettings } from "../../functions/config.ts";
import { CheckForPath, JoinPaths, ParsePath } from "../../functions/filesystem.ts";
import { ColorString, LogStuff } from "../../functions/io.ts";
import { GetProjectEnvironment, NameProject, SpotProject, UnderstandProjectProtection } from "../../functions/projects.ts";
import type { CleanerIntensity } from "../../types/config_params.ts";
import type { ProjectEnvironment, SUPPORTED_GLOBAL_LOCKFILE } from "../../types/platform.ts";
import { DEBUG_LOG, FknError } from "../../utils/error.ts";
import { Git } from "../../utils/git.ts";
import type { tRESULT } from "../clean.ts";
import { StringUtils } from "@zakahacecosas/string-utils";
import { FkNodeInterop } from "../interop/interop.ts";

/**
 * All project cleaning features.
 */
const ProjectCleaningFeatures = {
    Update: async (
        projectName: string,
        env: ProjectEnvironment,
        verbose: boolean,
    ) => {
        await LogStuff(
            `Updating dependencies for ${projectName}.`,
            "working",
        );
        try {
            const output = await FkNodeInterop.Features.Update({
                env,
                verbose,
                script: env.settings.updateCmdOverride,
            });
            if (output === true) await LogStuff(`Updated dependencies for ${projectName}!`, "tick");
            return;
        } catch (e) {
            await LogStuff(`Failed to update deps for ${projectName}: ${e}`, "warn", "bright-yellow");
            return;
        }
    },
    Clean: async (
        projectName: string,
        env: ProjectEnvironment,
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
        env: ProjectEnvironment,
        verbose: boolean,
    ) => {
        await LogStuff(
            `Linting ${projectName}.`,
            "working",
        );
        try {
            const output = await FkNodeInterop.Features.Lint({
                env,
                verbose,
                script: env.settings.lintCmd,
            });
            if (output === true) await LogStuff(`Linted ${projectName}!`, "tick");
            return;
        } catch (e) {
            await LogStuff(`Failed to lint ${projectName}: ${e}`, "warn", "bright-yellow");
            return;
        }
    },
    Pretty: async (
        projectName: string,
        env: ProjectEnvironment,
        verbose: boolean,
    ) => {
        await LogStuff(
            `Prettifying ${projectName}.`,
            "working",
        );
        try {
            const output = await FkNodeInterop.Features.Pretty({
                env,
                verbose,
                script: env.settings.prettyCmd,
            });
            if (output === true) await LogStuff(`Prettified ${projectName}!`, "tick");
            return;
        } catch (e) {
            await LogStuff(`Failed to pretty ${projectName}: ${e}`, "warn", "bright-yellow");
            return;
        }
    },
    Destroy: async (
        projectName: string,
        env: ProjectEnvironment,
        intensity: CleanerIntensity,
        verbose: boolean,
    ) => {
        try {
            if (!env.settings.destroy) return;
            if (
                !env.settings.destroy.intensities.includes(intensity) &&
                !env.settings.destroy.intensities.includes("*")
            ) return;
            if (env.settings.destroy.targets.length === 0) return;
            for (const target of env.settings.destroy.targets) {
                if (target === "node_modules" && intensity === "maxim") continue; // avoid removing this thingy twice
                const path = await ParsePath(await JoinPaths(env.root, target));
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
            await LogStuff(`Destroyed stuff at ${projectName}!`, "tick");
            return;
        } catch (e) {
            await LogStuff(`Failed to destroy stuff at ${projectName}: ${e}`, "warn", "bright-yellow");
            return;
        }
    },
    Commit: async (
        env: ProjectEnvironment,
        shouldUpdate: boolean,
        shouldLint: boolean,
        shouldPrettify: boolean,
    ) => {
        if (!shouldUpdate && !shouldLint && !shouldPrettify) {
            await LogStuff("No actions to be committed.", "bruh");
            return;
        }
        if (env.settings.commitActions === false) {
            await LogStuff("No committing allowed.", "bruh");
            return;
        }
        if (!(await Git.CanCommit(env.root))) {
            await LogStuff("Tree isn't clean, can't commit", "bruh");
            return;
        }
        const getCommitMessage = () => {
            if (
                StringUtils.validate(env.settings.commitMessage) && !(isDef(env.settings.commitMessage))
            ) {
                return env.settings.commitMessage;
            }

            const tasks: string[] = [];

            if (shouldUpdate) tasks.push("updating");
            if (shouldLint) tasks.push("linting");
            if (shouldPrettify) tasks.push("prettifying");

            const taskString = tasks.join(" and ");
            return `Code ${taskString} tasks (Auto-generated by ${FULL_NAME})`;
        };

        await Git.Commit(await ParsePath(env.root), getCommitMessage(), "all", []).then(
            async (success) => {
                if (success === 1) {
                    await LogStuff(`Committed your changes to ${await NameProject(env.root, "name")}!`, "tick");
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
 * @param {boolean} shouldLint
 * @param {boolean} shouldPrettify
 * @param {boolean} shouldDestroy
 * @param {boolean} shouldCommit
 * @param {("normal" | "hard" | "maxim")} intensity
 * @param {boolean} verboseLogging
 * @returns {Promise<boolean>}
 */
export async function PerformCleanup(
    projectInQuestion: string,
    shouldUpdate: boolean,
    shouldLint: boolean,
    shouldPrettify: boolean,
    shouldDestroy: boolean,
    shouldCommit: boolean,
    intensity: "normal" | "hard" | "maxim",
    verboseLogging: boolean,
): Promise<boolean> {
    const motherfuckerInQuestion = await ParsePath(projectInQuestion);
    const projectName = ColorString(await NameProject(motherfuckerInQuestion, "name"), "bold");
    const workingEnv = await GetProjectEnvironment(motherfuckerInQuestion);

    DEBUG_LOG("ENV @@ PERFORMCLEANUP", workingEnv);

    const { doClean, doDestroy, doLint, doPrettify, doUpdate } = UnderstandProjectProtection(workingEnv.settings, {
        update: shouldUpdate,
        prettify: shouldPrettify,
        destroy: shouldDestroy,
        lint: shouldLint,
    });

    /* "what should we do with the drunken sailor..." */
    const whatShouldWeDo: Record<
        "update" | "lint" | "pretty" | "destroy" | "commit",
        boolean
    > = {
        update: doUpdate || (workingEnv.settings.flagless?.flaglessUpdate === true),
        lint: doPrettify || (workingEnv.settings.flagless?.flaglessLint === true),
        pretty: doLint || (workingEnv.settings.flagless?.flaglessPretty === true),
        destroy: doDestroy || (workingEnv.settings.flagless?.flaglessDestroy === true),
        commit: shouldCommit || (workingEnv.settings.flagless?.flaglessCommit === true),
    };

    if (doClean) {
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
            verboseLogging,
        );
    }
    if (whatShouldWeDo["lint"]) {
        await ProjectCleaningFeatures.Lint(
            projectName,
            workingEnv,
            verboseLogging,
        );
    }
    if (whatShouldWeDo["pretty"]) {
        await ProjectCleaningFeatures.Pretty(
            projectName,
            workingEnv,
            verboseLogging,
        );
    }
    if (whatShouldWeDo["destroy"]) {
        await ProjectCleaningFeatures.Destroy(
            projectName,
            workingEnv,
            intensity,
            verboseLogging,
        );
    }
    if (whatShouldWeDo["commit"]) {
        await ProjectCleaningFeatures.Commit(
            workingEnv,
            whatShouldWeDo["update"],
            whatShouldWeDo["lint"],
            whatShouldWeDo["pretty"],
        );
    }

    return true;
}

// cache cleaning is global, so doing these for every project like we used to do
// is a waste of resources
/**
 * Performs a hard cleanup, AKA cleans global caches.
 *
 * @export
 * @async
 * @param {boolean} verboseLogging
 * @returns {Promise<void>}
 */
export async function PerformHardCleanup(
    verboseLogging: boolean,
): Promise<void> {
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

    if (CommandExists("npm")) {
        await LogStuff(
            "NPM",
            "package",
            "red",
            undefined,
            verboseLogging,
        );
        await Commander("npm", npmHardPruneArgs, verboseLogging);
        await LogStuff("Done", "tick", undefined, undefined, verboseLogging);
    }
    if (CommandExists("pnpm")) {
        await LogStuff(
            "PNPM",
            "package",
            "bright-yellow",
            undefined,
            verboseLogging,
        );
        await Commander("pnpm", pnpmHardPruneArgs, true);
        await LogStuff("Done", "tick", undefined, undefined, verboseLogging);
    }
    if (CommandExists("yarn")) {
        await LogStuff(
            "YARN",
            "package",
            "purple",
            undefined,
            verboseLogging,
        );
        await Commander("yarn", yarnHardPruneArgs, true);
        await LogStuff("Done", "tick", undefined, undefined, verboseLogging);
    }

    if (CommandExists("bun")) {
        await LogStuff(
            "BUN",
            "package",
            "pink",
            undefined,
            verboseLogging,
        );
        await Commander("bun", ["init", "-y"], verboseLogging); // placebo
        await Commander("bun", bunHardPruneArgs, verboseLogging);
        await LogStuff("Done", "tick", undefined, verboseLogging);
    }
    /* if (CommandExists("deno")) {
        await Commander("deno", ["init"], false); // placebo 2
        await Commander("deno", denoHardPruneArgs, true);
    } */

    // deno requires this glue fix
    // because apparently i cannot clear the cache of deno
    // using a program thats written in deno
    // and it throws an error and exits the CLI
    // epic.
    if (CommandExists("deno")) {
        try {
            const denoDir: string | undefined = Deno.env.get("DENO_DIR");
            if (!denoDir) throw "lmao";
            await LogStuff(
                "DENO",
                "package",
                "bright-blue",
                undefined,
                verboseLogging,
            );
            await Deno.remove(denoDir);
            await LogStuff("Done", "tick", undefined, undefined, verboseLogging);
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

        if (env.runtime === "rust" || env.runtime === "golang") continue;

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
    const defaultIntensity = (await GetSettings()).defaultIntensity;

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
            "Are you sure you want to use maxim cleanup? It'll entirely remove the node_modules DIR for ALL of your projects.",
            "warn",
            ["bold", "italic"],
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
    const sortedReport = StringUtils.sortAlphabetically(report).join("\n");
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
 * @returns {Promise<SUPPORTED_GLOBAL_LOCKFILE[]>} All lockfiles
 */
export async function ResolveLockfiles(path: string): Promise<SUPPORTED_GLOBAL_LOCKFILE[]> {
    const lockfiles: SUPPORTED_GLOBAL_LOCKFILE[] = [];
    const possibleLockfiles: SUPPORTED_GLOBAL_LOCKFILE[] = [
        "pnpm-lock.yaml",
        "package-lock.json",
        "yarn.lock",
        "bun.lockb",
        "bun.lock",
        "deno.lock",
        "go.sum",
        "cargo.lock",
    ];
    for (const lockfile of possibleLockfiles) {
        if (await CheckForPath(await JoinPaths(path, lockfile))) {
            lockfiles.push(lockfile);
        }
    }
    return lockfiles;
}

/**
 * Names a lockfile using a manager name.
 *
 * @export
 * @param {("npm" | "pnpm" | "yarn" | "bun" | "deno" | "go" | "cargo")} manager Manager to name
 * @returns {("package-lock.json" | "pnpm-lock.yaml" | "yarn.lock" | "bun.lock" | "deno.lock" | "go.sum" | "cargo.lock")} Lockfile name
 */
export function NameLockfile(
    manager: "npm" | "pnpm" | "yarn" | "bun" | "deno" | "go" | "cargo",
): "package-lock.json" | "pnpm-lock.yaml" | "yarn.lock" | "bun.lock" | "deno.lock" | "go.sum" | "cargo.lock" {
    switch (manager) {
        case "npm":
            return "package-lock.json";
        case "pnpm":
            return "pnpm-lock.yaml";
        case "yarn":
            return "yarn.lock";
        case "bun":
            return "bun.lock";
        case "deno":
            return "deno.lock";
        case "go":
            return "go.sum";
        case "cargo":
            return "cargo.lock";
    }
}
