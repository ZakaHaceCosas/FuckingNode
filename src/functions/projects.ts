import { parse as parseYaml } from "@std/yaml";
import { parse as parseToml } from "@std/toml";
import { expandGlob } from "@std/fs";
import { IGNORE_FILE } from "../constants.ts";
import type { BunfigToml, CONFIG_FILES, DenoPkgJson, FkNodeConfigYaml, NodeManagerUt, NodePkgJson, ProjectEnv } from "../types.ts";
import { CheckForPath, JoinPaths, ParsePath, ParsePathList } from "./filesystem.ts";
import { ColorString, LogStuff } from "./io.ts";
import GenericErrorHandler from "../utils/error.ts";

/**
 * Gets all the users projects and returns their paths as a `string[]`.
 *
 * @export
 * @async
 * @param {false | "limit" | "exclude"} ignored If "limit", only ignored projects are returned. If "exclude", only projects that aren't ignored are returned.
 * @returns {Promise<string[]>} The list of projects.
 */
export async function GetAllProjects(appPaths: CONFIG_FILES, ignored?: false | "limit" | "exclude"): Promise<string[]> {
    try {
        const content = await Deno.readTextFile(appPaths.projects);
        const list = ParsePathList(content);

        if (!ignored) return list;

        const ignoredReturn: string[] = [];
        const aliveReturn: string[] = [];

        for (const entry of list) {
            const protection = await CheckDivineProtection(entry);
            if (!protection) {
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
 * @returns {string} The name of the project. If an error happens, it will return the path you provided (that's how we used to name projects anyway).
 */
export async function NameProject(path: string): Promise<string> {
    const workingPath = await ParsePath(path);
    const formattedPath = ColorString(ColorString(workingPath, "italic"), "half-opaque");

    try {
        const env = await GetProjectEnvironment(workingPath);
        const pkgFilePath = await Deno.readTextFile(env.main);

        if (env.runtime === "node") {
            const packageJson: NodePkgJson = JSON.parse(pkgFilePath);

            if (!packageJson.name) return formattedPath;

            const formattedName = ColorString(packageJson.name, "bold");

            const formattedVersion = packageJson.version ? ColorString(packageJson.version, "purple") : "";

            return `${ColorString(formattedName, "bright-green")} ${formattedVersion} ${formattedPath}`;
        } else if (env.runtime === "deno") {
            const denoJson: DenoPkgJson = JSON.parse(pkgFilePath);

            if (!denoJson.name) return formattedPath;

            const formattedName = ColorString(denoJson.name, "bold");

            const formattedVersion = denoJson.version ? ColorString(denoJson.version, "purple") : "";

            return `${ColorString(formattedName, "bright-blue")} ${formattedVersion} ${formattedPath}`;
        } else if (env.runtime === "bun") {
            const bunToml: BunfigToml = parseYaml(pkgFilePath) as BunfigToml;

            if (!bunToml.name) return formattedPath;

            const formattedName = ColorString(bunToml.name, "bold");

            const formattedVersion = bunToml.version ? ColorString(bunToml.version, "purple") : "";

            return `${ColorString(formattedName, "pink")} ${formattedVersion} ${formattedPath}`;
        }

        return formattedPath; // if it's not possible to name it, just give it the raw path
    } catch {
        return formattedPath; // if it's not possible to name it, just give it the raw path
    }
}

/**
 * Checks if a project is ignored ("protected by divine protection"), and if so, tells you if it's protected from whether cleanups, updates, or both.
 *
 * @export
 * @async
 * @param {string} path Path to the project
 * @returns {Promise<null | "updater" | "cleanup" | "*">} `null` means no ignore and `total` means ignore all. Rest explains itself.
 */
export async function CheckDivineProtection(
    path: string,
): Promise<null | "updater" | "cleanup" | "*"> {
    const workingPath = await ParsePath(path);
    const pathToDivineFile = await JoinPaths(workingPath, IGNORE_FILE);

    if (!(await CheckForPath(pathToDivineFile))) return null;
    const divineContent = await Deno.readTextFile(pathToDivineFile);


    const cleanContent: FkNodeConfigYaml = parseYaml(divineContent) as FkNodeConfigYaml;

    if (!cleanContent.divineProtection) {
        return null; // nothing ofc
    }

    const hasAsterisk = cleanContent.divineProtection.includes("*");
    const hasUpdater = cleanContent.divineProtection.includes("updater");
    const hasCleanup = cleanContent.divineProtection.includes("cleanup");

    if (hasAsterisk) {
        return cleanContent.divineProtection.length > 1 ? null : "*"; // total
        // two asterisks will count as null.
    } else if (hasUpdater && hasCleanup) {
        return "*"; // both = * = total
    } else if (hasUpdater) {
        return "updater"; // just update
    } else if (hasCleanup) {
        return "cleanup"; // just cleanup
    }

    return null; // nothing
}

type ProjectError = "NonExistingPath" | "IsDuplicate" | "IsBun" | "IsCoolDeno" | "NoPkgJson";

/**
 * Given a path to a project, returns `true` if the project is valid, or a message indicating if it's not a valid Node/Deno/Bun project.
 *
 * @async
 * @param {CONFIG_FILES} appPaths Config files.
 * @param {string} entry Path to the project.
 * @param {"node" | "deno" | "bun" | "unknown"} runtime JS runtime the project is on.
 * @returns {Promise<true | ProjectError>} True if it's valid, a `ProjectError` otherwise.
 */
export async function ValidateProject(appPaths: CONFIG_FILES, entry: string): Promise<true | ProjectError> {
    const workingEntry = await ParsePath(entry);
    const list = await GetAllProjects(appPaths);
    const isDuplicate = (list.filter((item) => item === workingEntry).length) > 1;

    const env = await GetProjectEnvironment(workingEntry);

    if (!(await CheckForPath(workingEntry))) {
        return "NonExistingPath";
    }
    if (isDuplicate) {
        return "IsDuplicate";
    }
    if (env.runtime !== "node") {
        if (env.runtime === "bun") {
            // we use bun's lockfile as bun doesn't have its own package file
            // i mean, it has bunfig.toml but it's not often seen
            return "IsBun";
        }
        if (env.runtime === "deno") {
            return "IsCoolDeno"; // cool indeed
        }
        return "NoPkgJson";
    }
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

        throw new Error("Unable to determine project environment.");
    } catch (e) {
        await GenericErrorHandler(e);
        Deno.exit(1); // (for TS to shut up)
    }
}

/** Utility function to differentiate npm from pnpm from yarn. */
async function DetectNodeManager(workingPath: string): Promise<NodeManagerUt | null> {
    if (await CheckForPath(await JoinPaths(workingPath, "package-lock.json"))) return { name: "npm", file: "package-lock.json" };
    if (await CheckForPath(await JoinPaths(workingPath, "pnpm-lock.yaml"))) return { name: "pnpm", file: "pnpm-lock.yaml" };
    if (await CheckForPath(await JoinPaths(workingPath, "yarn.lock"))) return { name: "yarn", file: "yarn.lock" };
    return null;
}
