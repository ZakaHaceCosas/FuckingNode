import { JoinPaths, LogStuff, ParsePath } from "./functions.ts";
import { CheckForPath } from "./functions.ts";
import type { MANAGERS, SUPPORTED_LOCKFILE } from "./types.ts";

export default async function TheMigrator(project: string, target: MANAGERS) {
    const cwd = Deno.cwd();
    let code: 0 | 1 = 0;

    async function handler(remove: SUPPORTED_LOCKFILE, cmd: MANAGERS, target: string) {
        try {
            await LogStuff("Please wait (this will take a while)...", "working");
            try {
                await LogStuff("Removing node_modules and previous lockfile (1/3)...", "working");
                await Deno.remove(JoinPaths(target, remove));
                await LogStuff("Removing node_modules and previous lockfile (2/3)...", "working");
                await Deno.remove(JoinPaths(target, "node_modules"), {
                    recursive: true,
                });
            } catch (e) {
                throw e;
            }

            Deno.chdir(target);
            await LogStuff("Installing modules with the desired manager (3/3)...", "working");
            const command = new Deno.Command(cmd, { args: ["install"] });
            const output = await command.output();

            if (!output.success) {
                await LogStuff(`New installation threw an error: ${new TextDecoder().decode(output.stderr)}`, "error");
            }
        } catch (e) {
            await LogStuff(`Migration threw an: ${e}`, "error");
        }
    }

    try {
        const workingProject = ParsePath("path", project) as string;
        const workingTarget = target.toLowerCase().trimEnd().trimStart();

        if (!(["pnpm", "npm", "yarn"].includes(workingTarget))) {
            throw new Error(`${workingTarget} is not a valid target. Use either "pnpm", "npm", or "yarn".`);
        }

        const isNpm = await CheckForPath(JoinPaths(workingProject, "package-lock.json"));
        const isPnpm = await CheckForPath(JoinPaths(workingProject, "pnpm-lock.yaml"));
        const isYarn = await CheckForPath(JoinPaths(workingProject, "yarn.lock"));

        if (!isNpm && !isPnpm && !isYarn) throw new Error("We weren't able to find a valid lockfile over here.");

        if (!(await CheckForPath(JoinPaths(target, "package.json")))) {
            throw new Error("No package.json found, cannot migrate. How will we install your modules without it?");
        }

        const c = await LogStuff(
            `Are you sure?\nMigrating ${workingProject} to ${target} will remove your current lockfile, so versions could be potentially messed up.`,
            "what",
            undefined,
            true,
        );
        if (!c) return;

        if (isNpm) await handler("package-lock.json", target, workingProject);
        else if (isPnpm) await handler("pnpm-lock.yaml", target, workingProject);
        else if (isYarn) await handler("yarn.lock", target, workingProject);
    } catch (e) {
        await LogStuff(`${e}`, "error");
        code = 1;
    } finally {
        Deno.chdir(cwd);
        Deno.exit(code);
    }
}
