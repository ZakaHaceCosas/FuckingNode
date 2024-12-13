import { I_LIKE_JS } from "../constants.ts";
import { CheckForPath } from "../functions/filesystem.ts";
import { ColorString, LogStuff } from "../functions/io.ts";
import { GetAllProjects, GetProjectSettings, NameProject, UnderstandProjectSettings } from "../functions/projects.ts";
import type { TheCleanerConstructedParams } from "./constructors/command.ts";
import GenericErrorHandler from "../utils/error.ts";
import { PerformCleaning, PerformHardCleanup, ResolveLockfiles, ShowReport, ValidateIntensity } from "./toolkit/cleaner.ts";
import type { CleanerIntensity } from "../types/config_params.ts";
import { GetElapsedTime } from "../functions/date.ts";

export type tRESULT = { path: string; status: string; elapsedTime: string };

export default async function TheCleaner(params: TheCleanerConstructedParams) {
    const { intensity, verbose, update, lint, prettify, destroy, commit } = params;
    // start time
    const now = new Date();

    try {
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
                    `Cleaning the ${await NameProject(project)} ${I_LIKE_JS.MF}...`,
                    "working",
                );

                const lockfiles = await ResolveLockfiles(project);
                const { doClean, doUpdate, doPrettify, doLint, doDestroy } = UnderstandProjectSettings.protection(
                    await GetProjectSettings(project),
                    {
                        update,
                        lint,
                        destroy,
                        prettify,
                    },
                );

                // TODO - readd preliminary status (basically showing '... # * protected' in report and a log warning for the user)

                if (lockfiles.length > 0) {
                    if (lockfiles.length === 1) {
                        for (const lockfile of lockfiles) {
                            await PerformCleaning(
                                lockfile,
                                project,
                                doUpdate,
                                doClean,
                                doLint,
                                doPrettify,
                                doDestroy,
                                commit,
                                realIntensity,
                            );
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
                    status: /* preliminaryStatus ? `Success # ${preliminaryStatus}` : */ "Success",
                    elapsedTime: GetElapsedTime(now),
                });
            } catch (e) {
                await LogStuff(
                    ColorString(`Error while working around with ${await NameProject(project, "name")}: ${e}`, "red"),
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
