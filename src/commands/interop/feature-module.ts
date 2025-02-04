import { StringUtils } from "@zakahacecosas/string-utils";
import { Commander } from "../../functions/cli.ts";
import { LogStuff } from "../../functions/io.ts";
import type { ProjectEnvironment } from "../../types/platform.ts";
import { FknError } from "../../utils/error.ts";
import { FkNodeInterop } from "./interop.ts";

const { validate, normalize } = StringUtils;

const validateScript: (script: { script: string } | "__USE_DEFAULT") => boolean = (script: { script: string } | "__USE_DEFAULT"): boolean => {
    if (
        (typeof script === "string" && normalize(script) !== "__USE_DEFAULT") ||
        (typeof script !== "string" && !validate(script.script) && normalize(script.script) !== "__USE_DEFAULT")
    ) {
        return false;
    }

    return true;
};

// TODO - the rest
export const InteropedFeatures = {
    Lint: async (
        env: ProjectEnvironment,
        verbose: boolean,
        linter: { script: string } | "__USE_DEFAULT",
    ): Promise<boolean> => {
        if (!validateScript(linter)) return false;

        switch (env.runtime) {
            case "bun":
            case "node":
                if (linter === "__USE_DEFAULT") {
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

                    if (!output.success) {
                        throw new FknError(
                            "Unknown__CleanerTask__Lint",
                            "Something went wrong and we don't know what",
                        ).debug(
                            output.stdout ??
                                "UNDEFINED COMMAND STDOUT/STDERR - Check above, command output is likely to be present in your terminal session.",
                        );
                    }

                    return true;
                } else {
                    const output = await Commander(
                        env.commands.run[0],
                        [env.commands.run[1], linter.script],
                        verbose,
                    );

                    if (!output.success) {
                        throw new FknError(
                            "Unknown__CleanerTask__Lint",
                            "Something went wrong and we don't know what",
                        ).debug(
                            output.stdout ??
                                "UNDEFINED COMMAND STDOUT/STDERR - Check above, command output is likely to be present in your terminal session.",
                        );
                    }

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

                if (!output.success) {
                    throw new FknError(
                        "Unknown__CleanerTask__Lint",
                        "Something went wrong and we don't know what",
                    ).debug(
                        output.stdout ??
                            "UNDEFINED COMMAND STDOUT/STDERR - Check above, command output is likely to be present in your terminal session.",
                    );
                }

                return true;
            }
        }
    },
    Pretty: async (
        env: ProjectEnvironment,
        verbose: boolean,
        prettifier: { script: string } | "__USE_DEFAULT",
    ): Promise<boolean> => {
        if (!validateScript(prettifier)) return false;

        switch (env.runtime) {
            case "bun":
            case "node":
                if (prettifier === "__USE_DEFAULT") {
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

                    if (!output.success) {
                        throw new FknError(
                            "Unknown__CleanerTask__Pretty",
                            "Something went wrong and we don't know what",
                        ).debug(
                            output.stdout ??
                                "UNDEFINED COMMAND STDOUT/STDERR - Check above, command output is likely to be present in your terminal session.",
                        );
                    }

                    return true;
                } else {
                    const output = await Commander(
                        env.commands.run[0],
                        [env.commands.run[1], prettifier.script],
                        verbose,
                    );

                    if (!output.success) {
                        throw new FknError(
                            "Unknown__CleanerTask__Pretty",
                            "Something went wrong and we don't know what",
                        ).debug(
                            output.stdout ??
                                "UNDEFINED COMMAND STDOUT/STDERR - Check above, command output is likely to be present in your terminal session.",
                        );
                    }

                    return true;
                }
            case "deno":
            case "rust":
            case "golang": {
                // customization unsupported for all of these
                // deno fmt settings should work from deno.json, tho
                const output = await Commander(
                    env.commands.base,
                    env.runtime === "rust" ? ["fmt", "./..."] : env.runtime === "golang" ? ["fmt", "./..."] : ["fmt"],
                    verbose,
                );

                if (!output.success) {
                    throw new FknError(
                        "Unknown__CleanerTask__Pretty",
                        "Something went wrong and we don't know what",
                    ).debug(
                        output.stdout ??
                            "UNDEFINED COMMAND STDOUT/STDERR - Check above, command output is likely to be present in your terminal session.",
                    );
                }

                return true;
            }
        }
    },
    Update: async (
        env: ProjectEnvironment,
        verbose: boolean,
        updater: { script: string } | "__USE_DEFAULT",
    ): Promise<boolean> => {
        if (!validateScript(updater)) return false;

        if (updater === "__USE_DEFAULT") {
            const output = await Commander(
                env.commands.base,
                env.commands.update,
                verbose,
            );

            if (!output.success) {
                throw new FknError(
                    "Unknown__CleanerTask__Update",
                    "Something went wrong and we don't know what",
                ).debug(
                    output.stdout ??
                        "UNDEFINED COMMAND STDOUT/STDERR - Check above, command output is likely to be present in your terminal session.",
                );
            }

            return true;
        }

        switch (env.runtime) {
            case "rust":
            case "golang":
                throw new FknError(
                    "Interop__CannotRunJsLike",
                    `${env.manager} does not support JavaScript-like "run" commands, however you've set updateCmdOverride in your fknode.yaml to ${updater.script}. Since we don't know what you're doing, update task wont proceed for this project.`,
                );
            case "bun":
            case "deno":
            case "node": {
                const output = await Commander(
                    env.commands.run[0],
                    [env.commands.run[1], updater.script],
                    verbose,
                );

                if (!output.success) {
                    throw new FknError(
                        "Unknown__CleanerTask__Update",
                        "Something went wrong and we don't know what",
                    ).debug(
                        output.stdout ??
                            "UNDEFINED COMMAND STDOUT/STDERR - Check above, command output is likely to be present in your terminal session.",
                    );
                }

                return true;
            }
        }
    },
};
