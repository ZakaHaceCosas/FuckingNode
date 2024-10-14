import { GetPath, LogStuff } from "./constants.ts";

export default async function FuckingNodeCleaner(verbose: boolean) {
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

        // check for update flag
        const updateFlag = Deno.args.includes("--update");

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
                    if (updateFlag) {
                        await LogStuff(
                            `📦 Updating and using pnpm for ${motherfucker}.`,
                        );
                        const updateCmd = new Deno.Command("pnpm", {
                            args: ["update"],
                        });
                        const updateOutput = await updateCmd.output();
                        if (!updateOutput.success) {
                            throw new Error(
                                `some motherfucker called 'pnpm update' gave error at ${motherfucker}`,
                            );
                        }
                        const updateStdout = new TextDecoder().decode(
                            updateOutput.stdout,
                        );
                        await LogStuff(`📦 pnpm update: ${updateStdout}`);
                    }
                    await LogStuff(
                        `📦 Pruning using pnpm for ${motherfucker}.`,
                    );
                    const pruneCmd = new Deno.Command("pnpm", {
                        args: ["store", "prune"],
                    });
                    const pruneOutput = await pruneCmd.output();
                    if (!pruneOutput.success) {
                        throw new Error(
                            `some motherfucker called 'pnpm prune' gave error at ${motherfucker}`,
                        );
                    }
                    const pruneStdout = new TextDecoder().decode(
                        pruneOutput.stdout,
                    );
                    await LogStuff(`📦 pnpm prune: ${pruneStdout}`);
                } else if (await Deno.stat("package-lock.json")) {
                    if (updateFlag) {
                        await LogStuff(
                            `📦 Updating and using npm for ${motherfucker}.`,
                        );
                        const updateCmd = new Deno.Command("npm", {
                            args: ["update"],
                        });
                        const updateOutput = await updateCmd.output();
                        if (!updateOutput.success) {
                            throw new Error(
                                `some motherfucker called 'npm update' gave error at ${motherfucker}`,
                            );
                        }
                        const updateStdout = new TextDecoder().decode(
                            updateOutput.stdout,
                        );
                        await LogStuff(`📦 npm update: ${updateStdout}`);
                    }
                    await LogStuff(`📦 Pruning using npm for ${motherfucker}.`);
                    const pruneCmd = new Deno.Command("npm", {
                        args: ["prune"],
                    });
                    const pruneOutput = await pruneCmd.output();
                    if (!pruneOutput.success) {
                        throw new Error(
                            `some motherfucker called 'npm prune' gave error at ${motherfucker}`,
                        );
                    }
                    const pruneStdout = new TextDecoder().decode(
                        pruneOutput.stdout,
                    );
                    await LogStuff(`📦 npm prune: ${pruneStdout}`);
                } else if (await Deno.stat("yarn.lock")) {
                    if (updateFlag) {
                        await LogStuff(
                            `📦 Updating and using Yarn for ${motherfucker}.`,
                        );
                        const upgradeCmd = new Deno.Command("yarn", {
                            args: ["upgrade"],
                        });
                        const upgradeOutput = await upgradeCmd.output();
                        if (!upgradeOutput.success) {
                            throw new Error(
                                `some motherfucker called 'yarn upgrade' gave error at ${motherfucker}`,
                            );
                        }
                        const upgradeStdout = new TextDecoder().decode(
                            upgradeOutput.stdout,
                        );
                        await LogStuff(`📦 yarn upgrade: ${upgradeStdout}`);
                    }
                    await LogStuff(
                        `📦 Pruning using Yarn for ${motherfucker}.`,
                    );
                    const autocleanCmd = new Deno.Command("yarn", {
                        args: ["autoclean", "--force"],
                    });
                    const autocleanOutput = await autocleanCmd.output();
                    if (!autocleanOutput.success) {
                        throw new Error(
                            `some motherfucker called 'yarn autoclean' gave error at ${motherfucker}`,
                        );
                    }
                    const autocleanStdout = new TextDecoder().decode(
                        autocleanOutput.stdout,
                    );
                    await LogStuff(`📦 yarn autoclean: ${autocleanStdout}`);
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
