import { LogStuff, ParsePath } from "./functions.ts";
import { CheckForPath } from "./functions.ts";
import type { MANAGERS, SUPPORTED_LOCKFILE } from "./types.ts";

export default async function TheMigrator(project: string, target: MANAGERS) {
    const cwd = Deno.cwd();
    let code: 0 | 1 = 0;

    async function handler(remove: SUPPORTED_LOCKFILE, cmd: MANAGERS, target: string) {
        try {
            await LogStuff("Please wait (this will take a while)...", "working");
            try {
                await Deno.remove(`${target}/${remove}`);
                await Deno.remove(`${target}/node_modules`, {
                    recursive: true,
                });
            } catch (e) {
                throw e;
            }

            if (!(await CheckForPath(`${target}/package.json`))) throw new Error("No package.json found, cannot migrate.");

            Deno.chdir(target);
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
        const workingProject = ParsePath("list", project) as string;

        const c = await LogStuff(
            `Are you sure you want to migrate ${workingProject} to ${target}? Your current lockfile will be removed, so versions could be potentially messed up.`,
            "what",
            undefined,
            true,
        );
        if (!c) return;

        const isNpm = await CheckForPath(`${workingProject}/package-lock.json`);
        const isPnpm = await CheckForPath(`${workingProject}/pnpm-lock.yaml`);
        const isYarn = await CheckForPath(`${workingProject}/yarn.lock`);

        if (!isNpm && !isPnpm && !isYarn) throw new Error("We weren't able to find a valid lockfile over here.");

        if (isNpm) await handler("package-lock.json", target, workingProject);
        else if (isPnpm) await handler("pnpm-lock.yaml", target, workingProject);
        else if (isYarn) await handler("yarn.lock", target, workingProject);
    } catch (e) {
        await LogStuff(`Some error happened: ${e}`, "error");
        code = 1;
    } finally {
        Deno.chdir(cwd);
        Deno.exit(code);
    }
}
