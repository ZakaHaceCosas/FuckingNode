import { iLikeJs } from "./constants.ts";
import { GetPath, LogStuff } from "./functions.ts";
import { type SUPPORTED_LOCKFILE } from "./types.ts";

async function CleanMotherfucker(
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
        try {
            await Deno.stat(maximPath);
            await Deno.remove(maximPath, {
                recursive: true,
            });
            await LogStuff(
                `Maxim pruned ${motherfuckerInQuestion}.`,
                "tick-clear",
            );
        } catch {
            await LogStuff(
                `An unknown error happened with maxim pruning at ${motherfuckerInQuestion}. Skipping this ${iLikeJs.mf}...`,
                "bruh",
            );
        }
    }
}

export default async function FuckingNodeCleaner(
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
            motherFuckers = data
                .split("\n")
                .map((line) => line.trim().replace(/,$/, ""))
                .filter((line) => line.length > 0);
        } catch (e) {
            await LogStuff(
                `${iLikeJs.mfn} error reading your ${iLikeJs.mfn} list of ${iLikeJs.mfs}: ${e}`,
            );
            Deno.exit(1);
        }

        if (motherFuckers.length === 0) {
            await LogStuff(
                `There isn't any ${iLikeJs.mf} over here... yet...`,
                "moon-face",
            );
            return;
        }

        let maximForReal: boolean;
        if (maxim) {
            maximForReal = confirm(
                "⚠ Are you sure you want to use maxim cleaning? It will recursively remove the contents of node_modules for ALL projects from your list.",
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
            if (!(await Deno.stat(motherfucker))) {
                await LogStuff(`Path not found: ${motherfucker}`, "error");
                results.push({ path: motherfucker, status: "Not found" });
                continue;
            }

            try {
                Deno.chdir(motherfucker);
                await LogStuff(
                    `Cleaning the ${motherfucker} ${iLikeJs.mf}...`,
                    "working",
                );

                try {
                    if (await Deno.stat(".fknodeignore")) {
                        if (verbose) {
                            await LogStuff(
                                `This ${iLikeJs.mf} (${motherfucker}) is protected by ${iLikeJs.fkn} divine protection (.fknodeignore file). Cannot clean or update it.`,
                                "heads-up",
                            );
                        }
                        results.push({
                            path: motherfucker,
                            status: "Protected",
                        });
                        continue;
                    }
                } catch {
                    // nothing :D
                }

                if (await Deno.stat("pnpm-lock.yaml")) {
                    await CleanMotherfucker(
                        "pnpm-lock.yaml",
                        motherfucker,
                        update,
                        maximForReal,
                    );
                } else if (await Deno.stat("package-lock.json")) {
                    await CleanMotherfucker(
                        "package-lock.json",
                        motherfucker,
                        update,
                        maximForReal,
                    );
                } else if (await Deno.stat("yarn.lock")) {
                    await CleanMotherfucker(
                        "yarn.lock",
                        motherfucker,
                        update,
                        maximForReal,
                    );
                } else if (await Deno.stat("package.json")) {
                    await LogStuff(
                        `${motherfucker} has a package.json but not a lockfile. Can't ${iLikeJs.fkn} clean.`,
                        "warn",
                    );
                } else {
                    await LogStuff(
                        `Neither pnpm-lock.yaml nor package-lock.json nor yarn.lock were found at the ${iLikeJs.mfn} ${motherfucker}. Skipping this ${iLikeJs.mf}...`,
                        "warn",
                    );
                }

                results.push({ path: motherfucker, status: "Success" });
            } catch (err) {
                await LogStuff(
                    `Error while processing ${motherfucker} -> ${err}`,
                    "error",
                );
                results.push({ path: motherfucker, status: "Failed" });
            }
        }

        // go back home
        Deno.chdir(originalLocation);
        await LogStuff(
            `All your ${iLikeJs.mfn} Node projects have been cleaned! Back to ${originalLocation}.`,
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
