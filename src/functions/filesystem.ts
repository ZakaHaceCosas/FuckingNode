import { join, normalize } from "@std/path";
import { StringUtils, type UnknownString } from "@zakahacecosas/string-utils";
import { DEBUG_LOG } from "./error.ts";

/**
 * Returns `true` if a given path exists, `false` if otherwise.
 *
 * @export
 * @param {string} path Path to check for
 * @returns {boolean}
 */
export function CheckForPath(path: string): boolean {
    try {
        Deno.statSync(path);
        return true;
    } catch {
        return false;
    }
}

/**
 * Checks for a directory, returns a string depending on the result.
 *
 * @export
 * @async
 * @param {string} path
 */
export async function CheckForDir(path: string): Promise<
    "NotDir" | "Valid" | "ValidButNotEmpty" | "NotFound"
> {
    try {
        const info = await Deno.stat(path);
        if (!info.isDirectory) return "NotDir";
        for await (const _ of Deno.readDir(path)) {
            // If we find a single entry, it's not empty.
            return "ValidButNotEmpty";
        }
        return "Valid";
    } catch (e) {
        if (e instanceof Deno.errors.NotFound) {
            return "NotFound"; // path doesn't exist.
        } else {
            throw e; // unexpected sh*t happened
        }
    }
}

/**
 * Parses a string path, to ensure string cleanness and handle things like relative paths or `--self`.
 *
 * @export
 * @param {UnknownString} target The string to parse.
 * @returns {Promise<string>} A string with the parsed path.
 */
export function ParsePath(target: UnknownString): string {
    try {
        if (!StringUtils.validate(target)) throw new Error("Target must be (obviously) a string.");

        let workingTarget = target.trim();
        if (workingTarget.toLowerCase() === "--self") {
            workingTarget = Deno.cwd();
        } else {
            try {
                workingTarget = Deno.realPathSync(workingTarget);
            } catch {
                // this NEEDS to be here for it to work
            }
        }

        const cleanEntry = normalize(workingTarget);

        if (cleanEntry.endsWith("/") || cleanEntry.endsWith("\\")) {
            return cleanEntry.slice(0, -1);
        }

        return cleanEntry;
    } catch (e) {
        throw new Error(`Error parsing ${target}: ${e}`);
    }
}

/**
 * Parses a string of a lot of file paths separated by newlines or commas, and returns them as an array of individual paths.
 *
 * @export
 * @param {UnknownString} target The string to parse.
 * @returns {string[]} Your `string[]`.
 */
export function ParsePathList(target: UnknownString): string[] {
    DEBUG_LOG(target);
    if (!StringUtils.validate(target)) return [];

    return StringUtils
        .sortAlphabetically(
            StringUtils
                .kominator(target, "\n")
                .map((line) => line.trim().replace(/,$/, ""))
                .filter((line) => line.length > 0)
                .map(ParsePath),
        );
}

/**
 * Joins two parts of a file path. If they cannot be found, you'll be given back an unparsed join.
 *
 * @export
 * @param {string} pathA First part, e.g. "./my/beginning".
 * @param {string} pathB Second part, e.g. "my/end.txt".
 * @returns {string} Result, e.g. "./my/beginning/my/end.txt".
 */
export function JoinPaths(pathA: string, pathB: string): string {
    try {
        const firstPart = ParsePath(pathA);
        const secondPath = pathB.trim();
        return join(firstPart, secondPath);
    } catch {
        return join(pathA, pathB);
    }
}

/**
 * Takes an array of paths and removes all of them, with recursive removal enabled.
 *
 * @export
 * @async
 * @param {string[]} files Array of file paths to remove
 * @returns {Promise<void>}
 */
export async function BulkRemoveFiles(files: string[]): Promise<void> {
    if (files.length === 0) return;
    await Promise.all(files.map(async (file) => {
        await Deno.remove(ParsePath(file), {
            recursive: true,
        });
    }));
}
