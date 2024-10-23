import { I_LIKE_JS } from "./constants.ts";
import { CheckForPath, GetPath, LogStuff } from "./functions.ts";
import { type SUPPORTED_LOCKFILE } from "./types.ts";
import { IGNORE_FILE } from "./constants.ts";
import { ParsePath } from "./functions.ts";

async function PerformCleaning(
    lockfile: SUPPORTED_LOCKFILE,
    motherfuckerInQuestion: string,
    shouldUpdate: boolean,
    shouldMaxim: boolean,
) {
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
            pruneArgs = [["dedupe"], ["prune"], ["store", "prune"]];
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
            `Updating and using ${baseCommand} for ${motherfuckerInQuestion}.`,
            "package",
        );
        const updateCmd = new Deno.Command(baseCommand, {
            args: updateArg,
        });
        const updateOutput = await updateCmd.output();
        if (!updateOutput.success) {
            throw new Error(
                `updating ${motherfuckerInQuestion} gave an unknown error`,
            );
        }
        const updateStdout = new TextDecoder().decode(updateOutput.stdout);
        await LogStuff(
            `${baseCommand + " " + updateArg}: ${updateStdout}`,
            "package",
        );
    }
    if (!shouldMaxim) {
        await LogStuff(
            `Pruning using ${baseCommand} for ${motherfuckerInQuestion}.`,
            "package",
        );
        for (const pruneArg of pruneArgs) {
            const pruneCmd = new Deno.Command(baseCommand, {
                args: pruneArg,
            });
            const pruneOutput = await pruneCmd.output();
            if (!pruneOutput.success) {
                throw new Error(
                    `Pruning ${motherfuckerInQuestion} gave an unknown error: ${
                        pruneOutput.stderr ? new TextDecoder().decode(pruneOutput.stderr) : ""
                    }`,
                );
            }
            const pruneStdout = new TextDecoder().decode(pruneOutput.stdout);
            await LogStuff(
                `${baseCommand} ${pruneArg.join(" ")}: ${pruneStdout}`,
                "package",
            );
        }
    } else if (shouldMaxim) {
        const maximPath = `${motherfuckerInQuestion}/node_modules`;

        await LogStuff(
            `Maxim pruning for ${motherfuckerInQuestion} (path: ${maximPath}).`,
            "trash",
        );
        if (!(await CheckForPath(maximPath))) {
            await LogStuff(
                `An unknown error happened with maxim pruning at ${motherfuckerInQuestion}. Skipping this ${I_LIKE_JS.MF}...`,
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
}

export default async function TheCleaner(
    verbose: boolean,
    update: boolean,
    maxim: boolean,
) {
    try {
        // original path
        const originalLocation = Deno.cwd();

        // read all mfs
        let motherFuckers: string[] = [];
        try {
            const data = await Deno.readTextFile(GetPath("MOTHERFKRS"));
            motherFuckers = ParsePath("cleaner", data) as string[];
        } catch (e) {
            await LogStuff(
                `${I_LIKE_JS.MFN} error reading your ${I_LIKE_JS.MFN} list of ${I_LIKE_JS.MFS}: ${e}`,
            );
            Deno.exit(1);
        }

        if (motherFuckers.length === 0) {
            await LogStuff(
                `There isn't any ${I_LIKE_JS.MF} over here... yet...`,
                "moon-face",
            );
            return;
        }

        let maximForReal: boolean;
        if (maxim) {
            maximForReal = await LogStuff(
                "Are you sure you want to use maxim cleaning? It will entirely remove the node_modules DIR for ALL of your projects.",
                "warn",
                undefined,
                true,
            );
        } else {
            maximForReal = false;
        }

        if (verbose) {
            await LogStuff(
                `Cleaning started at ${new Date().toLocaleString()}`,
                "working",
            );
        }

        const results: { path: string; status: string }[] = [];

        for (const motherfucker of motherFuckers) {
            if (!(await CheckForPath(motherfucker))) {
                await LogStuff(`Path not found: ${motherfucker}. You might want to update your list of ${I_LIKE_JS.MFS}.`, "error");
                results.push({ path: motherfucker, status: "Not found" });
                continue;
            }

            try {
                Deno.chdir(motherfucker);
                await LogStuff(
                    `Cleaning the ${motherfucker} ${I_LIKE_JS.MF}...`,
                    "working",
                );

                if (await CheckForPath(IGNORE_FILE)) {
                    await LogStuff(
                        `This ${I_LIKE_JS.MF} (${motherfucker}) is protected by ${I_LIKE_JS.FKN} divine protection (.fknodeignore file). Cannot clean or update it.`,
                        "heads-up",
                    );
                    results.push({
                        path: motherfucker,
                        status: "Protected",
                    });
                    continue;
                }

                if (await CheckForPath("pnpm-lock.yaml")) {
                    await PerformCleaning(
                        "pnpm-lock.yaml",
                        motherfucker,
                        update,
                        maximForReal,
                    );
                } else if (await CheckForPath("package-lock.json")) {
                    await PerformCleaning(
                        "package-lock.json",
                        motherfucker,
                        update,
                        maximForReal,
                    );
                } else if (await CheckForPath("yarn.lock")) {
                    await PerformCleaning(
                        "yarn.lock",
                        motherfucker,
                        update,
                        maximForReal,
                    );
                } else if (await CheckForPath("package.json")) {
                    await LogStuff(
                        `${motherfucker} has a package.json but not a lockfile. Can't ${I_LIKE_JS.FKN} clean.`,
                        "warn",
                    );
                } else {
                    await LogStuff(
                        `No supported lockfile was found at ${motherfucker}. Skipping this ${I_LIKE_JS.MF}...`,
                        "warn",
                    );
                }

                results.push({ path: motherfucker, status: "Success" });
            } catch (e) {
                await LogStuff(
                    `Error while working around with ${motherfucker}: ${e}`,
                    "error",
                );
                results.push({ path: motherfucker, status: "Failed" });
            }
        }

        // go back home
        Deno.chdir(originalLocation);
        await LogStuff(
            `All your ${I_LIKE_JS.MFN} Node projects have been cleaned! Back to ${originalLocation}.`,
            "tick",
        );

        if (verbose) {
            // shows a report
            await LogStuff("Report:", "chart");
            for (const result of results) {
                await LogStuff(`${result.path} -> ${result.status}`);
            }

            await LogStuff(
                `Cleaning completed at ${new Date().toLocaleString()}`,
                "tick",
            );
        }
        Deno.exit(0);
    } catch (e) {
        await LogStuff("Some error happened: " + e);
        Deno.exit(1);
    }
}
