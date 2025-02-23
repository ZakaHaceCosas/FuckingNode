import { walk } from "@std/fs/walk";
import { ColorString } from "../src/functions/io.ts";
import { JoinPaths, ParsePath } from "../src/functions/filesystem.ts";

console.log(ColorString("we making this good", "bright-blue"));

const dir = Deno.cwd(); // as the CWD from where you'll run deno task will always be the root of the project

async function GetAllTsFiles(): Promise<string[]> {
    const exclude = [ParsePath(JoinPaths(dir, "tests/environment"))];
    const tsFiles: string[] = [];

    for await (
        const entry of walk(dir, {
            includeDirs: false,
            exts: [".ts"],
            skip: [
                ...exclude.map((excluded) => new RegExp(`(^|/)${excluded}(/|$)`)),
                /\.ignore\.ts$/,
            ],
        })
    ) {
        tsFiles.push(entry.path);
    }

    return tsFiles;
}

const toPrepare: string[] = await GetAllTsFiles();

for (const unprepared of toPrepare) {
    new Deno.Command("deno", {
        args: ["check", unprepared],
    }).spawn();
}

new Deno.Command("deno", {
    args: ["fmt"],
}).spawn(); // ensure code is formatted

new Deno.Command("deno", {
    args: ["upgrade"],
}).spawn(); // ensure we're on latest

new Deno.Command("deno", {
    args: ["outdated", "--update", "--latest"],
}).spawn(); // ensure deps are on latest

await Deno.copyFile(
    JoinPaths(dir, "scripts/install.ps1"),
    JoinPaths(dir, "docs/install.ps1"),
);
await Deno.copyFile(
    JoinPaths(dir, "scripts/install.sh"),
    JoinPaths(dir, "docs/install.sh"),
);
