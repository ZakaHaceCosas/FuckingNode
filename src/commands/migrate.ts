import { Commander } from "../functions/cli.ts";
import { CheckForPath, JoinPaths, ParsePath } from "../functions/filesystem.ts";
import { LogStuff } from "../functions/io.ts";
import type { PKG_MANAGERS, SUPPORTED_NODE_LOCKFILES } from "../types/package_managers.ts";
import type { TheMigratorConstructedParams } from "./constructors/command.ts";

export default async function TheMigrator(params: TheMigratorConstructedParams) {
    const { project, target } = params;
    if (!project) throw new Error("No project (path) specified.");
    if (!target) throw new Error("No target (pnpm, npm, yarn) specified.");
    const MANAGERS = ["pnpm", "npm", "yarn"];
    if (!MANAGERS.includes(target)) throw new Error("Target isn't a valid package manager (pnpm, npm, yarn).");

    const cwd = Deno.cwd();
    let code: 0 | 1 = 0;

    async function handler(remove: SUPPORTED_NODE_LOCKFILES, cmd: PKG_MANAGERS, target: string) {
        try {
            await LogStuff("Please wait (this will take a while)...", "working");
            try {
                await LogStuff("Removing node_modules (1/3)...", "working");
                await Deno.remove(await JoinPaths(target, "node_modules"), {
                    recursive: true,
                });
            } catch (e) {
                throw e;
            }

            Deno.chdir(target);
            await LogStuff("Installing modules with the desired manager (2/3)...", "working");
            const command = await Commander(cmd, ["install"]);

            if (!command.success) {
                await LogStuff(`New installation threw an error: ${command.stdout}`, "error");
            }

            try {
                await LogStuff("Removing previous lockfile (3/3)...", "working");
                await Deno.remove(await JoinPaths(target, remove));
            } catch (e) {
                throw e;
            }
        } catch (e) {
            await LogStuff(`Migration threw an: ${e}`, "error");
        }
    }

    try {
        const workingProject = await ParsePath(project);
        const workingTarget = target.toLowerCase().trimEnd().trimStart();

        if (!(["pnpm", "npm", "yarn"].includes(workingTarget))) {
            throw new Error(`${workingTarget} is not a valid target. Use either "pnpm", "npm", or "yarn".`);
        }

        const isNpm = await CheckForPath(await JoinPaths(workingProject, "package-lock.json"));
        const isPnpm = await CheckForPath(await JoinPaths(workingProject, "pnpm-lock.yaml"));
        const isYarn = await CheckForPath(await JoinPaths(workingProject, "yarn.lock"));

        if (!isNpm && !isPnpm && !isYarn) throw new Error("We weren't able to find a valid lockfile over here.");

        if (!(await CheckForPath(await JoinPaths(target, "package.json")))) {
            throw new Error("No package.json found, cannot migrate. How will we install your modules without it?");
        }

        const c = await LogStuff(
            `Are you sure?\nMigrating ${workingProject} to ${target} will remove your current lockfile, so versions could be potentially messed up.`,
            "what",
            undefined,
            true,
        );
        if (!c) return;

        if (isNpm) await handler("package-lock.json", target as PKG_MANAGERS, workingProject);
        else if (isPnpm) await handler("pnpm-lock.yaml", target as PKG_MANAGERS, workingProject);
        else if (isYarn) await handler("yarn.lock", target as PKG_MANAGERS, workingProject);
    } catch (e) {
        await LogStuff(`${e}`, "error");
        code = 1;
    } finally {
        Deno.chdir(cwd);
        Deno.exit(code);
    }
}
