import { parse as parseYaml } from "@std/yaml";
import { parse as parseToml } from "@std/toml";
import { parse as parseJsonc } from "@std/jsonc";
import { expandGlob } from "@std/fs";
import { APP_NAME, APP_URLs, DEFAULT_FKNODE_YAML, I_LIKE_JS, IGNORE_FILE } from "../constants.ts";
import type { CargoPkgFile, NodePkgFile, ProjectEnvironment } from "../types/platform.ts";
import { CheckForPath, JoinPaths, ParsePath, ParsePathList } from "./filesystem.ts";
import { ColorString, LogStuff } from "./io.ts";
import { FknError } from "../utils/error.ts";
import { type FkNodeYaml, ValidateFkNodeYaml } from "../types/config_files.ts";
import { GetAppPath } from "./config.ts";
import { GetDateNow } from "./date.ts";
import type { PROJECT_ERROR_CODES } from "../types/errors.ts";
import { FkNodeInterop } from "../commands/interop/interop.ts";
import type { tValidColors } from "../types/misc.ts";
import { Git } from "../utils/git.ts";
import { internalGolangRequireLikeStringParser } from "../commands/interop/parse-module.ts";
import { StringUtils, type UnknownString } from "@zakahacecosas/string-utils";
import { RemoveProject } from "../commands/manage.ts";

/**
 * Gets all the users projects and returns their absolute root paths as a `string[]`.
 *
 * @export
 * @async
 * @param {false | "limit" | "exclude"} ignored If "limit", only ignored projects are returned. If "exclude", only projects that aren't ignored are returned.
 * @returns {Promise<string[]>} The list of projects.
 */
export async function GetAllProjects(ignored?: false | "limit" | "exclude"): Promise<string[]> {
    const content = await Deno.readTextFile(await GetAppPath("MOTHERFKRS"));
    const list = ParsePathList(content);
    const cleanList = list.filter(async (p) => await CheckForPath(p) === true);

    if (!ignored) return cleanList;

    const ignoredReturn: string[] = [];
    const aliveReturn: string[] = [];

    for (const entry of cleanList) {
        const protection = (await GetProjectSettings(entry)).divineProtection;
        if (!protection || protection === "disabled") {
            if (ignored === "exclude") aliveReturn.push(entry);
            continue;
        }
        if (ignored === "limit") ignoredReturn.push(entry);
    }

    if (ignored === "limit") return ignoredReturn;
    if (ignored === "exclude") return aliveReturn;

    return cleanList;
}

/**
 * Given a path to a project, returns it's name.
 *
 * @export
 * @param {string} path Path to the **root** of the project.
 * @param {?"name" | "name-colorless" | "path" | "name-ver" | "all"} wanted What to return. `name` returns the name, `path` the file path, `name-ver` a `name@version` string, and `all` returns everything together.
 * @returns {string} The name of the project. If an error happens, it will return the path you provided (that's how we used to name projects anyway).
 */
export async function NameProject(path: string, wanted?: "name" | "name-colorless" | "path" | "name-ver" | "all"): Promise<string> {
    const workingPath = await ParsePath(path);
    const formattedPath = ColorString(workingPath, "italic", "half-opaque");

    try {
        const exists = await CheckForPath(workingPath);
        if (!exists) throw new Error("(path doesn't exist, this won't be shown and the formatted path will be returned instead)");
        const env = await GetProjectEnvironment(workingPath);

        let runtimeColor: tValidColors;
        switch (env.runtime) {
            case "bun":
                runtimeColor = "pink";
                break;
            case "node":
                runtimeColor = "bright-green";
                break;
            case "deno":
                runtimeColor = "bright-blue";
                break;
            case "rust":
                runtimeColor = "orange";
                break;
            case "golang":
                runtimeColor = "cyan";
                break;
        }

        const pkgFile = env.main.cpfContent;

        if (!pkgFile.name) return formattedPath;

        const formattedName = ColorString(pkgFile.name, "bold");

        const formattedVersion = pkgFile.version ? `@${ColorString(pkgFile.version, "purple")}` : "";

        const formattedNameVer = `${ColorString(formattedName, runtimeColor)}${formattedVersion}`;

        const fullNamedProject = `${formattedNameVer} ${formattedPath}`;

        switch (wanted) {
            case "all":
                return fullNamedProject;
            case "name":
                return formattedName;
            case "name-colorless":
                return pkgFile.name;
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
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(
    // deno-lint-ignore no-explicit-any
    item: any,
): boolean {
    return (item && typeof item === "object" && !Array.isArray(item));
}

/**
 * Deep merge two objects. Not my code, from https://stackoverflow.com/a/34749873.
 */
export function deepMerge(
    // deno-lint-ignore no-explicit-any
    target: any,
    // deno-lint-ignore no-explicit-any
    ...sources: any[]
) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return deepMerge(target, ...sources);
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
    const divineContent = parseYaml(await Deno.readTextFile(pathToDivineFile));

    if (!ValidateFkNodeYaml(divineContent)) {
        await LogStuff(`${await NameProject(path)} has an invalid ${IGNORE_FILE}!`, "warn");
        await Deno.writeTextFile(
            pathToDivineFile,
            `\n# [NOTE (${GetDateNow()}): Invalid file format! (Auto-added by ${APP_NAME.CASED}). DEFAULT SETTINGS WILL BE USED UPON INTERACTING WITH THIS ${I_LIKE_JS.MF.toUpperCase()} UNTIL YOU FIX THIS! Refer to ${APP_URLs.WEBSITE} to learn about how fknode.yaml works.]\n`,
            {
                append: true,
            },
        );
        return DEFAULT_FKNODE_YAML;
    }

    // now with this setting keys should be always present, i think?
    // idk, but im honestly considering re-doing the system from scratch
    return deepMerge(DEFAULT_FKNODE_YAML, divineContent);
}

/**
 * Wraps a bunch of functions to easily work around with fknode.yaml. See each function's JSDoc to see what they do.
 */
export const UnderstandProjectSettings = {
    /**
     * Tells you about the protection of a project. Returns an object where `true` means allowed and `false` means protected.
     */
    protection: (settings: FkNodeYaml, options: {
        update: boolean;
        prettify: boolean;
        lint: boolean;
        destroy: boolean;
    }) => {
        const protection = StringUtils.normalizeArray(
            Array.isArray(settings.divineProtection) ? settings.divineProtection : [settings.divineProtection],
        );

        if (!StringUtils.validate(protection[0]) || protection[0] === "disabled") {
            return {
                doClean: true,
                doUpdate: options.update,
                doPrettify: options.prettify,
                doLint: options.lint,
                doDestroy: options.destroy,
            };
        } else if (protection[0] === "*") {
            return {
                doClean: false,
                doUpdate: false,
                doPrettify: false,
                doLint: false,
                doDestroy: false,
            };
        } else {
            return {
                doClean: protection.includes("cleaner") ? false : true,
                doUpdate: protection.includes("updater") ? false : options.update,
                doPrettify: protection.includes("prettifier") ? false : options.prettify,
                doLint: protection.includes("linter") ? false : options.lint,
                doDestroy: protection.includes("destroyer") ? false : options.destroy,
            };
        }
    },
};

/**
 * Given a path to a project, returns `true` if the project is valid, or a message indicating if it's not a valid Node/Deno/Bun project.
 *
 * @async
 * @param {string} entry Path to the project.
 * @param {boolean} existing True if you're validating an existing project, false if it's a new one to be added.
 * @returns {Promise<true | PROJECT_ERROR_CODES>} True if it's valid, a `PROJECT_ERROR_CODES` otherwise.
 */
export async function ValidateProject(entry: string, existing: boolean): Promise<true | PROJECT_ERROR_CODES> {
    const workingEntry = await ParsePath(entry);
    if (!(await CheckForPath(workingEntry))) return "NotFound";

    try {
        await GetProjectEnvironment(workingEntry);
    } catch {
        return "CantDetermineEnv";
    }

    const env = await GetProjectEnvironment(workingEntry);

    if (!(await CheckForPath(env.main.path))) return "NoPkgJson";
    const list = await GetAllProjects();
    const isDuplicate = (list.filter((item) => item.trim() === workingEntry.trim()).length) > (existing === true ? 1 : 0);

    if (isDuplicate) return "IsDuplicate";
    if (!(await CheckForPath(env.lockfile.path))) return "NoLockfile";
    return true;
}

/**
 * Checks for workspaces within a Node, Bun, or Deno project, supporting package.json, pnpm-workspace.yaml, .yarnrc.yml, and bunfig.toml.
 *
 * @async
 * @param {string} path Path to the root of the project.
 * @returns {Promise<string[]>}
 */
export async function GetWorkspaces(path: string): Promise<string[]> {
    try {
        const workingPath: string = await ParsePath(path);

        if (!(await CheckForPath(workingPath))) throw new Error("Requested path doesn't exist.");

        const workspacePaths: string[] = [];

        // Check package.json for Node, npm, and yarn (and Bun workspaces).
        const packageJsonPath = await JoinPaths(workingPath, "package.json");
        if (await CheckForPath(packageJsonPath)) {
            const pkgJson: NodePkgFile = JSON.parse(await Deno.readTextFile(packageJsonPath));
            if (pkgJson.workspaces) {
                const pkgWorkspaces = Array.isArray(pkgJson.workspaces) ? pkgJson.workspaces : pkgJson.workspaces?.packages || [];
                workspacePaths.push(...pkgWorkspaces);
            }
        }

        // Check pnpm-workspace.yaml for pnpm workspaces
        const pnpmWorkspacePath = await JoinPaths(workingPath, "pnpm-workspace.yaml");
        if (await CheckForPath(pnpmWorkspacePath)) {
            const pnpmConfig = parseYaml(await Deno.readTextFile(pnpmWorkspacePath)) as { packages: string[] };
            if (pnpmConfig.packages && Array.isArray(pnpmConfig.packages)) workspacePaths.push(...pnpmConfig.packages);
        }

        // Check .yarnrc.yml for Yarn workspaces
        const yarnRcPath = await JoinPaths(workingPath, ".yarnrc.yml");
        if (await CheckForPath(yarnRcPath)) {
            const yarnConfig = parseYaml(await Deno.readTextFile(yarnRcPath)) as { workspaces?: string[] };
            if (yarnConfig.workspaces && Array.isArray(yarnConfig.workspaces)) workspacePaths.push(...yarnConfig.workspaces);
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
            const denoConfig = (await CheckForPath(denoJsoncPath)) ? parseJsonc(await Deno.readTextFile(denoJsoncPath)) : JSON.parse(
                await Deno.readTextFile(
                    denoJsonPath,
                ),
            );
            if (denoConfig.workspace && Array.isArray(denoConfig.workspace)) {
                for (const member of denoConfig.workspace) {
                    const memberPath = await JoinPaths(workingPath, member);
                    workspacePaths.push(memberPath);
                }
            }
        }

        // Check for Cargo configuration (cargo.toml)
        const cargoTomlPath = await JoinPaths(workingPath, "cargo.toml");
        if (await CheckForPath(cargoTomlPath)) {
            const cargoToml = parseToml(await Deno.readTextFile(cargoTomlPath)) as unknown as CargoPkgFile;
            if (cargoToml.workspace && Array.isArray(cargoToml.workspace.members)) workspacePaths.push(...cargoToml.workspace.members);
        }

        // Check for Golang configuration (go.work)
        const goWorkPath = await JoinPaths(workingPath, "go.work");
        if (await CheckForPath(goWorkPath)) {
            const goWork = internalGolangRequireLikeStringParser((await Deno.readTextFile(goWorkPath)).split("\n"), "use");
            if (goWork.length > 0) workspacePaths.push(...goWork.filter((s) => !["(", ")"].includes(StringUtils.normalize(s))));
        }

        if (workspacePaths.length === 0) return [];

        const absoluteWorkspaces: string[] = [];

        for (const workspacePath of workspacePaths) {
            const fullPath = await JoinPaths(workingPath, workspacePath);
            if (!(await CheckForPath(fullPath))) continue;
            for await (const dir of expandGlob(fullPath)) {
                if (dir.isDirectory) {
                    absoluteWorkspaces.push(dir.path);
                }
            }
        }

        return absoluteWorkspaces;
    } catch (e) {
        await LogStuff(`Error looking for workspaces: ${e}`, "error");
        return [];
    }
}

/**
 * Returns a project's environment (package manager, JS runtime, and paths to lockfile and `node_modules`).
 *
 * @export
 * @async
 * @param {string} path Path to the project's root.
 * @returns {Promise<ProjectEnvironment>}
 */
export async function GetProjectEnvironment(path: string): Promise<ProjectEnvironment> {
    const workingPath = await ParsePath(path);

    if (!(await CheckForPath(workingPath))) {
        throw new FknError(
            "Internal__Projects__CantDetermineEnv",
            `Path ${workingPath} doesn't exist.`,
        );
    }

    const trash = await JoinPaths(workingPath, "node_modules");
    const workspaces = await GetWorkspaces(workingPath) || [];

    const paths = {
        deno: {
            json: await JoinPaths(workingPath, "deno.json"),
            jsonc: await JoinPaths(workingPath, "deno.jsonc"),
            lock: await JoinPaths(workingPath, "deno.lock"),
        },
        bun: {
            toml: await JoinPaths(workingPath, "bunfig.toml"),
            lock: await JoinPaths(workingPath, "bun.lock"),
            lockb: await JoinPaths(workingPath, "bun.lockb"),
        },
        node: {
            json: await JoinPaths(workingPath, "package.json"),
            lockNpm: await JoinPaths(workingPath, "package-lock.json"),
            lockPnpm: await JoinPaths(workingPath, "pnpm-lock.yaml"),
            lockYarn: await JoinPaths(workingPath, "yarn.lock"),
        },
        golang: {
            pkg: await JoinPaths(workingPath, "go.mod"),
            lock: await JoinPaths(workingPath, "go.sum"),
        },
        rust: {
            pkg: await JoinPaths(workingPath, "cargo.toml"),
            lock: await JoinPaths(workingPath, "cargo.lock"),
        },
    };

    const pathChecks = {
        deno: {
            json: await CheckForPath(paths.deno.json),
            jsonc: await CheckForPath(paths.deno.jsonc),
            lock: await CheckForPath(paths.deno.lock),
        },
        bun: {
            toml: await CheckForPath(paths.bun.toml),
            lock: await CheckForPath(paths.bun.lock),
            lockb: await CheckForPath(paths.bun.lockb),
        },
        node: {
            json: await CheckForPath(paths.node.json),
            lockNpm: await CheckForPath(paths.node.lockNpm),
            lockPnpm: await CheckForPath(paths.node.lockPnpm),
            lockYarn: await CheckForPath(paths.node.lockYarn),
        },
        golang: {
            pkg: await CheckForPath(paths.golang.pkg),
            lock: await CheckForPath(paths.golang.lock),
        },
        rust: {
            pkg: await CheckForPath(paths.rust.pkg),
            lock: await CheckForPath(paths.rust.lock),
        },
    };

    const isGolang = pathChecks.golang.pkg || pathChecks.golang.lock;
    const isRust = pathChecks.rust.pkg || pathChecks.rust.lock;
    const isDeno = pathChecks.deno.lock ||
        pathChecks.deno.json ||
        pathChecks.deno.jsonc;
    const isBun = pathChecks.bun.lock ||
        pathChecks.bun.lockb ||
        pathChecks.bun.toml;
    const isNode = pathChecks.node.lockNpm ||
        pathChecks.node.lockPnpm ||
        pathChecks.node.lockYarn;

    if (!pathChecks.node.json && !pathChecks.deno.json && !pathChecks.bun.toml && !pathChecks.golang.pkg && !pathChecks.rust.pkg) {
        throw new FknError(
            "Internal__Projects__CantDetermineEnv",
            `No main file present (package.json, deno.json, cargo.toml...) at ${ColorString(path, "bold")}.`,
        );
    }

    if (!isNode && !isBun && !isDeno && !isGolang && !isRust) {
        throw new FknError(
            "Internal__Projects__CantDetermineEnv",
            `No lockfile present (required for the project to work) at ${ColorString(path, "bold")}.`,
        );
    }

    const mainPath = isGolang
        ? paths.golang.pkg
        : isRust
        ? paths.rust.pkg
        : isDeno
        ? pathChecks.deno.jsonc ? paths.deno.jsonc : pathChecks.deno.json ? paths.deno.json : paths.node.json
        : paths.node.json;

    const mainString: string = await Deno.readTextFile(mainPath);

    const { PackageFileParsers } = FkNodeInterop;

    if (isGolang) {
        return {
            root: workingPath,
            main: {
                path: mainPath,
                name: "go.mod",
                stdContent: PackageFileParsers.Golang.STD(mainString),
                cpfContent: PackageFileParsers.Golang.CPF(mainString, await Git.GetLatestTag(workingPath), workspaces),
            },
            lockfile: {
                name: "go.sum",
                path: paths.golang.lock,
            },
            runtime: "golang",
            manager: "go",
            commands: {
                base: "go",
                exec: ["go", "run"],
                update: ["get", "-u", "all"],
                clean: [["clean"], ["mod", "tidy"]],
                run: "__UNSUPPORTED",
                audit: "__UNSUPPORTED", // i thought it was vet
                publish: "__UNSUPPORTED", // ["test", "./..."]
            },
            workspaces,
        };
    }
    if (isRust) {
        return {
            root: workingPath,
            main: {
                path: mainPath,
                name: "cargo.toml",
                stdContent: PackageFileParsers.Cargo.STD(mainString),
                cpfContent: PackageFileParsers.Cargo.CPF(mainString, workspaces),
            },
            lockfile: {
                name: "cargo.lock",
                path: paths.rust.lock,
            },
            runtime: "rust",
            manager: "cargo",
            commands: {
                base: "cargo",
                exec: ["cargo", "run"],
                update: ["update"],
                clean: [["clean"]],
                run: "__UNSUPPORTED",
                audit: "__UNSUPPORTED", // ["audit"]
                publish: "__UNSUPPORTED", // ["publish"],
            },
            workspaces,
        };
    }
    if (isBun) {
        return {
            root: workingPath,
            main: {
                path: mainPath,
                name: "package.json",
                stdContent: PackageFileParsers.NodeBun.STD(mainString),
                cpfContent: PackageFileParsers.NodeBun.CPF(mainString, "bun", workspaces),
            },
            lockfile: {
                name: pathChecks.bun.lockb ? "bun.lockb" : "bun.lock",
                path: paths.bun.lock,
            },
            runtime: "bun",
            manager: "bun",
            hall_of_trash: trash,
            commands: {
                base: "bun",
                exec: ["bunx"],
                update: ["update", "--save-text-lockfile"],
                clean: "__UNSUPPORTED",
                run: ["bun", "run"],
                audit: "__UNSUPPORTED",
                publish: ["publish"],
            },
            workspaces,
        };
    }
    if (isDeno) {
        return {
            main: {
                path: mainPath,
                name: pathChecks.deno.jsonc ? "deno.jsonc" : "deno.json",
                stdContent: PackageFileParsers.Deno.STD(mainString),
                cpfContent: PackageFileParsers.Deno.CPF(mainString, workspaces),
            },
            lockfile: {
                name: "deno.lock",
                path: paths.deno.lock,
            },
            runtime: "deno",
            manager: "deno",
            hall_of_trash: trash,
            root: workingPath,
            commands: {
                base: "deno",
                exec: ["deno", "run"],
                update: ["outdated", "--update"],
                clean: "__UNSUPPORTED",
                run: ["deno", "task"],
                audit: "__UNSUPPORTED",
                publish: ["publish", "--check=all"],
            },
            workspaces,
        };
    }
    if (pathChecks.node.lockYarn) {
        return {
            main: {
                path: mainPath,
                name: "package.json",
                stdContent: parseJsonc(mainString) as NodePkgFile,
                cpfContent: PackageFileParsers.NodeBun.CPF(mainString, "yarn", workspaces),
            },
            lockfile: {
                name: "yarn.lock",
                path: paths.node.lockYarn,
            },
            runtime: "node",
            manager: "yarn",
            hall_of_trash: trash,
            root: workingPath,
            commands: {
                base: "yarn",
                exec: ["yarn", "dlx"],
                update: ["upgrade"],
                clean: [["autoclean", "--force"]],
                run: ["yarn", "run"],
                audit: ["audit", "--recursive", "--all"],
                publish: ["publish", "--non-interactive"],
            },
            workspaces,
        };
    }
    if (pathChecks.node.lockPnpm) {
        return {
            main: {
                path: mainPath,
                name: "package.json",
                stdContent: PackageFileParsers.NodeBun.STD(mainString),
                cpfContent: PackageFileParsers.NodeBun.CPF(mainString, "pnpm", workspaces),
            },
            lockfile: {
                name: "pnpm-lock.yaml",
                path: paths.node.lockPnpm,
            },
            runtime: "node",
            manager: "pnpm",
            hall_of_trash: trash,
            root: workingPath,
            commands: {
                base: "pnpm",
                exec: ["pnpm", "dlx"],
                update: ["update"],
                clean: [["dedupe"], ["prune"]],
                run: ["pnpm", "run"],
                audit: ["audit", "--ignore-registry-errors"],
                publish: ["publish"],
            },
            workspaces,
        };
    }
    if (pathChecks.node.lockNpm) {
        return {
            main: {
                path: mainPath,
                name: "package.json",
                stdContent: PackageFileParsers.NodeBun.STD(mainString),
                cpfContent: PackageFileParsers.NodeBun.CPF(mainString, "npm", workspaces),
            },
            lockfile: {
                name: "package-lock.json",
                path: paths.node.lockNpm,
            },
            runtime: "node",
            manager: "npm",
            hall_of_trash: trash,
            root: workingPath,
            commands: {
                base: "npm",
                exec: ["npx"],
                update: ["update"],
                clean: [["dedupe"], ["prune"]],
                run: ["npm", "run"],
                audit: ["audit"],
                publish: ["publish"],
            },
            workspaces,
        };
    }

    throw new FknError(
        "Internal__Projects__CantDetermineEnv",
        `Unknown reason. Happened with ${ColorString(path, "bold")}.`,
    );
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
 * Tries to spot the given project name inside of the project list, returning its root path. If not found, throws an error. It also works when you pass a path, parsing it to handle `--self` and relative paths.
 *
 * @export
 * @async
 * @param {UnknownString} name Project's name, path, or `--self`.
 * @returns {Promise<string>}
 */
export async function SpotProject(name: UnknownString): Promise<string> {
    if (!StringUtils.validate(name) || !name) {
        throw new FknError(
            "Manager__ProjectInteractionInvalidCauseNoPathProvided",
            `Either didn't provide a project name / path or the CLI failed internally somewhere`,
        );
    }

    const workingProject = await ParsePath(name);
    const allProjects = await GetAllProjects();
    if (allProjects.includes(workingProject)) {
        return workingProject;
    }

    const toSpot = StringUtils.normalize(name, false, true);

    for (const project of allProjects) {
        const projectName = StringUtils.normalize(
            await NameProject(project, "name-colorless"),
            false,
            true,
        );
        if (toSpot === projectName) {
            return project;
        }
    }

    if (await CheckForPath(workingProject)) {
        throw new FknError(
            "Generic__NonFoundProject",
            `'${name.trim()}' (=> '${toSpot}') exists but is not an added project.`,
        );
    } else {
        throw new FknError("Generic__NonFoundProject", `'${name.trim()}' (=> '${toSpot}') does not exist.`);
    }
}

/**
 * Cleans up projects that are invalid and probably we won't be able to clean.
 *
 * @export
 * @async
 * @returns {Promise<0 | 1 | 2>} 0 if success, 1 if no projects to remove, ~~2 if the user doesn't remove them~~.
 */
export async function CleanupProjects(): Promise<0 | 1> {
    const listOfRemovals: { project: string; issue: PROJECT_ERROR_CODES }[] = [];

    for (const project of (await GetAllProjects())) {
        const validation = await ValidateProject(project, true);
        if (validation !== true) listOfRemovals.push({ project: project, issue: validation });
    }

    // remove duplicates
    const result = Array.from(
        new Map(
            listOfRemovals.map((item) => [JSON.stringify(item), item]), // make it a string so we can actually compare it's values
        ).values(),
    );

    if (result.length === 0) return 1;

    for (const target of result) await RemoveProject(target.project, true);

    return 0;
}
