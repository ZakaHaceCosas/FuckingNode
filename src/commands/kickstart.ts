import { Commander, CommandExists } from "../functions/cli.ts";
import { GetSettings } from "../functions/config.ts";
import { CheckForDir, JoinPaths, ParsePath } from "../functions/filesystem.ts";
import { ColorString, LogStuff } from "../functions/io.ts";
import { GetProjectEnvironment, NameProject } from "../functions/projects.ts";
import type { TheKickstarterConstructedParams } from "./constructors/command.ts";
import { AddProject } from "./manage.ts";
import type { CF_FKNODE_SETTINGS } from "../types/config_files.ts";
import { FkNodeInterop } from "./interop/interop.ts";
import { StringUtils } from "@zakahacecosas/string-utils";
import { APP_NAME } from "../constants.ts";
import { NameLockfile, ResolveLockfiles } from "./toolkit/cleaner.ts";

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

export default async function TheKickstarter(params: TheKickstarterConstructedParams) {
    const { gitUrl, path, manager } = params;

    if (!gitUrl) throw new Error("Error: Git URL is required!");

    const gitUrlRegex = /^(https?:\/\/.*?\/)([^\/]+)\.git$/;
    const regexMatch = gitUrl.match(gitUrlRegex);
    if (!regexMatch) throw new Error(`Error: ${gitUrl} is not a valid Git URL!`);

    const projectName = regexMatch[2];
    if (!projectName) throw new Error(`RegEx Error: Can't spot the project name in ${gitUrl}`);

    const cwd = Deno.cwd();
    const clonePath: string = path ? await ParsePath(path) : await ParsePath(await JoinPaths(cwd, projectName));

    const clonePathValidator = await CheckForDir(clonePath);
    if (clonePathValidator === "ValidButNotEmpty") {
        throw new Error(`${clonePath} is not empty! Stuff would break if we tried to kickstart with this path, so choose another one!`);
    }
    if (clonePathValidator === "NotDir") {
        throw new Error(`${path} is not a directory...`);
    }

    await LogStuff("Let's begin! Wait a moment please...", "tick-clear");

    const gitOutput = await Commander("git", ["clone", gitUrl, clonePath], true);
    if (!gitOutput.success) throw new Error(`Error cloning repository: ${gitOutput.stdout}`);

    Deno.chdir(clonePath);

    const lockfiles = await ResolveLockfiles(Deno.cwd());

    if (lockfiles.length === 0) {
        if (["npm", "pnpm", "yarn", "deno", "bun", "cargo", "go"].includes(StringUtils.normalize(manager ?? ""))) {
            await LogStuff(`This project lacks a lockfile. We'll generate it right away!`, "warn");
            await Deno.writeTextFile(
                await JoinPaths(Deno.cwd(), NameLockfile(manager as "npm" | "pnpm" | "yarn" | "bun" | "deno" | "go" | "cargo")),
                "",
            ); // fix Internal__CantDetermineEnv by adding a fake lockfile
            // the pkg manager SHOULD BE smart enough to ignore and overwrite it
            // tested with pnpm and it works, i'll assume it works everywhere
        } else {
            await LogStuff(
                `${
                    ColorString("This project lacks a lockfile and we can't set it up.", "bold")
                }\nIf the project lacks a lockfile and you don't specify a package manager to use (kickstart 3RD argument), we simply can't tell what to use to install dependencies. Sorry!\n${
                    ColorString(
                        `PS. Git DID clone the project at ${Deno.cwd()}. Just run there the install command you'd like!`,
                        "italic",
                    )
                }`,
                "warn",
            );
            return;
        }
    }

    // assume we skipped error
    const typedProvidedManager = manager?.trim() as "npm" | "pnpm" | "yarn" | "deno" | "bun" | "cargo" | "go" || "";
    const env = await GetProjectEnvironment(Deno.cwd());

    const fallbackNodeManager: "pnpm" | "npm" = CommandExists("pnpm") ? "pnpm" : "npm";

    const isNodeManager = (manager: string): manager is "npm" | "pnpm" | "yarn" => ["npm", "pnpm", "yarn"].includes(manager);

    // deno-fmt-ignore
    const managerToUse: "npm" | "pnpm" | "yarn" | "deno" | "bun" | "go" | "cargo" =
            StringUtils.validate(manager)
                ? (isNodeManager(env.manager) && isNodeManager(typedProvidedManager))
                    ? typedProvidedManager
                    : env.manager
                : isNodeManager(env.manager)
                    ? fallbackNodeManager
                    : env.manager;

    await LogStuff(
        `Installation began using ${managerToUse}. Have a coffee meanwhile!`,
        "tick-clear",
    );

    try {
        switch (managerToUse) {
            case "go":
                await FkNodeInterop.Installers.Golang(Deno.cwd());
                break;
            case "cargo":
                await FkNodeInterop.Installers.Cargo(Deno.cwd());
                break;
            case "bun":
            case "deno":
            case "npm":
            case "pnpm":
            case "yarn":
                await FkNodeInterop.Installers.UniJs(Deno.cwd(), managerToUse);
                break;
        }
    } catch (e) {
        throw new Error(`Error installing dependencies: ${e}`);
    }

    // lol
    try {
        await AddProject(Deno.cwd());
    } catch (e) {
        throw new Error(`Error setting up your favorite CLI tool (${APP_NAME.CLI}) in this project! ${e}`);
    }

    const favEditor = (await GetSettings()).favoriteEditor;

    if (!(["vscode", "sublime", "emacs", "notepad++", "atom", "vscodium"].includes(favEditor))) {
        await LogStuff(`Error: ${favEditor} is not a supported editor!`, "error");
    }

    await LaunchIDE(favEditor);

    await LogStuff(`Great! ${await NameProject(Deno.cwd(), "name-ver")} is now setup. Enjoy!`, "tick-clear");

    Deno.chdir(cwd);
}
