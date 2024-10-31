import { I_LIKE_JS } from "../constants.ts";
import { CONFIG_FILES, type SUPPORTED_LOCKFILE } from "../types.ts";
import { IGNORE_FILE } from "../constants.ts";
import { Commander, CommandExists } from "../functions/cli.ts";
import { CheckForPath, JoinPaths, ParsePath } from "../functions/filesystem.ts";
import { LogStuff } from "../functions/io.ts";
import { GetAllProjects } from "../functions/projects.ts";

async function PerformCleaning(
    lockfile: SUPPORTED_LOCKFILE,
    projectInQuestion: string,
    shouldUpdate: boolean,
    intensity: "normal" | "hard" | "maxim",
): Promise<void> {
    try {
        const motherfuckerInQuestion = await ParsePath(projectInQuestion);
        const maximPath = await JoinPaths(motherfuckerInQuestion, "node_modules");

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
            await LogStuff(
                `${baseCommand} ${updateArg}\n`,
                "package",
            );
            await Commander(baseCommand, updateArg);
        }
        await LogStuff(
            `Cleaning using ${baseCommand} for ${motherfuckerInQuestion}.`,
            "package",
        );
        for (const pruneArg of pruneArgs) {
            await LogStuff(
                `${baseCommand} ${pruneArg.join(" ")}\n`,
                "package",
            );
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

export default async function TheCleaner(
    verbose: boolean,
    update: boolean,
    intensity: "normal" | "hard" | "maxim",
    CF: CONFIG_FILES,
) {
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
        if (intensity === "maxim") {
            const confirmMaxim = await LogStuff(
                "Are you sure you want to use maxim cleaning? It will entirely remove the node_modules DIR for ALL of your projects.",
                "warn",
                undefined,
                true,
            );
            realIntensity = confirmMaxim ? intensity : "hard";
        } else {
            realIntensity = intensity;
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
                await LogStuff(`Path not found: ${project}. You might want to update your list of ${I_LIKE_JS.MFS}.`, "error");
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

                const lockfiles: SUPPORTED_LOCKFILE[] = [];

                if (await CheckForPath("pnpm-lock.yaml")) {
                    lockfiles.push("pnpm-lock.yaml");
                }
                if (await CheckForPath("package-lock.json")) {
                    lockfiles.push("package-lock.json");
                }
                if (await CheckForPath("yarn.lock")) {
                    lockfiles.push("yarn.lock");
                }

                if (lockfiles.length > 0) {
                    if (lockfiles.length === 1) {
                        for (const lockfile of lockfiles) {
                            await PerformCleaning(lockfile, project, update, realIntensity);
                        }
                    } else {
                        await LogStuff(
                            `More than one lockfile is a ${I_LIKE_JS.MFLY} bad practice. Future versions might add a handler for this cases, but for now we'll skip this.`,
                            "error",
                        );
                        results.push({ path: project, status: "Too many lockfiles." });
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
            await LogStuff("Time for hard-pruning! Wait patiently, please (caches take a while to clean)", "package");

            const npmHardPruneArgs: string[] = ["cache", "clean", "--force"];
            const pnpmHardPruneArgs: string[] = ["store", "prune"];
            const yarnHardPruneArgs: string[] = ["cache", "clean"];

            if (await CommandExists("npm")) await Commander("npm", npmHardPruneArgs);
            if (await CommandExists("pnpm")) await Commander("pnpm", pnpmHardPruneArgs);
            if (await CommandExists("yarn")) await Commander("yarn", yarnHardPruneArgs);
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
            await LogStuff(`${result.path} -> ${result.status}`, undefined, false, undefined, verbose);
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
