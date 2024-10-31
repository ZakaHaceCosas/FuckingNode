import { type PkgJson } from "../types.ts";
import { GetAppPath } from "./config.ts";
import { CheckForPath, JoinPaths, ParsePath, ParsePathList } from "./filesystem.ts";
import { LogStuff } from "./io.ts";

/**
 * Gets all the users projects and returns their paths as a `string[]`.
 *
 * @export
 * @async
 * @returns {Promise<string[]>}
 */
export async function GetAllProjects(): Promise<string[]> {
    try {
        const content = await Deno.readTextFile(await GetAppPath("MOTHERFKRS"));
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
