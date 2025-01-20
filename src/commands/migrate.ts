import { Commander } from "../functions/cli.ts";
import { CheckForPath, JoinPaths } from "../functions/filesystem.ts";
import { LogStuff } from "../functions/io.ts";
import { GetProjectEnvironment, SpotProject } from "../functions/projects.ts";
import type { SUPPORTED_JAVASCRIPT_MANAGER, SUPPORTED_JS_NODE_LOCKFILE } from "../types/platform.ts";
import type { TheMigratorConstructedParams } from "./constructors/command.ts";

export default async function TheMigrator(params: TheMigratorConstructedParams) {
    const { project, desiredManager } = params;
    if (!project) throw new Error("No project (path) specified.");
    if (!desiredManager) throw new Error("No target (pnpm, npm, yarn) specified.");
    const MANAGERS = ["pnpm", "npm", "yarn"];
    if (!MANAGERS.includes(desiredManager)) throw new Error("Target isn't a valid package manager (pnpm, npm, yarn).");

    const cwd = Deno.cwd();
    let code: 0 | 1 = 0;

    async function handler(remove: SUPPORTED_JS_NODE_LOCKFILE, cmd: SUPPORTED_JAVASCRIPT_MANAGER, target: string) {
        try {
            await LogStuff("Please wait (this will take a while)...", "working");

            await LogStuff("Removing node_modules (1/3)...", "working");
            await Deno.remove(await JoinPaths(target, "node_modules"), {
                recursive: true,
            });

            Deno.chdir(target);
            await LogStuff("Installing modules with the desired manager (2/3)...", "working");
            const command = await Commander(cmd, ["install"]);

            if (!command.success) {
                throw new Error(`New installation threw an error: ${command.stdout}`);
            }

            await LogStuff("Removing previous lockfile (3/3)...", "working");
            await Deno.remove(await JoinPaths(target, remove));
        } catch (e) {
            await LogStuff(`Migration threw an: ${e}`, "error");
        }
    }

    try {
        const workingProject = await SpotProject(project);
        const workingEnv = await GetProjectEnvironment(workingProject);
        const workingTarget = desiredManager.toLowerCase().trim();

        if (!(["pnpm", "npm", "yarn"].includes(workingTarget))) {
            throw new Error(`${workingTarget} is not a valid target. Use either "pnpm", "npm", or "yarn".`);
        }

        if (!(["pnpm", "npm", "yarn"].includes(workingEnv.manager))) {
            throw new Error(`${workingTarget} is not a valid target. Use either "pnpm", "npm", or "yarn".`);
        }

        if (!(await CheckForPath(workingEnv.main.path))) {
            throw new Error("No package.json found, cannot migrate. How will we install your modules without it?");
        }

        const c = await LogStuff(
            `Are you sure?\nMigrating ${workingProject} to ${desiredManager} will remove your current lockfile, so versions could be potentially messed up.`,
            "what",
            undefined,
            true,
        );
        if (!c) return;

        await handler(
            workingEnv.lockfile.name as SUPPORTED_JS_NODE_LOCKFILE,
            desiredManager as SUPPORTED_JAVASCRIPT_MANAGER,
            workingProject,
        );
        code = 0;
    } catch (e) {
        await LogStuff(`${e}`, "error");
        code = 1;
    } finally {
        Deno.chdir(cwd);
        Deno.exit(code);
    }
}
