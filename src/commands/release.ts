import { format, parse } from "@std/semver";
import { ColorString, LogStuff } from "../functions/io.ts";
import { GetProjectEnvironment, NameProject, SpotProject } from "../functions/projects.ts";
import type { TheReleaserConstructedParams } from "./constructors/command.ts";
import type { DenoPkgFile, NodePkgFile } from "../types/platform.ts";
import { Commander } from "../functions/cli.ts";
import { GetProjectSettings } from "../functions/projects.ts";
import { PerformCleaning } from "./toolkit/cleaner.ts";
import { Git } from "../utils/git.ts";
import { StringUtils } from "@zakahacecosas/string-utils";

export default async function TheReleaser(params: TheReleaserConstructedParams) {
    try {
        if (!StringUtils.validate(params.project)) {
            throw new Error("No project specified!");
        }
        if (!StringUtils.validate(params.version)) {
            throw new Error("No version specified!");
        }

        // validate version
        const parsedVersion = parse(params.version);
        if (!parsedVersion) {
            throw new TypeError(`Invalid SemVer version: '${params.version}'.`);
        }

        const project = await SpotProject(params.project);
        const CWD = Deno.cwd();
        const env = await GetProjectEnvironment(project);
        Deno.chdir(env.root);
        const settings = await GetProjectSettings(project);

        if (!env || !settings) {
            throw new Error(`Failed to load environment or settings for project '${params.project}'.`);
        }

        if (env.commands.publish === "__UNSUPPORTED") {
            throw new Error(`Platform ${env.runtime} doesn't support publishing. Aborting.`);
        }

        const releaseCmd = StringUtils.validate(settings.releaseCmd) ? StringUtils.normalize(settings.releaseCmd) : "__DISABLE";

        // bump version from pkg json first
        const newPackageFile: NodePkgFile | DenoPkgFile = {
            ...env.main.stdContent,
            version: format(parsedVersion),
        };

        const actions: string[] = [
            `${ColorString(`Commit ${ColorString(params.version, "bold")} to Git`, "white")}`,
            `Create a Git tag ${ColorString(params.version, "bold")}`,
            `Update your ${env.main.name}'s "version" field`,
            `Create a ${ColorString(`${env.main.name}.bak`, "bold")} file, and add it to .gitignore`,
        ];
        if (releaseCmd !== "__DISABLE") {
            actions.push(
                `Run ${
                    ColorString(
                        `${env.commands.run.join(" ")} ${releaseCmd}`,
                        "bold",
                    )
                }`,
            );
        }
        if (params.push) {
            actions.push(
                `Push one commit to GitHub ${
                    ColorString("adding ALL of your uncommitted content alongside our changes", "bold")
                }, and push the created tag too`,
            );
        }
        if (!(params.dry === true || settings.releaseAlwaysDry === true)) {
            actions.push(
                ColorString(`Publish your changes to ${ColorString(env.runtime === "deno" ? "JSR" : "npm", "bold")}`, "red"),
            );
        }
        const confirmation = await LogStuff(
            `Heads up! We're about to take the following actions:\n${actions.join("\n")}\n\n- all of this at ${await NameProject(
                project,
                "all",
            )}`,
            "heads-up",
            "red",
            true,
        );

        if (!confirmation) return;

        // write the updated pkg file
        try {
            await Deno.copyFile(env.main.path, `${env.main.path}.bak`); // Backup original
            await Deno.writeTextFile(env.main.path, JSON.stringify(newPackageFile, undefined, 2));
        } catch (e) {
            throw new Error(`Failed to write to '${env.main.path}': ${e}`);
        }

        // run their releaseCmd
        if (releaseCmd !== "__DISABLE") {
            const releaseOutput = await Commander(
                env.commands.run[0],
                [env.commands.run[1], releaseCmd],
            );

            if (!releaseOutput.success) {
                throw new Error(
                    `Release command failed (${releaseCmd}): ${releaseOutput.stdout}`,
                );
            }
        }

        // run our maintenance task
        await PerformCleaning(
            project,
            true,
            true,
            true,
            true,
            true,
            false,
            "normal",
            true,
        );

        // just in case
        await Git.Ignore(
            project,
            `${env.main.name}.bak`,
            true,
        );

        await Git.Commit(
            project,
            `Release v${format(parsedVersion)} (automated by F*ckingNode)`,
            "all",
            [],
            true,
        );

        await Git.Tag(
            project,
            format(parsedVersion),
            params.push,
            true,
        );

        if (params.push) {
            // push stuff to git
            const pushOutput = await Git.Push(project, false, true);
            if (pushOutput === 1) {
                throw new Error(`Git push failed unexpectedly.`);
            }
        }

        if (params.dry === true || settings.releaseAlwaysDry === true) {
            if (settings.releaseAlwaysDry === true) {
                await LogStuff(
                    "Note: Package won't be published because the releaseAlwaysDry key in your fknode.yaml is set to true. If you want to publish this package, remove or unset that key.",
                    "warn",
                    "bright-yellow",
                );
            }
            return;
        }

        // publish the package
        const publishOutput = await Commander(env.commands.base, env.commands.publish);
        if (!publishOutput.success) {
            throw new Error(`Publish command failed: ${publishOutput.stdout}`);
        }

        Deno.chdir(CWD);
        await LogStuff(`That worked out! ${params.version} should be live now.`, "tick", ["bold", "bright-green"]);
        return;
    } catch (e) {
        if (e instanceof TypeError) {
            await LogStuff(`Invalid version: ${params.version}. Please use a valid SemVer version.`, "error", "red");
            return;
        } else {
            throw e;
        }
    }
}
