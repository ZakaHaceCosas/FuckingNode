import { I_LIKE_JS } from "../constants.ts";
import {
    type ALL_SUPPORTED_LOCKFILES,
    IsLockfileNodeLockfile,
    type SUPPORTED_NOT_NODE_LOCKFILES as _NotNode,
} from "../types/package_managers.ts";
import { CheckForPath } from "../functions/filesystem.ts";
import { ColorString, LogStuff } from "../functions/io.ts";
import { GetAllProjects, NameProject } from "../functions/projects.ts";
import type { TheCleanerConstructedParams } from "./constructors/command.ts";
import GenericErrorHandler from "../utils/error.ts";
import { PerformHardCleanup, PerformNodeCleaning, ResolveProtection, ShowReport, ValidateIntensity } from "./toolkit/cleaner.ts";
import type { CleanerIntensity } from "../types/config_params.ts";
import { GetElapsedTime } from "../functions/date.ts";

export type tRESULT = { path: string; status: string; elapsedTime: string };

export default async function TheCleaner(params: TheCleanerConstructedParams) {
    const { intensity, verbose, update, lint, prettify, commit } = params;

    try {
        // start time
        const now = new Date();

        // original path
        const originalLocation = Deno.cwd();

        const realIntensity: CleanerIntensity = await ValidateIntensity(intensity);
        if (realIntensity === "hard-only") {
            await PerformHardCleanup();
            return;
        }

        // read all projects
        const projects: string[] = await GetAllProjects();

        if (projects.length === 0) {
            await LogStuff(
                `There isn't any ${I_LIKE_JS.MF} over here... yet...`,
                "moon-face",
            );
            return;
        }

        await LogStuff(
            ColorString(`Cleaning started at ${new Date().toLocaleString()}`, "green"),
            "working",
            undefined,
            undefined,
            verbose,
        );

        const results: tRESULT[] = [];

        for (const project of projects) {
            if (!(await CheckForPath(project))) {
                await LogStuff(
                    ColorString(`Path not found: ${project}. You might want to update your list of ${I_LIKE_JS.MFS}.`, "red"),
                    "error",
                );
                results.push({
                    path: project,
                    status: "Not found",
                    elapsedTime: GetElapsedTime(now),
                });
                continue;
            }

            try {
                Deno.chdir(project);
                await LogStuff(
                    ColorString(`Cleaning the ${await NameProject(project)} ${I_LIKE_JS.MF}...`, "blue"),
                    "working",
                );

                const lockfiles: ALL_SUPPORTED_LOCKFILES[] = [];

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

                const { doClean, doUpdate, preliminaryStatus } = await ResolveProtection(project, update);
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
                            elapsedTime: GetElapsedTime(now),
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
                                        lint,
                                        prettify,
                                        commit,
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
                            elapsedTime: GetElapsedTime(now),
                        });
                        continue;
                    }
                } else if (await CheckForPath("package.json")) {
                    await LogStuff(
                        ColorString(`${project} has a package.json but not a lockfile. Can't ${I_LIKE_JS.FKN} clean.`, "bright-yellow"),
                        "warn",
                    );
                    results.push({
                        path: project,
                        status: "No lockfile.",
                        elapsedTime: GetElapsedTime(now),
                    });
                    continue;
                } else {
                    await LogStuff(
                        ColorString(`No supported lockfile was found at ${project}. Skipping this ${I_LIKE_JS.MF}...`, "bright-yellow"),
                        "warn",
                    );
                    results.push({
                        path: project,
                        status: "No package.json.",
                        elapsedTime: GetElapsedTime(now),
                    });
                    continue;
                }

                results.push({
                    path: project,
                    status: preliminaryStatus ? `Success # ${preliminaryStatus}` : "Success",
                    elapsedTime: GetElapsedTime(now),
                });
            } catch (e) {
                await LogStuff(
                    ColorString(`Error while working around with ${project}: ${e}`, "red"),
                    "error",
                );
                results.push({
                    path: project,
                    status: "Failed",
                    elapsedTime: GetElapsedTime(now),
                });
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
        if (verbose) await ShowReport(results);
        return;
    } catch (e) {
        await GenericErrorHandler(e);
    }
}
