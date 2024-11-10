import { I_LIKE_JS } from "../constants.ts";
import {
    IsLockfileNodeLockfile,
    ProjectCleanerIntensity,
    type SUPPORTED_LOCKFILES,
    type SUPPORTED_NOT_NODE_LOCKFILE as _NotNode,
} from "../types.ts";
import { IGNORE_FILE } from "../constants.ts";
import { CheckForPath } from "../functions/filesystem.ts";
import { ColorString, LogStuff } from "../functions/io.ts";
import { GetAllProjects, NameProject } from "../functions/projects.ts";
import { TheCleanerConstructedParams } from "./constructors/command.ts";
import GenericErrorHandler from "../utils/error.ts";
import { PerformHardCleanup, PerformNodeCleaning } from "./toolkit/cleaner.ts";
import { CleanerIntensity } from "../types.ts";

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

        if (!(["hard", "hard-only", "normal", "maxim"].includes(intensity))) {
            throw new Error("Invalid intensity.");
        }

        const workingIntensity: CleanerIntensity = intensity as CleanerIntensity;

        let realIntensity: ProjectCleanerIntensity = "normal";

        if (workingIntensity === "hard-only") {
            await PerformHardCleanup();
            return;
        }

        const possibleOptions = ["normal", "hard", "maxim"];
        if (!(possibleOptions.includes(workingIntensity))) {
            realIntensity = "normal";
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
            realIntensity = confirmMaxim ? "maxim" : "hard";
        } else if (workingIntensity === "hard" || workingIntensity === "normal") {
            realIntensity = workingIntensity;
        }

        await LogStuff(
            ColorString(`Cleaning started at ${new Date().toLocaleString()}`, "green"),
            "working",
            undefined,
            undefined,
            verbose,
        );

        const results: { path: string; status: string }[] = [];

        for (const project of projects) {
            if (!(await CheckForPath(project))) {
                await LogStuff(
                    ColorString(`Path not found: ${project}. You might want to update your list of ${I_LIKE_JS.MFS}.`, "red"),
                    "error",
                );
                results.push({ path: project, status: "Not found" });
                continue;
            }

            try {
                Deno.chdir(project);
                await LogStuff(
                    ColorString(`Cleaning the ${project} ${I_LIKE_JS.MF}...`, "blue"),
                    "working",
                );

                // TODO - support new Divine protection format
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
                            ColorString(
                                `More than one lockfile is a ${I_LIKE_JS.MFLY} bad practice. Future versions might add a handler for these cases, but for now we'll skip this.`,
                                "bright-yellow",
                            ),
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
                        ColorString(`${project} has a package.json but not a lockfile. Can't ${I_LIKE_JS.FKN} clean.`, "bright-yellow"),
                        "warn",
                    );
                    results.push({ path: project, status: "No lockfile." });
                    continue;
                } else {
                    await LogStuff(
                        ColorString(`No supported lockfile was found at ${project}. Skipping this ${I_LIKE_JS.MF}...`, "bright-yellow"),
                        "warn",
                    );
                    results.push({ path: project, status: "No package.json." });
                    continue;
                }

                results.push({ path: project, status: "Success" });
            } catch (e) {
                await LogStuff(
                    ColorString(`Error while working around with ${project}: ${e}`, "red"),
                    "error",
                );
                results.push({ path: project, status: "Failed" });
                continue;
            }
        }

        if (intensity === "hard") await PerformHardCleanup();

        // go back home
        Deno.chdir(originalLocation);
        await LogStuff(
            ColorString(`All your ${I_LIKE_JS.MFN} Node projects have been cleaned! Back to ${originalLocation}.`, "bright-green"),
            "tick",
        );

        // shows a report
        await LogStuff("Report:", "chart", false, undefined, verbose);
        for (const result of results) {
            await LogStuff(
                `${NameProject(result.path)} -> ${ColorString(result.status, "bold")}`,
                undefined,
                false,
                undefined,
                verbose,
            );
        }

        await LogStuff(
            ColorString(`Cleaning completed at ${new Date().toLocaleString()}`, "bright-green"),
            "tick",
            false,
            undefined,
            verbose,
        );
        Deno.exit(0);
    } catch (e) {
        await GenericErrorHandler(e);
    }
}
