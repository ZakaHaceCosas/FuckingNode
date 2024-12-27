import { JoinPaths } from "../src/functions/filesystem.ts";

// CONSTANTS
export const CONSTANTS = {
    CWD: Deno.cwd(),
    ENV_PATH: await JoinPaths(Deno.cwd(), "tests/environment"),
};
