import { parse as parseYaml } from "@std/yaml";
import { parse as parseToml } from "@std/toml";
import { expandGlob } from "@std/fs";
import { DEFAULT_FKNODE_YAML, I_LIKE_JS, IGNORE_FILE } from "../constants.ts";
import type { BunfigToml, DenoPkgJson, NodePkgJson, ProjectEnv } from "../types/runtimes.ts";
import { CheckForPath, JoinPaths, ParsePath, ParsePathList } from "./filesystem.ts";
import { ColorString, LogStuff, NaturalizeFormattedString } from "./io.ts";
import GenericErrorHandler, { FknError } from "../utils/error.ts";
import { type FkNodeYaml, ValidateFkNodeYaml } from "../types/config_files.ts";
import type { NodePkgManagerProps } from "../types/package_managers.ts";
import { GetAppPath } from "./config.ts";
import { GetDateNow } from "./date.ts";

/**
 * Gets all the users projects and returns their paths as a `string[]`.
 *
 * @export
 * @async
 * @param {false | "limit" | "exclude"} ignored If "limit", only ignored projects are returned. If "exclude", only projects that aren't ignored are returned.
 * @returns {Promise<string[]>} The list of projects.
 */
export async function GetAllProjects(ignored?: false | "limit" | "exclude"): Promise<string[]> {
    try {
        const content = await Deno.readTextFile(await GetAppPath("MOTHERFKRS"));
        const list = ParsePathList(content);

        if (!ignored) return list;

        const ignoredReturn: string[] = [];
        const aliveReturn: string[] = [];

        for (const entry of list) {
            const protection = (await GetProjectSettings(entry)).divineProtection;
            if (!protection || protection === "disabled") {
                if (ignored === "exclude") aliveReturn.push(entry);
                continue;
            }
            if (ignored === "limit") ignoredReturn.push(entry);
        }

        if (ignored === "limit") return ignoredReturn;
        if (ignored === "exclude") return aliveReturn;

        return list;
    } catch (e) {
        await LogStuff(
            `Failed to read your projects - ${e}`,
            "error",
        );
        Deno.exit(1);
    }
}

/**
 * Given a path to a project, returns it's name.
 *
 * @export
 * @param {string} path Path to the **root** of the project.
 * @param {?"name" | "path" | "name-ver" | "all"} wanted What to return. `name` returns the name, `path` the file path, `name-ver` a `name@version` string, and `all` returns everything together.
 * @returns {string} The name of the project. If an error happens, it will return the path you provided (that's how we used to name projects anyway).
 */
export async function NameProject(path: string, wanted?: "name" | "path" | "name-ver" | "all"): Promise<string> {
    const workingPath = await ParsePath(path);
    const formattedPath = ColorString(ColorString(workingPath, "italic"), "half-opaque");

    try {
        const env = await GetProjectEnvironment(workingPath);
        const pkgFilePath = await Deno.readTextFile(env.main);

        let fullNamedProject: string;
        let formattedName: string;
        let formattedVersion: string;
        let formattedNameVer: string;

        switch (env.runtime) {
            case "node": {
                const packageJson: NodePkgJson = JSON.parse(pkgFilePath);

                if (!packageJson.name) return formattedPath;

                formattedName = ColorString(packageJson.name, "bold");

                formattedVersion = packageJson.version ? ColorString(packageJson.version, "purple") : "";

                formattedNameVer = `${ColorString(formattedName, "bright-green")}@${formattedVersion}`;

                fullNamedProject = `${formattedNameVer} ${formattedPath}`;
                break;
            }
            case "deno": {
                const denoJson: DenoPkgJson = JSON.parse(pkgFilePath);

                if (!denoJson.name) return formattedPath;

                formattedName = ColorString(denoJson.name, "bold");

                formattedVersion = denoJson.version ? ColorString(denoJson.version, "purple") : "";

                formattedNameVer = `${ColorString(formattedName, "bright-blue")}@${formattedVersion}`;

                fullNamedProject = `${formattedNameVer} ${formattedPath}`;
                break;
            }
            case "bun": {
                const bunToml: BunfigToml = parseYaml(pkgFilePath) as BunfigToml;

                if (!bunToml.name) return formattedPath;

                formattedName = ColorString(bunToml.name, "bold");

                formattedVersion = bunToml.version ? ColorString(bunToml.version, "purple") : "";

                formattedNameVer = `${ColorString(formattedName, "pink")}@${formattedVersion}`;

                fullNamedProject = `${formattedNameVer} ${formattedPath}`;
                break;
            }
        }

        switch (wanted) {
            case "all":
                return fullNamedProject;
            case "name":
                return formattedName;
            case "path":
                return formattedPath;
            case "name-ver":
            default:
                return formattedNameVer;
        }
    } catch {
        return formattedPath; // if it's not possible to name it, just give it the raw path
    }
}

/**
 * Gets a project's fknode.yaml, parses it and returns it.
 *
 * @export
 * @async
 * @param {string} path Path to the project
 * @returns {Promise<FkNodeYaml>} A FkNodeYaml object.
 */
export async function GetProjectSettings(
    path: string,
): Promise<FkNodeYaml> {
    const workingPath = await ParsePath(path);
    const pathToDivineFile = await JoinPaths(workingPath, IGNORE_FILE);

    if (!(await CheckForPath(pathToDivineFile))) return DEFAULT_FKNODE_YAML;
    const divineContent = await Deno.readTextFile(pathToDivineFile);
    const cleanContent = parseYaml(divineContent);

    if (!ValidateFkNodeYaml(cleanContent)) {
        await LogStuff(`${await NameProject(path)} has an invalid ${IGNORE_FILE}!`, "warn");
        await Deno.writeTextFile(
            pathToDivineFile,
            `\n# [NOTE (${GetDateNow()}): Invalid file format! (Auto-added by fuckingnode). DEFAULT SETTINGS WILL BE USED UPON INTERACTING WITH THIS ${I_LIKE_JS.MF.toUpperCase()}]`,
            {
                append: true,
            },
        );
        return DEFAULT_FKNODE_YAML;
    }

    return cleanContent;
}

/**
 * Wraps a bunch of functions (well currently just one but more in the future) to easily work around with fknode.yaml. Where `UnderstandProjectSettings` is `A`:
 *
 * `A.protection(settings: FkNodeYaml)` will return "*", "updater", "cleanup", or null depending on the level of protection of the project.
 */
export const UnderstandProjectSettings = {
    /**
     * Tells you about the protection of a project. Returns an object where 'true' means allowed and 'false' means protected.
     */
    protection: (settings: FkNodeYaml, options: {
        update: boolean;
        prettify: boolean;
        lint: boolean;
        destroy: boolean;
    }) => {
        if (!settings.divineProtection || settings.divineProtection === "disabled") {
            return {
                doClean: true,
                doUpdate: options.update,
                doPrettify: options.prettify,
                doLint: options.lint,
                doDestroy: options.destroy,
            };
        } else if (settings.divineProtection === "*") {
            return {
                doClean: false,
                doUpdate: false,
                doPrettify: false,
                doLint: false,
                doDestroy: false,
            };
        }
        const protection = settings.divineProtection;
        return {
            doClean: protection.includes("cleaner") ? false : true,
            doUpdate: protection.includes("updater") ? false : options.update,
            doPrettify: protection.includes("prettifier") ? false : options.prettify,
            doLint: protection.includes("linter") ? false : options.lint,
            doDestroy: protection.includes("destroyer") ? false : options.destroy,
        };
    },
};

/**
 * Possible errors.
 *
 * @typedef {ProjectError}
 */
type ProjectError = "IsDuplicate" | "NoPkgJson";

/**
 * Given a path to a project, returns `true` if the project is valid, or a message indicating if it's not a valid Node/Deno/Bun project.
 *
 * @async
 * @param {string} entry Path to the project.
 * @returns {Promise<true | ProjectError>} True if it's valid, a `ProjectError` otherwise.
 */
export async function ValidateProject(entry: string): Promise<true | ProjectError> {
    const workingEntry = await ParsePath(entry);
    const list = await GetAllProjects();
    const isDuplicate = (list.filter((item) => item === workingEntry).length) > 1;

    const env = await GetProjectEnvironment(workingEntry);

    if (isDuplicate) return "IsDuplicate";
    if (!(await CheckForPath(env.lockfile))) return "NoPkgJson";
    return true;
}

/**
 * Checks for workspaces within a Node, Bun, or Deno project, supporting package.json, pnpm-workspace.yaml, .yarnrc.yml, and bunfig.toml.
 *
 * @async
 * @param {string} path Path to the root of the project.
 * @returns {Promise<string[] | null>}
 */
export async function GetWorkspaces(path: string): Promise<string[] | null> {
    try {
        const workingPath: string = await ParsePath(path);

        if (!(await CheckForPath(workingPath))) throw new Error("Requested path doesn't exist.");

        const workspacePaths: string[] = [];

        // Check package.json for Node, npm, and yarn (and Bun workspaces).
        const packageJsonPath = await JoinPaths(workingPath, "package.json");
        if (await CheckForPath(packageJsonPath)) {
            const pkgJson: NodePkgJson = JSON.parse(await Deno.readTextFile(packageJsonPath));
            if (pkgJson.workspaces) {
                const pkgWorkspaces = Array.isArray(pkgJson.workspaces) ? pkgJson.workspaces : pkgJson.workspaces?.packages || [];
                workspacePaths.push(...pkgWorkspaces);
            }
        }

        // Check pnpm-workspace.yaml for pnpm workspaces
        const pnpmWorkspacePath = await JoinPaths(workingPath, "pnpm-workspace.yaml");
        if (await CheckForPath(pnpmWorkspacePath)) {
            const pnpmConfig = parseYaml(await Deno.readTextFile(pnpmWorkspacePath)) as { packages: string[] };
            if (pnpmConfig.packages && Array.isArray(pnpmConfig)) workspacePaths.push(...pnpmConfig.packages);
        }

        // Check .yarnrc.yml for Yarn workspaces
        const yarnRcPath = await JoinPaths(workingPath, ".yarnrc.yml");
        if (await CheckForPath(yarnRcPath)) {
            const yarnConfig = parseYaml(await Deno.readTextFile(yarnRcPath)) as { workspaces?: string[] };
            if (yarnConfig.workspaces && Array.isArray(yarnConfig)) workspacePaths.push(...yarnConfig.workspaces);
        }

        // Check bunfig.toml for Bun workspaces
        const bunfigTomlPath = await JoinPaths(workingPath, "bunfig.toml");
        if (await CheckForPath(bunfigTomlPath)) {
            const bunConfig = parseToml(await Deno.readTextFile(bunfigTomlPath)) as { workspace?: string[] };
            if (bunConfig.workspace && Array.isArray(bunConfig.workspace)) workspacePaths.push(...bunConfig.workspace);
        }

        // Check for Deno configuration (deno.json or deno.jsonc)
        const denoJsonPath = await JoinPaths(workingPath, "deno.json");
        const denoJsoncPath = await JoinPaths(workingPath, "deno.jsonc");
        if ((await CheckForPath(denoJsonPath)) || (await CheckForPath(denoJsoncPath))) {
            const denoConfig = JSON.parse(
                await Deno.readTextFile(
                    (await CheckForPath(denoJsonPath)) ? denoJsonPath : denoJsoncPath,
                ),
            );
            if (denoConfig.workspace && Array.isArray(denoConfig.workspace)) {
                for (const member of denoConfig.workspace) {
                    const memberPath = await JoinPaths(workingPath, member);
                    workspacePaths.push(memberPath);
                }
            }
        }

        if (workspacePaths.length === 0) return null;

        const absoluteWorkspaces: string[] = [];
        for (const workspacePath of workspacePaths) {
            const fullPath = await JoinPaths(workingPath, workspacePath);
            for await (const dir of expandGlob(fullPath)) {
                if (dir.isDirectory) {
                    absoluteWorkspaces.push(dir.path);
                }
            }
        }

        return absoluteWorkspaces;
    } catch (e) {
        await LogStuff(`Error looking for workspaces: ${e}`, "error");
        return null;
    }
}

/**
 * Returns a project's environment (package manager, JS runtime, and paths to lockfile and `node_modules`).
 *
 * @export
 * @async
 * @param {string} path Path to the project's root.
 * @returns {Promise<ProjectEnv>}
 */
export async function GetProjectEnvironment(path: string): Promise<ProjectEnv> {
    try {
        const workingPath = await ParsePath(path);
        if (!(await CheckForPath(workingPath))) throw new Error("Path doesn't exist.");
        const trash = await JoinPaths(workingPath, "node_modules");

        const isDeno = await CheckForPath(await JoinPaths(workingPath, "deno.json")) ||
            await CheckForPath(await JoinPaths(workingPath, "deno.jsonc")) || await CheckForPath(await JoinPaths(workingPath, "deno.lock"));
        const isBun = await CheckForPath(await JoinPaths(workingPath, "bun.lockb")) ||
            await CheckForPath(await JoinPaths(workingPath, "bunfig.toml"));

        const mainPath = isDeno
            ? (await CheckForPath(await JoinPaths(workingPath, "deno.json"))
                ? await JoinPaths(workingPath, "deno.json")
                : await JoinPaths(workingPath, "package.json"))
            : isBun
            ? (await CheckForPath(await JoinPaths(workingPath, "bunfig.toml"))
                ? await JoinPaths(workingPath, "bunfig.toml")
                : await JoinPaths(workingPath, "package.json"))
            : await JoinPaths(workingPath, "package.json");

        if (isBun) {
            return {
                runtime: "bun",
                manager: "bun",
                lockfile: await JoinPaths(workingPath, "bun.lockb"),
                main: mainPath,
                hall_of_trash: trash,
            };
        }
        if (isDeno) {
            return {
                runtime: "deno",
                manager: "deno",
                lockfile: await JoinPaths(workingPath, "deno.lock"),
                main: mainPath,
                hall_of_trash: trash,
            };
        }

        if (await CheckForPath(await JoinPaths(workingPath, "package.json"))) {
            const manager = await DetectNodeManager(workingPath);
            if (manager && manager.name && manager.file) {
                return {
                    runtime: "node",
                    manager: manager.name,
                    lockfile: await JoinPaths(workingPath, manager.file),
                    main: mainPath,
                    hall_of_trash: trash,
                };
            }
        }

        throw new FknError("Internal__Projects__CantDetermineEnv");
    } catch (e) {
        await GenericErrorHandler(e);
        Deno.exit(1); // (for TS to shut up)
    }
}

/** Utility function to differentiate npm from pnpm from yarn. */
async function DetectNodeManager(workingPath: string): Promise<NodePkgManagerProps | null> {
    if (await CheckForPath(await JoinPaths(workingPath, "package-lock.json"))) return { name: "npm", file: "package-lock.json" };
    if (await CheckForPath(await JoinPaths(workingPath, "pnpm-lock.yaml"))) return { name: "pnpm", file: "pnpm-lock.yaml" };
    if (await CheckForPath(await JoinPaths(workingPath, "yarn.lock"))) return { name: "yarn", file: "yarn.lock" };
    return null;
}

/**
 * Parses a lockfile, differentiating `.yaml` from `.json` files. Unused, (I made it to fix an issue but turns out the fix was different lmao), but keep it here just in case.
 *
 * @export
 * @async
 * @param {string} lockfilePath
 * @returns {Promise<unknown>} Whatever the file returns :)
 */
export async function ParseLockfile(lockfilePath: string): Promise<unknown> {
    const file = await Deno.readTextFile(await ParsePath(lockfilePath));
    if (lockfilePath.includes(".yaml") || lockfilePath.includes(".lock")) {
        return parseYaml(file);
    } else {
        return JSON.parse(file);
    }
}

/**
 * Tries to spot the given project name inside of the project list. If not found, returns null. It also works when you pass a path, parsing it to handle `--self` and relative paths.
 *
 * @export
 * @async
 * @param {string} name
 * @returns {Promise<string | null>}
 */
export async function SpotProject(name: string): Promise<string | null> {
    const allProjects = await GetAllProjects();
    const workingProject = await ParsePath(name);
    if (allProjects.includes(workingProject)) {
        return workingProject;
    }
    for (const project of allProjects) {
        const projectName = await NameProject(project, "name");
        if (name.toLowerCase() === NaturalizeFormattedString(projectName).toLowerCase()) {
            return project; // (assume it's already ParsePath-ed())
        }
    }
    return null;
}
