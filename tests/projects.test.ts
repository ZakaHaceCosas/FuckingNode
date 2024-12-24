import { GetProjectEnvironment } from "../src/functions/projects.ts";
import { assertEquals } from "@std/assert";
import type { ProjectEnv } from "../src/types/runtimes.ts";
import { JoinPaths, ParsePath } from "../src/functions/filesystem.ts";

const CONSTANTS = {
    CWD: Deno.cwd(),
    ENV_PATH: await JoinPaths(Deno.cwd(), "tests/environment"),
};

// naming things is fr the hardest
const uwu: ProjectEnv = {
    main: await ParsePath(`${CONSTANTS.ENV_PATH}/uwu/package.json`),
    runtime: "node",
    manager: "npm",
    lockfile: await ParsePath(`${CONSTANTS.ENV_PATH}/uwu/package-lock.json`),
    hall_of_trash: await ParsePath(`${CONSTANTS.ENV_PATH}/uwu/node_modules`),
};

Deno.test(
    {
        name: "reads node env",
        fn: async () => {
            console.log("Looking for", uwu.main, "environment.");
            const env = await GetProjectEnvironment("./tests/environment/uwu");
            assertEquals(env, uwu);
        },
    },
);

// todo.
