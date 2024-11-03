import { IGNORE_FILE } from "../constants.ts";
import { CONFIG_FILES, type PkgJson } from "../types.ts";
import { CheckForPath, JoinPaths, ParsePath, ParsePathList } from "./filesystem.ts";
import { LogStuff } from "./io.ts";

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
    const pkgJsonPath = await JoinPaths(path, "package.json");

    if (!(await CheckForPath(pkgJsonPath))) return await ParsePath(path);

    const packageJson: PkgJson = JSON.parse(await Deno.readTextFile(pkgJsonPath));

    return packageJson.name ?? await ParsePath(path);
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
