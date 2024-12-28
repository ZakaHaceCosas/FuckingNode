import { Commander } from "../functions/cli.ts";
import { GetSettings } from "../functions/config.ts";
import { CheckForDir, JoinPaths, ParsePath } from "../functions/filesystem.ts";
import { LogStuff } from "../functions/io.ts";
import { GetProjectEnvironment, NameProject } from "../functions/projects.ts";
import type { PKG_MANAGERS } from "../types/package_managers.ts";
import type { TheKickstartConstructedParams } from "./constructors/command.ts";
import { AddProject } from "./manage.ts";

export default async function TheKickstart(params: TheKickstartConstructedParams) {
    try {
        const { gitUrl, path, manager } = params;

        if (!gitUrl) throw new Error("Error: Git URL is required!");

        const gitUrlRegex = /^(https?:\/\/.*?\/)([^\/]+)\.git$/;
        const regexMatch = gitUrl.match(gitUrlRegex);
        if (!regexMatch) throw new Error(`Error: ${gitUrl} is not a valid Git URL!`);

        const projectName = regexMatch[2];
        if (!projectName) throw new Error(`RegEx Error: Can't spot the project name in ${gitUrl}`);

        const clonePath: string = path ? await ParsePath(path) : await ParsePath(await JoinPaths(Deno.cwd(), projectName));

        const clonePathValidator = await CheckForDir(clonePath);
        if (clonePathValidator === "ValidButNotEmpty") {
            throw new Error(`${clonePath} is not empty! Stuff would break if we tried to kickstart with this path, so choose another one!`);
        }
        if (clonePathValidator === "NotDir") {
            throw new Error(`${path} is not a directory...`);
        }

        const workingManager: PKG_MANAGERS | "__DEFAULT" = manager
            ? (["npm", "pnpm", "yarn", "deno", "bun"].includes(manager)) ? (manager as PKG_MANAGERS) : "pnpm"
            : "__DEFAULT";

        await LogStuff("Let's begin! Wait a moment please...", "tick-clear");

        const gitOutput = await Commander("git", ["clone", gitUrl, clonePath], true);
        if (!gitOutput.success) throw new Error(`Error cloning repository: ${gitOutput.stdout}`);

        Deno.chdir(clonePath);

        const clonedPath = Deno.cwd();
        console.log("DEBUG", clonedPath);

        const env = await GetProjectEnvironment(clonedPath);
        const managerToUse = workingManager === "__DEFAULT" ? env.manager : workingManager;

        await LogStuff(
            `Installation began using ${managerToUse}. Have a coffee meanwhile!`,
            "tick-clear",
        );
        const managerOutput = await Commander(managerToUse, ["install"]);
        if (!managerOutput.success) throw new Error(`Error installing dependencies: ${managerOutput.stdout}`);

        // lol
        try {
            await AddProject(clonedPath, true);
        } catch (e) {
            throw new Error(`Error setting up your favorite CLI tool (fuckingnode) in this project! ${e}`);
        }

        const favEditor = (await GetSettings()).favoriteEditor;
        let command: "code" | "subl";
        switch (favEditor) {
            case "sublime":
                command = "subl";
                break;
            case "vscode":
                command = "code";
                break;
        }

        if (["subl", "code"].includes(command)) {
            const editorOutput = await Commander(command, [clonedPath]);
            if (!editorOutput.success) throw new Error(`Error launching ${favEditor}: ${editorOutput.stdout}`);
        } else {
            await LogStuff(`Error: ${favEditor} is not a supported editor!`, "error");
        }

        await LogStuff(`Great! ${await NameProject(clonedPath, "name-ver")} is now setup. Enjoy!`, "tick-clear");
    } catch (e) {
        await LogStuff(`Error: ${e}`, "error");
    }
}
