import { I_LIKE_JS } from "../../constants.ts";
import { Commander, CommandExists } from "../../functions/cli.ts";
import { CheckForPath, JoinPaths, ParsePath } from "../../functions/filesystem.ts";
import { LogStuff } from "../../functions/io.ts";
import { SUPPORTED_NODE_LOCKFILE } from "../../types.ts";

export async function PerformNodeCleaning(
    lockfile: SUPPORTED_NODE_LOCKFILE,
    projectInQuestion: string,
    shouldUpdate: boolean,
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
    } catch (e) {
        throw e;
    }
}

// cache cleaning is global, so doing these for every project like we used to do
// is a waste of resources
export async function PerformHardCleanup() {
    await LogStuff(
        "Time for hard-pruning! Wait patiently, please (caches take a while to clean)",
        "package",
    );

    const npmHardPruneArgs: string[] = ["cache", "clean", "--force"];
    const pnpmHardPruneArgs: string[] = ["store", "prune"];
    const yarnHardPruneArgs: string[] = ["cache", "clean"];
    // bun and deno don't support yet project-wide cleanup
    // but they do support system-wide cleanup thanks to this
    // now F*kingNode is F*ckingJavascriptRuntimes :]
    const bunHardPruneArgs: string[] = ["pm", "cache", "rm"];
    // const denoHardPruneArgs: string[] = ["clean"];

    if (await CommandExists("npm")) await Commander("npm", npmHardPruneArgs);
    if (await CommandExists("pnpm")) await Commander("pnpm", pnpmHardPruneArgs);
    if (await CommandExists("yarn")) await Commander("yarn", yarnHardPruneArgs);
    if (await CommandExists("bun")) await Commander("bun", bunHardPruneArgs);
    // if (await CommandExists("deno")) await Commander("deno", denoHardPruneArgs);

    // deno requires this glue fix
    // because apparently i cannot clear the cache of deno
    // using a program thats written in deno
    // and it throws an error and exists the CLI
    // epic.
    if (await CommandExists("deno")) {
        try {
            const denoDir: string | undefined = Deno.env.get("DENO_DIR");
            if (!denoDir) throw "lmao";
            await Deno.remove(denoDir);
            // the CLI calls this kind of behaviors "maxim" cleanup
            // yet we're doing from the "hard" preset and not the
            // "maxim" one
            // epic.
        } catch {
            // nothing happened.
            // i don't know what could happen if i delete the cache *live*
            // shouldn't be an issue as the compiled executable brings it's own
            // deno, but well, lets try :]
        }
    }
}
