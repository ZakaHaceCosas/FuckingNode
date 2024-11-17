import { parse as parseYaml } from "@std/yaml";
import { parse as parseToml } from "@std/toml";
import { expandGlob } from "@std/fs";
import { IGNORE_FILE } from "../constants.ts";
import { CONFIG_FILES, DenoPkgJson, type NodePkgJson } from "../types.ts";
import { CheckForPath, JoinPaths, ParsePath, ParsePathList } from "./filesystem.ts";
import { ColorString, LogStuff } from "./io.ts";

/**
 * Gets all the users projects and returns their paths as a `string[]`.
 *
 * @export
 * @async
 * @returns {Promise<string[]>}
 */
export async function GetAllProjects(appPaths: CONFIG_FILES): Promise<string[]> {
    try {
        const content = await Deno.readTextFile(appPaths.projects);
        return ParsePathList(content);
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
 * @param {string} path Path to the **root**.
 * @returns {string} The name of the project. If an error happens, it will return the path you provided (that's how we used to name projects anyway).
 */
export async function NameProject(path: string): Promise<string> {
    const formattedPath = ColorString(ColorString(await ParsePath(path), "italic"), "half-opaque");

    try {
        const nodePkgJsonPath = await JoinPaths(path, "package.json"); // bun also uses package.json (and also bunfig.toml but im lazy for that)
        const denoPkgJsonPath = await JoinPaths(path, "deno.json");

        const isNode = await CheckForPath(nodePkgJsonPath);
        const isDeno = await CheckForPath(denoPkgJsonPath);

        if (isNode) {
            const packageJson: NodePkgJson = JSON.parse(await Deno.readTextFile(nodePkgJsonPath));

            if (!packageJson.name) return formattedPath;

            return `${ColorString(ColorString(packageJson.name, "bold"), "bright-green")} ${formattedPath}`;
        } else if (isDeno) {
            const denoJson: DenoPkgJson = JSON.parse(await Deno.readTextFile(nodePkgJsonPath));

            if (!denoJson.name) return formattedPath;

            return `${ColorString(ColorString(denoJson.name, "bold"), "bright-blue")} ${formattedPath}`;
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
    const divineContent = new TextDecoder().decode(
        await Deno.readFile(pathToDivineFile),
    );
    const cleanContent = divineContent
        .split("\n") // split in lines
        .filter((line) => !line.trim().startsWith("--!")) // allow comments, beginning with --!
        .join(" ") // join into a single string
        .trim(); // trim

    const hasUpdater = /updater\.?/i.test(cleanContent);
    const hasCleanup = /cleanup\.?/i.test(cleanContent);

    if (
        (hasUpdater && hasCleanup) ||
        cleanContent === "*" ||
        cleanContent === ""
    ) {
        return "*"; // total
        // empty files or an asterisk count as total.
        // two asterisks will count as null.
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

    const pivotNode = await CheckForPath(await JoinPaths(workingEntry, "package.json"));
    const pivotDeno = await CheckForPath(await JoinPaths(workingEntry, "deno.json"));
    const pivotBun = await CheckForPath(await JoinPaths(workingEntry, "bun.lockb"));

    if (!(await CheckForPath(workingEntry))) {
        return "NonExistingPath";
    }
    if (isDuplicate) {
        return "IsDuplicate";
    }
    if (!pivotNode) {
        if (pivotBun) {
            // we use bun's lockfile as bun doesn't have its own package file
            // i mean, it has bunfig.toml but it's not often seen
            return "IsBun";
        }
        if (pivotDeno) {
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
