import { Commander } from "../functions/cli.ts";
import { GetSettings } from "../functions/config.ts";
import { CheckForDir, JoinPaths, ParsePath } from "../functions/filesystem.ts";
import { LogStuff } from "../functions/io.ts";
import { GetProjectEnvironment, NameProject } from "../functions/projects.ts";
import type { PKG_MANAGERS } from "../types/package_managers.ts";
import type { TheKickstartConstructedParams } from "./constructors/command.ts";
import { AddProject } from "./manage.ts";
import type { CF_FKNODE_SETTINGS } from "../types/config_files.ts";

async function LaunchIDE(IDE: CF_FKNODE_SETTINGS["favoriteEditor"]) {
    let executionCommand: "subl" | "code" | "emacs" | "notepad++" | "codium" | "atom";

    switch (IDE) {
        case "sublime":
            executionCommand = "subl";
            break;
        case "vscode":
            executionCommand = "code";
            break;
        case "vscodium":
            executionCommand = "codium";
            break;
        case "notepad++":
            executionCommand = "notepad++";
            break;
        case "emacs":
            executionCommand = "emacs";
            break;
        case "atom":
            executionCommand = "atom";
            break;
    }

    try {
        await Commander(executionCommand, ["."], false)
            .then((res) => {
                if (res.success === false) throw new Error(res.stdout);
            })
            .catch((e) => {
                throw e;
            });
    } catch (e) {
        throw new Error(`Error launching ${IDE}: ${e}`);
    }
}

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
            await AddProject(clonedPath);
        } catch (e) {
            throw new Error(`Error setting up your favorite CLI tool (fuckingnode) in this project! ${e}`);
        }

        const favEditor = (await GetSettings()).favoriteEditor;

        if (!(["vscode", "sublime", "emacs", "notepad++", "atom", "vscodium"].includes(favEditor))) {
            await LogStuff(`Error: ${favEditor} is not a supported editor!`, "error");
        }

        await LaunchIDE(favEditor);

        await LogStuff(`Great! ${await NameProject(clonedPath, "name-ver")} is now setup. Enjoy!`, "tick-clear");
    } catch (e) {
        await LogStuff(`Error: ${e}`, "error");
    }
}
