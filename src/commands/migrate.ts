import { StringUtils } from "@zakahacecosas/string-utils";
import { FULL_NAME } from "../constants.ts";
import { GetDateNow } from "../functions/date.ts";
import { CheckForPath, JoinPaths } from "../functions/filesystem.ts";
import { LogStuff } from "../functions/io.ts";
import { GetProjectEnvironment, NameProject, SpotProject } from "../functions/projects.ts";
import type { MANAGER_JS, ProjectEnvironment } from "../types/platform.ts";
import type { TheMigratorConstructedParams } from "./constructors/command.ts";
import { FkNodeInterop } from "./interop/interop.ts";
import { rename } from "node:fs";

async function handler(
    from: MANAGER_JS,
    to: MANAGER_JS,
    env: ProjectEnvironment,
) {
    try {
        if (env.runtime === "golang" || env.runtime === "rust") {
            throw new Error("This shouldn't have happened (internal error) - NonJS environment assigned JS-only task (migrate).");
        }

        await LogStuff("Please wait (this will take a while)...", "working");

        await LogStuff("Updating dependencies (1/5)...", "working");
        await FkNodeInterop.Features.Update({ env, verbose: true, script: env.settings.updateCmdOverride });

        await LogStuff("Removing node_modules (2/5)...", "working");
        await Deno.remove(env.hall_of_trash, {
            recursive: true,
        });

        Deno.chdir(env.root);

        // TODO - this is already reliable enough for release
        // ...BUT reading the lockfile would be better
        // (we promised that for 3.0 but i don't want this to release in 2077 so yeah)
        await LogStuff("Migrating versions from previous package file (3/5)...", "working");
        await LogStuff("A copy will be made (package.json.bak), just in case", "wink");
        if (env.main.path.endsWith("jsonc")) {
            await LogStuff(
                "Your deno.jsonc's comments (if any) WON'T be preserved in final package file, but WILL be present in the .bak file. Sorry bro.",
                "bruh",
            );
        }
        const newPackageFile = from === "deno"
            ? FkNodeInterop.Generators.Deno(
                env.main.cpfContent,
                env.main.stdContent,
            )
            : FkNodeInterop.Generators.NodeBun(
                env.main.cpfContent,
                env.main.stdContent,
            );
        await Deno.writeTextFile(
            JoinPaths(env.root, `${env.main.name}.jsonc.bak`),
            `// This is a backup of your previous project file. We (${FULL_NAME}) overwrote it at ${GetDateNow()}.\n${
                JSON.stringify(env.main.stdContent)
            }`,
        );
        await Deno.writeTextFile(
            env.main.path,
            JSON.stringify(newPackageFile),
        );

        await LogStuff("Making a backup of your previous lockfile (4/5)...", "working");
        if (env.lockfile.name === "bun.lockb" && CheckForPath(JoinPaths(env.root, "bun.lock"))) {
            // handle case where bun.lockb was replaced with bun.lock
            rename(env.lockfile.path, JoinPaths(env.root, "bun.lockb.bak"), async (e) => {
                if (e) throw e;
                await LogStuff(
                    "Your bun.lockb file will be backed up and replaced with a text-based lockfile (bun.lock).",
                    "bruh",
                );
            });
            await Deno.remove(env.lockfile.path);
        } else {
            await Deno.writeTextFile(
                JoinPaths(env.root, `${env.lockfile.name}.bak`),
                await Deno.readTextFile(env.lockfile.path),
            );
            await Deno.remove(env.lockfile.path);
        }

        await LogStuff("Installing modules with the desired manager (5/5)...", "working");
        await FkNodeInterop.Installers.UniJs(env.root, to);
    } catch (e) {
        await LogStuff(`Migration threw an: ${e}`, "error");
    }
}
export default async function TheMigrator(params: TheMigratorConstructedParams): Promise<void> {
    const { projectPath, wantedManager } = params;

    if (!StringUtils.validate(wantedManager)) throw new Error("No target (pnpm, npm, yarn, deno, bun) specified.");

    const desiredManager = StringUtils.normalize(wantedManager);

    const MANAGERS = ["pnpm", "npm", "yarn", "deno", "bun"];
    if (!MANAGERS.includes(StringUtils.normalize(desiredManager))) {
        throw new Error("Target isn't a valid package manager. Only JS environments (NodeJS, Deno, Bun) support migrate.");
    }

    const cwd = Deno.cwd();

    const workingProject = await SpotProject(projectPath);
    const workingEnv = await GetProjectEnvironment(workingProject);

    if (!MANAGERS.includes(workingEnv.manager)) {
        throw new Error(
            `${workingEnv.manager} is not a runtime we can migrate from. Only JS environments (NodeJS, Deno, Bun) support migrate.`,
        );
    }

    if (!CheckForPath(workingEnv.main.path)) {
        throw new Error(
            "No package.json/deno.json(c) file found, cannot migrate. How will we install your modules without that file?",
        );
    }

    if (
        // TODO - replace validation with a non-blocking warning once we start using lockfile for this (by v3.1 i guess?)
        await LogStuff(
            `Are you sure?\nMigrating ${workingProject} to ${desiredManager} will remove your current lockfile, so versions could be potentially messed up.`,
            "what",
            undefined,
            true,
        ) === false
    ) return;

    await handler(
        workingEnv.manager as MANAGER_JS,
        desiredManager as MANAGER_JS,
        workingEnv,
    );

    await LogStuff(`That worked out! Enjoy using ${desiredManager} for ${await NameProject(workingEnv.root, "all")}`);

    Deno.chdir(cwd);

    return;
}
