import { I_LIKE_JS } from "../constants.ts";
import {
    IsLockfileNodeLockfile,
    type SUPPORTED_LOCKFILES,
    type SUPPORTED_NODE_LOCKFILE,
    type SUPPORTED_NOT_NODE_LOCKFILE as _NotNode,
} from "../types.ts";
import { IGNORE_FILE } from "../constants.ts";
import { Commander, CommandExists } from "../functions/cli.ts";
import { CheckForPath, JoinPaths, ParsePath } from "../functions/filesystem.ts";
import { LogStuff } from "../functions/io.ts";
import { GetAllProjects } from "../functions/projects.ts";
import { TheCleanerConstructedParams } from "./constructors/command.ts";

async function PerformNodeCleaning(
    lockfile: SUPPORTED_NODE_LOCKFILE,
    projectInQuestion: string,
    shouldUpdate: boolean,
    intensity: "normal" | "hard" | "maxim",
): Promise<void> {
    try {
        const motherfuckerInQuestion = await ParsePath(projectInQuestion);
        const maximPath = await JoinPaths(
            motherfuckerInQuestion,
            "node_modules",
        );

        let baseCommand: string;
        let pruneArgs: string[][];
        let updateArg: string[];
        switch (lockfile) {
            case "package-lock.json":
                baseCommand = "npm";
                pruneArgs = [["dedupe"], ["prune"]];
                updateArg = ["update"];
                break;
            case "pnpm-lock.yaml":
                baseCommand = "pnpm";
                pruneArgs = [["dedupe"], ["prune"]];
                updateArg = ["update"];
                break;
            case "yarn.lock":
                baseCommand = "yarn";
                pruneArgs = [["autoclean", "--force"]];
                updateArg = ["upgrade"];
                break;
            default:
                throw new Error("Invalid lockfile provided");
        }

        if (shouldUpdate) {
            await LogStuff(
                `Updating using ${baseCommand} for ${motherfuckerInQuestion}.`,
                "package",
            );
            await LogStuff(`${baseCommand} ${updateArg}\n`, "package");
            await Commander(baseCommand, updateArg);
        }
        await LogStuff(
            `Cleaning using ${baseCommand} for ${motherfuckerInQuestion}.`,
            "package",
        );
        for (const pruneArg of pruneArgs) {
            await LogStuff(`${baseCommand} ${pruneArg.join(" ")}\n`, "package");
            await Commander(baseCommand, pruneArg);
        }
        if (intensity === "maxim") {
            await LogStuff(
                `Maxim pruning for ${motherfuckerInQuestion} (path: ${maximPath}).`,
                "trash",
            );
            if (!(await CheckForPath(maximPath))) {
                await LogStuff(
                    `An error happened with maxim pruning at ${motherfuckerInQuestion}. Skipping this ${I_LIKE_JS.MF}...`,
                    "bruh",
                );
            }
            await Deno.remove(maximPath, {
                recursive: true,
            });
            await LogStuff(
                `Maxim pruned ${motherfuckerInQuestion}.`,
                "tick-clear",
            );
        }
    } catch (e) {
        throw e;
    }
}

export default async function TheCleaner(params: TheCleanerConstructedParams) {
    const { CF, intensity, verbose, update } = params;

    try {
        // original path
        const originalLocation = Deno.cwd();

        // read all projects
        const projects: string[] = await GetAllProjects(CF);

        if (projects.length === 0) {
            await LogStuff(
                `There isn't any ${I_LIKE_JS.MF} over here... yet...`,
                "moon-face",
            );
            return;
        }

        let realIntensity: "normal" | "hard" | "maxim";
        const possibleOptions = ["normal", "hard", "maxim"];
        if (!(possibleOptions.includes(intensity))) {
            realIntensity = "normal";
        }
        if (intensity === "maxim") {
            const confirmMaxim = await LogStuff(
                "Are you sure you want to use maxim cleaning? It will entirely remove the node_modules DIR for ALL of your projects.",
                "warn",
                undefined,
                true,
            );
            realIntensity = confirmMaxim ? intensity : "hard";
        } else {
            realIntensity = intensity as "normal" | "hard" | "maxim";
        }

        await LogStuff(
            `Cleaning started at ${new Date().toLocaleString()}`,
            "working",
            undefined,
            undefined,
            verbose,
        );

        const results: { path: string; status: string }[] = [];

        for (const project of projects) {
            if (!(await CheckForPath(project))) {
                await LogStuff(
                    `Path not found: ${project}. You might want to update your list of ${I_LIKE_JS.MFS}.`,
                    "error",
                );
                results.push({ path: project, status: "Not found" });
                continue;
            }

            try {
                Deno.chdir(project);
                await LogStuff(
                    `Cleaning the ${project} ${I_LIKE_JS.MF}...`,
                    "working",
                );

                if (await CheckForPath(IGNORE_FILE)) {
                    await LogStuff(
                        `${project} is protected by ${I_LIKE_JS.FKN} divine protection. Cannot touch it.`,
                        "heads-up",
                    );
                    results.push({
                        path: project,
                        status: "Protected",
                    });
                    continue;
                }

                const lockfiles: SUPPORTED_LOCKFILES[] = [];

                if (await CheckForPath("pnpm-lock.yaml")) {
                    lockfiles.push("pnpm-lock.yaml");
                }
                if (await CheckForPath("package-lock.json")) {
                    lockfiles.push("package-lock.json");
                }
                if (await CheckForPath("yarn.lock")) {
                    lockfiles.push("yarn.lock");
                }
                if (await CheckForPath("bun.lockb")) {
                    lockfiles.push("bun.lockb");
                }
                if (await CheckForPath("deno.lock")) {
                    lockfiles.push("deno.lock");
                }

                if (lockfiles.length > 0) {
                    if (lockfiles.length === 1) {
                        for (const lockfile of lockfiles) {
                            if (IsLockfileNodeLockfile(lockfile)) await PerformNodeCleaning(lockfile, project, update, realIntensity);
                        }
                    } else {
                        await LogStuff(
                            `More than one lockfile is a ${I_LIKE_JS.MFLY} bad practice. Future versions might add a handler for this cases, but for now we'll skip this.`,
                            "error",
                        );
                        results.push({
                            path: project,
                            status: "Too many lockfiles.",
                        });
                        continue;
                    }
                } else if (await CheckForPath("package.json")) {
                    await LogStuff(
                        `${project} has a package.json but not a lockfile. Can't ${I_LIKE_JS.FKN} clean.`,
                        "warn",
                    );
                    results.push({ path: project, status: "No lockfile." });
                    continue;
                } else {
                    await LogStuff(
                        `No supported lockfile was found at ${project}. Skipping this ${I_LIKE_JS.MF}...`,
                        "warn",
                    );
                    results.push({ path: project, status: "No package.json." });
                    continue;
                }

                results.push({ path: project, status: "Success" });
            } catch (e) {
                await LogStuff(
                    `Error while working around with ${project}: ${e}`,
                    "error",
                );
                results.push({ path: project, status: "Failed" });
                continue;
            }
        }

        // cache cleaning is global, so doing these for every project like we used to do
        // is a waste of resources
        if (intensity === "hard") {
            await LogStuff(
                "Time for hard-pruning! Wait patiently, please (caches take a while to clean)",
                "package",
            );

            const npmHardPruneArgs: string[] = ["cache", "clean", "--force"];
            const pnpmHardPruneArgs: string[] = ["store", "prune"];
            const yarnHardPruneArgs: string[] = ["cache", "clean"];
            // bun and deno don't support yet project-wide cleanup
            // but they do support system-wide cleanup thanks to this
            // now F*kingNode is F*ckingJavascriptRuntimes :]
            const bunHardPruneArgs: string[] = ["pm", "cache", "rm"];
            // const denoHardPruneArgs: string[] = ["clean"];

            if (await CommandExists("npm")) await Commander("npm", npmHardPruneArgs);
            if (await CommandExists("pnpm")) await Commander("pnpm", pnpmHardPruneArgs);
            if (await CommandExists("yarn")) await Commander("yarn", yarnHardPruneArgs);
            if (await CommandExists("bun")) await Commander("bun", bunHardPruneArgs);
            // if (await CommandExists("deno")) await Commander("deno", denoHardPruneArgs);

            // deno requires this glue fix
            // because apparently i cannot clear the cache of deno
            // using a program thats written in deno
            // and it throws an error and exists the CLI
            // epic.
            if (await CommandExists("deno")) {
                try {
                    const denoDir: string | undefined = Deno.env.get("DENO_DIR");
                    if (!denoDir) throw "lmao";
                    await Deno.remove(denoDir);
                    // the CLI calls this kind of behaviors "maxim" cleanup
                    // yet we're doing from the "hard" preset and not the
                    // "maxim" one
                    // epic.
                } catch {
                    // nothing happened.
                    // i don't know what could happen if i delete the cache *live*
                    // shouldn't be an issue as the compiled executable brings it's own
                    // deno, but well, lets try :]
                }
            }
        }

        // go back home
        Deno.chdir(originalLocation);
        await LogStuff(
            `All your ${I_LIKE_JS.MFN} Node projects have been cleaned! Back to ${originalLocation}.`,
            "tick",
        );

        // shows a report
        await LogStuff("Report:", "chart", false, undefined, verbose);
        for (const result of results) {
            await LogStuff(
                `${result.path} -> ${result.status}`,
                undefined,
                false,
                undefined,
                verbose,
            );
        }

        await LogStuff(
            `Cleaning completed at ${new Date().toLocaleString()}`,
            "tick",
            false,
            undefined,
            verbose,
        );
        Deno.exit(0);
    } catch (e) {
        await LogStuff("Some error happened: " + e);
        Deno.exit(1);
    }
}
