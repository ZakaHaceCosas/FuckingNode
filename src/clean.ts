import { GetPath, LogStuff, type SUPPORTED_LOCKFILE } from "./constants.ts";

async function CleanMotherfucker(
    lockfile: SUPPORTED_LOCKFILE,
    shouldUpdate: boolean,
    motherfuckerInQuestion: string,
) {
    let baseCommand: string;
    let pruneArg: string[];
    let updateArg: string[];
    switch (lockfile) {
        case "package-lock.json":
            baseCommand = "npm";
            pruneArg = ["prune"];
            updateArg = ["update"];
            break;
        case "pnpm-lock.yaml":
            baseCommand = "pnpm";
            pruneArg = ["store", "prune"];
            updateArg = ["update"];
            break;
        case "yarn.lock":
            baseCommand = "yarn";
            pruneArg = ["autoclean", "--force"];
            updateArg = ["upgrade"];
            break;
        default:
            throw new Error("Invalid lockfile provided");
    }

    if (shouldUpdate) {
        await LogStuff(
            `📦 Updating and using ${baseCommand} for ${motherfuckerInQuestion}.`,
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
        await LogStuff(`📦 ${baseCommand + " " + updateArg}: ${updateStdout}`);
    }
    await LogStuff(
        `📦 Pruning using ${baseCommand} for ${motherfuckerInQuestion}.`,
    );
    const pruneCmd = new Deno.Command(baseCommand, {
        args: pruneArg,
    });
    const pruneOutput = await pruneCmd.output();
    if (!pruneOutput.success) {
        throw new Error(
            `pruning ${motherfuckerInQuestion} gave an unknown error`,
        );
    }
    const pruneStdout = new TextDecoder().decode(pruneOutput.stdout);
    await LogStuff(`📦 ${baseCommand + " " + pruneArg}: ${pruneStdout}`);
}

export default async function FuckingNodeCleaner(
    verbose: boolean,
    update: boolean,
) {
    try {
        // original path
        const originalLocation = Deno.cwd();

        // read all motherfuckers
        let motherFuckers: string[] = [];
        try {
            const data = await Deno.readTextFile(GetPath("MOTHERFUCKERS"));
            motherFuckers = data
                .split("\n")
                .map((line) => line.trim().replace(/,$/, ""))
                .filter((line) => line.length > 0);
        } catch (e) {
            await LogStuff(
                `Motherfucking error reading your motherfucking list of motherfuckers: ${e}`,
            );
            Deno.exit(1);
        }

        if (motherFuckers.length === 0) {
            await LogStuff(
                "🌚 There isn't any motherfucker over here... yet...",
            );
            return;
        }

        await LogStuff(`🔄 Cleaning started at ${new Date().toLocaleString()}`);

        const results: { path: string; status: string }[] = [];

        for (const motherfucker of motherFuckers) {
            if (!(await Deno.stat(motherfucker))) {
                await LogStuff(`❌ Path not found: ${motherfucker}`);
                results.push({ path: motherfucker, status: "Not found" });
                continue;
            }

            try {
                Deno.chdir(motherfucker);
                await LogStuff(
                    `🔄 Cleaning the ${motherfucker} motherfucker...`,
                );

                try {
                    if (await Deno.stat(".fknodeignore")) {
                        if (verbose) {
                            await LogStuff(
                                `🚨 This motherfucker (${motherfucker}) is protected by fucking divine protection (.fknodeignore file). Cannot clean it.`,
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
                        update,
                        motherfucker,
                    );
                } else if (await Deno.stat("package-lock.json")) {
                    await CleanMotherfucker(
                        "package-lock.json",
                        update,
                        motherfucker,
                    );
                } else if (await Deno.stat("yarn.lock")) {
                    await CleanMotherfucker("yarn.lock", update, motherfucker);
                } else if (await Deno.stat("package.json")) {
                    await LogStuff(
                        `⚠️ ${motherfucker} has a package.json but not a lockfile. Can't fucking clean.`,
                    );
                } else {
                    await LogStuff(
                        `⚠️ Neither pnpm-lock.yaml nor package-lock.json nor yarn.lock were found at the motherfucking ${motherfucker}. Skipping this motherfucker...`,
                    );
                }

                results.push({ path: motherfucker, status: "Success" });
            } catch (err) {
                await LogStuff(
                    `❌ Error while processing ${motherfucker} -> ${err}`,
                );
                results.push({ path: motherfucker, status: "Failed" });
            }
        }

        // go back home
        Deno.chdir(originalLocation);
        await LogStuff(
            `✅ All your motherfucking Node projects have been cleaned! Back to ${originalLocation}.`,
        );

        if (verbose) {
            // shows a report
            await LogStuff("📊 Report:");
            for (const result of results) {
                await LogStuff(`${result.path} -> ${result.status}`);
            }

            await LogStuff(
                `✅ Cleaning completed at ${new Date().toLocaleString()}`,
            );
        }
        Deno.exit(0);
    } catch (e) {
        await LogStuff("Some error happened: " + e);
        Deno.exit(1);
    }
}
