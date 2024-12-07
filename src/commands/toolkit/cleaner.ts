import { I_LIKE_JS } from "../../constants.ts";
import { Commander, CommandExists } from "../../functions/cli.ts";
import { GetSettings } from "../../functions/config.ts";
import { CheckForPath, JoinPaths, ParsePath } from "../../functions/filesystem.ts";
import { ColorString, LogStuff } from "../../functions/io.ts";
import type { CleanerIntensity } from "../../types/config_params.ts";
import type { SUPPORTED_NODE_LOCKFILES } from "../../types/package_managers.ts";
import { FknError } from "../../utils/error.ts";

export async function PerformNodeCleaning(
    lockfile: SUPPORTED_NODE_LOCKFILES,
    projectInQuestion: string,
    shouldUpdate: boolean,
    shouldClean: boolean,
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
        if (shouldClean) {
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
        }
    } catch (e) {
        throw e;
    }
}

// cache cleaning is global, so doing these for every project like we used to do
// is a waste of resources
export async function PerformHardCleanup(): Promise<void> {
    await LogStuff(
        ColorString("Time for hard-pruning! Wait patiently, please (caches can take a while to clean).", "italic"),
        "package",
    );

    const tmp = await Deno.makeTempDir({
        prefix: "FKNODE-HARD-CLEAN-TMP",
    }); // we make a temporal dir where we'll do "placebo" inits, as bun requires you to be in a bun project for it to clean stuff
    // for deno idk if its necessary but i'll do it anyway

    Deno.chdir(tmp); // assuming this is called from the main cleaner, which at the end returns to the DIR it should.

    const npmHardPruneArgs: string[] = ["cache", "clean", "--force"];
    const pnpmHardPruneArgs: string[] = ["store", "prune"];
    const yarnHardPruneArgs: string[] = ["cache", "clean"];
    // bun and deno don't support yet project-wide cleanup
    // but they do support system-wide cleanup thanks to this
    // now F*kingNode is F*ckingJavascriptRuntimes :]
    const bunHardPruneArgs: string[] = ["pm", "cache", "rm"];
    // const denoHardPruneArgs: string[] = ["clean"];

    if (await CommandExists("npm")) {
        await LogStuff(
            ColorString("NPM", "red"),
            "package",
        );
        await Commander("npm", npmHardPruneArgs, true);
        await LogStuff("Done", "tick");
    }
    if (await CommandExists("pnpm")) {
        await LogStuff(
            ColorString("PNPM", "bright-yellow"),
            "package",
        );
        await Commander("pnpm", pnpmHardPruneArgs, true);
        await LogStuff("Done", "tick");
    }
    if (await CommandExists("yarn")) {
        await LogStuff(
            ColorString("YARN", "purple"),
            "package",
        );
        await Commander("yarn", yarnHardPruneArgs, true);
        await LogStuff("Done", "tick");
    }

    if (await CommandExists("bun")) {
        await LogStuff(
            ColorString("BUN", "pink"),
            "package",
        );
        await Commander("bun", ["init", "-y"], false); // placebo
        await Commander("bun", bunHardPruneArgs, true);
        await LogStuff("Done", "tick");
    }
    /* if (await CommandExists("deno")) {
        await Commander("deno", ["init"], false); // placebo 2
        await Commander("deno", denoHardPruneArgs, true);
    } */

    // deno requires this glue fix
    // because apparently i cannot clear the cache of deno
    // using a program thats written in deno
    // and it throws an error and exists the CLI
    // epic.
    if (await CommandExists("deno")) {
        try {
            const denoDir: string | undefined = Deno.env.get("DENO_DIR");
            if (!denoDir) throw "lmao";
            await LogStuff(
                ColorString("DENO", "bright-blue"),
                "package",
            );
            await Deno.remove(denoDir);
            await LogStuff("Done", "tick");
            // the CLI calls this kind of behaviors "maxim" cleanup
            // yet we're doing from the "hard" preset and not the
            // "maxim" one
            // epic.
        } catch {
            // nothing happened.
        }
    }

    try {
        await Deno.remove(tmp, {
            recursive: true,
        }); // free the user's space
    } catch (e) {
        await LogStuff(
            "[ERROR] Due to an unknown error, a temporal DIR wasn't deleted. DIR path:\n" + tmp + "\nError:\n" + e,
            "error",
            undefined,
            undefined,
            false,
        );
    }

    return;
}

export async function ValidateIntensity(intensity: string): Promise<CleanerIntensity> {
    if (!["hard", "hard-only", "normal", "maxim", "--"].includes(intensity)) {
        throw new FknError("Cleaner__InvalidCleanerIntensity", `Provided intensity '${intensity}' is not valid.`);
    }

    const workingIntensity = intensity as CleanerIntensity | "--";
    const defaultIntensity = (await GetSettings()).defaultCleanerIntensity;

    if (workingIntensity === "--") {
        return defaultIntensity;
    }

    if (workingIntensity === "hard-only") {
        return "hard-only";
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
        return confirmMaxim === true ? "maxim" : defaultIntensity;
    } else {
        return defaultIntensity;
    }
}
