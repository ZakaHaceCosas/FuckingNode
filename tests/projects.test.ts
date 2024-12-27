import { GetAllProjects, GetProjectEnvironment, GetWorkspaces } from "../src/functions/projects.ts";
import { assertEquals } from "@std/assert";
import type { ProjectEnv } from "../src/types/runtimes.ts";
import { JoinPaths, ParsePath } from "../src/functions/filesystem.ts";
import { CONSTANTS } from "./constants.ts";
import { mocks } from "./mocks.ts";

const TEST_PROJECTS = {
    // (naming things is fr the hardest)
    UWU: {
        ROOT: await JoinPaths(CONSTANTS.ENV_PATH, "./uwu"),
        MAIN: await ParsePath(`${CONSTANTS.ENV_PATH}/uwu/package.json`),
        LOCKFILE: await ParsePath(`${CONSTANTS.ENV_PATH}/uwu/package-lock.json`),
        NODE_MODULES: await ParsePath(`${CONSTANTS.ENV_PATH}/uwu/node_modules`),
        WORKSPACE_PATH: await ParsePath(`${CONSTANTS.ENV_PATH}/hi`),
    },
};

const MOCK_ENV = {
    UWU: {
        main: {
            path: TEST_PROJECTS.UWU.MAIN,
            content: JSON.parse(await Deno.readTextFile(TEST_PROJECTS.UWU.MAIN)),
        },
        runtime: "node",
        manager: "npm",
        lockfile: { name: "package-lock.json", path: TEST_PROJECTS.UWU.LOCKFILE },
        hall_of_trash: TEST_PROJECTS.UWU.NODE_MODULES,
    } as ProjectEnv,
};

// ACTUAL TESTS
Deno.test(
    {
        name: "reads node env",
        fn: async () => {
            const env = await GetProjectEnvironment(TEST_PROJECTS.UWU.ROOT);
            assertEquals(env, MOCK_ENV.UWU);
        },
    },
);

Deno.test(
    {
        name: "reads workspaces",
        fn: async () => {
            const workspaces = await GetWorkspaces(TEST_PROJECTS.UWU.ROOT);
            assertEquals(workspaces, [TEST_PROJECTS.UWU.WORKSPACE_PATH]);
        },
    },
);

Deno.test(
    {
        name: "returns all projects",
        fn: async () => {
            const originalReadTextFile = Deno.readTextFile;
            // mock readTextFile
            Deno.readTextFile = mocks.readTextFile();

            const projects = await GetAllProjects();
            assertEquals(projects, [TEST_PROJECTS.UWU.ROOT]);

            // Restore the original method
            Deno.readTextFile = originalReadTextFile;
        },
    },
);
