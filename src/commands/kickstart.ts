import { Commander } from "../functions/cli.ts";
import { JoinPaths, ParsePath } from "../functions/filesystem.ts";
import { LogStuff } from "../functions/io.ts";
import { NameProject } from "../functions/projects.ts";
import type { PKG_MANAGERS } from "../types/package_managers.ts";
import type { TheKickstartConstructedParams } from "./constructors/command.ts";

export default async function TheKickstart(params: TheKickstartConstructedParams) {
    const { gitUrl, path, manager } = params;

    if (!gitUrl) {
        await LogStuff("Error: Git URL is required!", "error");
        Deno.exit(1);
    }

    const gitUrlRegex = /^(https?:\/\/.*?\/)([^\/]+)\.git$/;
    const regexMatch = gitUrl.match(gitUrlRegex);
    if (!regexMatch) {
        await LogStuff(`Error: ${gitUrl} is not a valid Git URL!`, "error");
        Deno.exit(1);
    }

    const projectName = regexMatch[2];
    if (!projectName) {
        Deno.exit(1);
    }

    const workingPath: string = path ? await ParsePath(path) : await ParsePath(await JoinPaths(Deno.cwd(), projectName));

    const workingManager: PKG_MANAGERS = manager ? manager : "pnpm";

    try {
        const gitOutput = await Commander("git", ["clone", gitUrl, workingPath]);
        if (!gitOutput.success) throw new Error(`Error cloning repository: ${gitOutput.stdout}`);

        Deno.chdir(workingPath);
        const managerOutput = await Commander(workingManager, ["install"]);
        if (!managerOutput.success) throw new Error(`Error installing dependencies: ${managerOutput.stdout}`);

        // lol
        const selfOutput = await Commander("fuckingnode", ["manager", "add", "--self"]);
        if (!selfOutput.success) throw new Error(`Error setting up your favorite CLI tool (fuckingnode) in this project! ${selfOutput.stdout}`);

        const vscOutput = await Commander("code", [workingPath]);
        if (!vscOutput.success) throw new Error(`Error launching VSCode: ${vscOutput.stdout}`);

        await LogStuff(`Great! ${await NameProject(workingPath, "name-ver")} is now setup. Enjoy!`);
    } catch (e) {
        await LogStuff(`Unknown error: ${e}`, "error");
        Deno.exit(1);
    }
}
