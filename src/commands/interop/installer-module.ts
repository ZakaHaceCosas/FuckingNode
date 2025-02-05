import { Commander } from "../../functions/cli.ts";
import { CheckForPath, JoinPaths, ParsePath } from "../../functions/filesystem.ts";

export const Installers = {
    UniJs: async (path: string, manager: "bun" | "npm" | "pnpm" | "yarn" | "deno") => {
        try {
            Deno.chdir(await ParsePath(path));
            await Commander(manager, ["install"]);
            return;
        } catch (e) {
            throw e;
        }
    },
    Golang: async (path: string) => {
        try {
            Deno.chdir(await ParsePath(path));
            if (await CheckForPath(await JoinPaths(Deno.cwd(), "vendor"))) {
                await Commander("go", ["mod", "vendor"]);
                return;
            }
            await Commander("go", ["mod", "tidy"]);
            return;
        } catch (e) {
            throw e;
        }
    },
    Cargo: async (path: string) => {
        try {
            Deno.chdir(await ParsePath(path));
            await Commander("cargo", ["fetch"]);
            await Commander("cargo", ["check"]);
            return;
        } catch (e) {
            throw e;
        }
    },
};
