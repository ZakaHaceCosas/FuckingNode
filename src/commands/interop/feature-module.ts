import { StringUtils, type UnknownString } from "@zakahacecosas/string-utils";
import { Commander } from "../../functions/cli.ts";
import { LogStuff } from "../../functions/io.ts";
import type { ProjectEnvironment } from "../../types/platform.ts";
import { DebugFknErr, FknError } from "../../functions/error.ts";
import { FkNodeInterop } from "./interop.ts";
import { isDef } from "../../constants.ts";

function HandleError(
    err:
        | "Unknown__CleanerTask__Update"
        | "Unknown__CleanerTask__Lint"
        | "Unknown__CleanerTask__Pretty",
    stdout: UnknownString,
): never {
    DebugFknErr(
        err,
        "Something went wrong and we don't know what",
        stdout ??
            "UNDEFINED COMMAND STDOUT/STDERR - Check above, command output is likely to be present in your terminal session.",
    );
}

interface InteropedFeatureParams {
    /** Project's environment. */
    env: ProjectEnvironment;
    /** If given, a custom script to be used, or `__USE_DEFAULT` otherwise. */
    script: string | "__USE_DEFAULT";
    /** Whether to use verbose logging for this or not. */
    verbose: boolean;
}

/**
 * Cross-runtime compatible tasks. Supports linting, prettifying, and updating dependencies.
 */
export const InteropedFeatures = {
    Lint: async (params: InteropedFeatureParams): Promise<boolean> => {
        const { env, verbose, script } = params;

        switch (env.runtime) {
            case "bun":
            case "node":
                if (isDef(script)) {
                    if (FkNodeInterop.PackageFileUtils.SpotDependency("eslint", env.main.cpfContent.deps) === undefined) {
                        await LogStuff(
                            "No linter was given (via fknode.yaml > lintCmd), hence defaulted to ESLint - but ESLint is not installed!",
                            "bruh",
                        );
                        return false;
                    }

                    const output = await Commander(
                        env.commands.exec[0],
                        env.commands.exec.length === 1
                            ? [
                                "eslint",
                                "--fix",
                                ".",
                            ]
                            : [
                                env.commands.exec[1],
                                "eslint",
                                "--fix",
                                ".",
                            ],
                        verbose,
                    );

                    if (!output.success) HandleError("Unknown__CleanerTask__Lint", output.stdout);

                    return true;
                } else {
                    const output = await Commander(
                        env.commands.run[0],
                        [env.commands.run[1], script],
                        verbose,
                    );

                    if (!output.success) HandleError("Unknown__CleanerTask__Lint", output.stdout);

                    return true;
                }
            case "deno":
            case "rust":
                await LogStuff(
                    `Linting is unsupported for ${StringUtils.toUpperCaseFirst(env.runtime)}. Skipping task...", "warn", "bright-yellow`,
                );
                // TODO - funnily enough, our repository itself has a gluefix for this (iterates thru all code files running the check command individually)
                // both Deno and cargo use <rt> check <file> cmd, so we should do that later on
                return false;
            case "golang": {
                const output = await Commander(
                    "go",
                    ["vet", "./..."],
                    verbose,
                );

                if (!output.success) HandleError("Unknown__CleanerTask__Lint", output.stdout);

                return true;
            }
        }
    },
    Pretty: async (params: InteropedFeatureParams): Promise<boolean> => {
        const { env, verbose, script } = params;

        switch (env.runtime) {
            case "bun":
            case "node":
                if (isDef(script)) {
                    if (FkNodeInterop.PackageFileUtils.SpotDependency("prettier", env.main.cpfContent.deps) === undefined) {
                        await LogStuff(
                            "No prettifier was given (via fknode.yaml > prettyCmd), hence defaulted to Prettier - but Prettier is not installed!",
                            "bruh",
                        );
                        return false;
                    }

                    const output = await Commander(
                        env.commands.exec[0],
                        env.commands.exec.length === 1
                            ? [
                                "prettier",
                                "--w",
                                ".",
                            ]
                            : [
                                env.commands.exec[1],
                                "prettier",
                                "--w",
                                ".",
                            ],
                        verbose,
                    );

                    if (!output.success) HandleError("Unknown__CleanerTask__Pretty", output.stdout);

                    return true;
                } else {
                    const output = await Commander(
                        env.commands.run[0],
                        [env.commands.run[1], script],
                        verbose,
                    );

                    if (!output.success) HandleError("Unknown__CleanerTask__Pretty", output.stdout);

                    return true;
                }
            case "deno":
            case "rust":
            case "golang": {
                // customization unsupported for all of these
                // deno fmt settings should work from deno.json, tho
                const output = await Commander(
                    env.commands.base,
                    env.runtime === "deno" ? ["fmt"] : ["fmt", "./..."],
                    verbose,
                );

                if (!output.success) HandleError("Unknown__CleanerTask__Pretty", output.stdout);

                return true;
            }
        }
    },
    Update: async (params: InteropedFeatureParams): Promise<boolean> => {
        const { env, verbose, script } = params;

        if (isDef(script)) {
            const output = await Commander(
                env.commands.base,
                env.commands.update,
                verbose,
            );

            if (!output.success) HandleError("Unknown__CleanerTask__Update", output.stdout);

            return true;
        }

        switch (env.runtime) {
            case "rust":
            case "golang":
                throw new FknError(
                    "Interop__CannotRunJsLike",
                    `${env.manager} does not support JavaScript-like "run" commands, however you've set updateCmdOverride in your fknode.yaml to ${script}. Since we don't know what you're doing, update task wont proceed for this project.`,
                );
            case "bun":
            case "deno":
            case "node": {
                const output = await Commander(
                    env.commands.run[0],
                    [env.commands.run[1], script],
                    verbose,
                );

                if (!output.success) HandleError("Unknown__CleanerTask__Update", output.stdout);

                return true;
            }
        }
    },
};
