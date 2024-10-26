import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
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
    const workingPath = await ParsePath("path", path) as string;

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

        const workingPath = await ParsePath("path", path) as string;

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

        return parseFloat((totalSize / (1024 * 1024)).toFixed(2)); // (returns in MB)
    } catch (e) {
        await LogStuff(`Error: ${e}`, "error");
        return 0;
    }
}

/**
 * Parses a string with either a single path (path) or a lot of paths (cleaner), to ensure string cleanness.
 *
 * @export
 * @param {("path" | "cleaner")} idea What kind of parsing you'd like
 * @param {string} target The string to parse.
 * @returns {(string | string[])} Either a string or a string[].
 */
export async function ParsePath(idea: "path" | "cleaner", target: string): Promise<string | string[]> {
    if (typeof target !== "string") {
        throw new Error("Target must be (obviously) a string.");
    }

    let workingTarget = target.trim();
    if (workingTarget.toLowerCase() === "--self") {
        workingTarget = Deno.cwd();
    } else {
        workingTarget = await Deno.realPath(workingTarget);
    }

    if (idea === "cleaner") {
        const allTargets = workingTarget
            .split("\n")
            .map((line) => line.trim().replace(/,$/, ""))
            .filter((line) => line.length > 0);

        return allTargets.map(normalize);
    } else if (idea === "path") {
        const cleanEntry = normalize(workingTarget);

        if (cleanEntry.endsWith("/") || cleanEntry.endsWith("\\")) {
            return cleanEntry.trimEnd().trimStart().slice(0, -1);
        }

        return cleanEntry;
    } else {
        throw new Error("Invalid idea.");
    }
}

/**
 * Joins two parts of a file path.
 *
 * @export
 * @param {string} pathA First part, e.g. "my/beginning/"
 * @param {string} pathB Second part, e.g. "my/end.txt"
 * @returns {string} Result, e.g. "my/beginning/my/end.txt"
 */
export async function JoinPaths(pathA: string, pathB: string): Promise<string> {
    const workingPath = join(await ParsePath("path", pathA) as string, await ParsePath("path", pathB) as string);
    return await ParsePath("path", workingPath) as string;
}
