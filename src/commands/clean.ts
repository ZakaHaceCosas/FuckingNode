import { I_LIKE_JS } from "../constants.ts";
import {
    IsLockfileNodeLockfile,
    type ProjectCleanerIntensity,
    type SUPPORTED_LOCKFILES,
    type SUPPORTED_NOT_NODE_LOCKFILE as _NotNode,
} from "../types.ts";
import { CheckForPath } from "../functions/filesystem.ts";
import { ColorString, LogStuff } from "../functions/io.ts";
import { CheckDivineProtection, GetAllProjects, NameProject } from "../functions/projects.ts";
import type { TheCleanerConstructedParams } from "./constructors/command.ts";
import GenericErrorHandler from "../utils/error.ts";
import { PerformHardCleanup, PerformNodeCleaning } from "./toolkit/cleaner.ts";
import type { CleanerIntensity } from "../types.ts";

function ResolveProtection(protection: string | null, update: boolean): {
    doClean: boolean;
    doUpdate: boolean;
    preliminaryStatus?: "Fully protected" | "Cleanup protected" | "Update protected";
} {
    switch (protection) {
        case "*":
            return { doClean: false, doUpdate: false, preliminaryStatus: "Fully protected" };
        case "cleanup":
            return { doClean: false, doUpdate: true, preliminaryStatus: "Cleanup protected" };
        case "updater":
            return { doClean: true, doUpdate: false, preliminaryStatus: "Update protected" };
        default:
            return { doClean: true, doUpdate: update };
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

        if (!(["hard", "hard-only", "normal", "maxim"].includes(intensity))) {
            throw new Error("Invalid intensity.");
        }

        const workingIntensity: CleanerIntensity = intensity as CleanerIntensity;

        let realIntensity: ProjectCleanerIntensity = "normal";

        if (workingIntensity === "hard-only") {
            await PerformHardCleanup();
            return;
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

                const protection = await CheckDivineProtection(project);
                const { doClean, doUpdate, preliminaryStatus } = ResolveProtection(protection, update);
                switch (preliminaryStatus) {
                    case "Fully protected":
                        await LogStuff(
                            ColorString(
                                `${project} is fully protected by ${I_LIKE_JS.FKN} divine protection. Cannot touch it.`,
                                "bright-yellow",
                            ),
                            "heads-up",
                        );
                        results.push({
                            path: project,
                            status: "Fully protected",
                        });
                        continue;
                    case "Cleanup protected":
                        await LogStuff(
                            ColorString(
                                `${project} is cleanup protected by ${I_LIKE_JS.FKN} divine protection. Cannot clean it, but will be updated (if you specified to do so).`,
                                "bright-yellow",
                            ),
                            "heads-up",
                        );
                        break;
                    case "Update protected":
                        await LogStuff(
                            ColorString(
                                `${project} is update protected by ${I_LIKE_JS.FKN} divine protection. Cannot update it, but will be cleaned (if you specified to do so).`,
                                "bright-yellow",
                            ),
                            "heads-up",
                        );
                        break;
                }

                if (lockfiles.length > 0) {
                    if (lockfiles.length === 1) {
                        for (const lockfile of lockfiles) {
                            if (IsLockfileNodeLockfile(lockfile)) {
                                if (doClean) {
                                    await PerformNodeCleaning(
                                        lockfile,
                                        project,
                                        doUpdate,
                                        doClean,
                                        realIntensity,
                                    );
                                }
                            }
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

                results.push({ path: project, status: preliminaryStatus ? `Success # ${preliminaryStatus}` : "Success" });
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
        const report: string[] = [];
        for (const result of results) {
            const theResult = `${await NameProject(result.path)} -> ${ColorString(result.status, "bold")}`;
            report.push(theResult);
        }
        await LogStuff(report.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).join("\n"), undefined, false, undefined, verbose);
        await LogStuff("\n", undefined, false, undefined, verbose); // glue fix

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
