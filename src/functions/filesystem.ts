import { join } from "@std/path";
import { normalize } from "node:path";
import { LogStuff } from "./io.ts";

/**
 * Returns `true` if a given path exists, `false` if otherwise.
 *
 * @export
 * @async
 * @param {string} path Path to check for
 * @returns {Promise<boolean>}
 */
export async function CheckForPath(path: string): Promise<boolean> {
    try {
        await Deno.stat(path);
        return true;
    } catch {
        return false;
    }
}

interface FileEntry {
    entry: Deno.DirEntry;
    info: Deno.FileInfo;
}

/**
 * Recursively reads a DIR, returning it's data. This SHOULD fix accuracy loss with `stats`.
 *
 * @async
 * @param {string} path
 * @returns {Promise<FileEntry[]>}
 */
async function RecursivelyGetDir(path: string): Promise<FileEntry[]> {
    const workingPath = await ParsePath(path);

    if (!(await CheckForPath(workingPath))) throw new Error("Path doesn't exist");

    const entries: FileEntry[] = [];

    for await (const entry of Deno.readDir(workingPath)) {
        if (entry.isFile) {
            const fileInfo = await Deno.stat(await JoinPaths(workingPath, entry.name));
            entries.push({ entry, info: fileInfo });
        } else if (entry.isDirectory) {
            // Recursively read the directory
            const subEntries = await RecursivelyGetDir(await JoinPaths(workingPath, entry.name));
            entries.push(...subEntries);
        }
    }

    return entries;
}

/**
 * Gets the size in MBs of a DIR.
 *
 * @export
 * @async
 * @param {string} path Path to the directory.
 * @returns {Promise<number>}
 */
export async function GetDirSize(path: string): Promise<number> {
    try {
        let totalSize: number = 0;

        const workingPath = await ParsePath(path);

        if (!(await CheckForPath(workingPath))) {
            throw new Error(`Provided path ${path} doesn't exist.`);
        }

        const entries = await RecursivelyGetDir(workingPath);

        // process all entries in parallel
        const sizePromises = entries.map(async ({ entry }) => {
            const fullPath = await JoinPaths(workingPath, entry.name);
            try {
                const pathInfo = await Deno.stat(fullPath);
                if (pathInfo.isFile) {
                    return pathInfo.size; // increases the size
                } else if (pathInfo.isDirectory) {
                    return await GetDirSize(fullPath); // if the entry happens to be another DIR, recursively analyze it
                } else {
                    return pathInfo.size; // just try anyway
                }
            } catch (_e) {
                // we should ignore this as logging ALL of these filesystem errors
                // will cause the user a storage issue
                // await LogStuff("Error: " + e, "error");
                return 0; // ignore errors an continue
            }
        });

        const sizes = await Promise.all(sizePromises);

        totalSize = sizes.reduce((acc, size) => acc + size, 0);

        return ConvertBytesToMegaBytes(totalSize, false); // (returns in MB)
    } catch (e) {
        await LogStuff(`Error: ${e}`, "error");
        return 0;
    }
}

/**
 * Parses a string path, to ensure string cleanness and handle things like relative paths or `--self`.
 *
 * @export
 * @param {string} target The string to parse.
 * @returns {(string)} A string with the parsed path.
 */
export async function ParsePath(target: string): Promise<string> {
    try {
        if (typeof target !== "string") {
            throw new Error("Target must be (obviously) a string.");
        }

        let workingTarget = target.trim();
        if (workingTarget.toLowerCase() === "--self") {
            workingTarget = Deno.cwd();
        } else {
            try {
                workingTarget = await Deno.realPath(workingTarget);
            } catch {
                workingTarget;
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
 * Parses a string of a lot of file paths separated by commands, and returns them as an array of individual paths.
 *
 * @export
 * @param {string} target The string to parse.
 * @returns {string[]} Your `string[]`.
 */
export function ParsePathList(target: string): string[] {
    if (typeof target !== "string") {
        throw new Error("Target must be (obviously) a string.");
    }

    const workingTarget = target.trim();
    const allTargets = workingTarget
        .split("\n")
        .map((line) => line.trim().replace(/,$/, ""))
        .filter((line) => line.length > 0);

    return allTargets.map(normalize);
}

/**
 * Joins two parts of a file path. If they cannot be found, you'll be given back an unparsed join.
 *
 * @export
 * @param {string} pathA First part, e.g. "./my/beginning".
 * @param {string} pathB Second part, e.g. "my/end.txt".
 * @returns {string} Result, e.g. "my/beginning/my/end.txt".
 */
export async function JoinPaths(pathA: string, pathB: string): Promise<string> {
    try {
        const firstPart = await ParsePath(pathA);
        const secondPath = pathB.trim();
        return join(firstPart, secondPath);
    } catch {
        return join(pathA, pathB);
    }
}

/**
 * Converts bytes to MB (or KB).
 *
 * @export
 * @param {(number | number[])} size Either one or many byte values.
 * @param {(boolean | "force")} useKbIfLow If false, MB are used, if "force" KB is used. If true, MB are used unless MB value is lower than 0.5, using KB instead.
 * @param {?number} [precision] Optional, what the `parseFloat(N)` _N_ should be. Defaults to two.
 * @returns {number}
 */
export function ConvertBytesToMegaBytes(size: number | number[], useKbIfLow: boolean | "force", precision?: number): number {
    const realPrecision = precision || 2;
    let totalVal: number = 0;

    if (typeof size === "number") {
        totalVal = size;
    } else {
        size.forEach((val) => {
            totalVal += val;
        });
    }

    const sizeInMB = totalVal / (1024 * 1024); // Convert to MB

    if (((useKbIfLow === true) && sizeInMB < 0.5) || useKbIfLow === "force") {
        return parseFloat((sizeInMB * 1024).toFixed(realPrecision)); // Convert to KB
    }

    return parseFloat(sizeInMB.toFixed(realPrecision)); // Return in MB
}
