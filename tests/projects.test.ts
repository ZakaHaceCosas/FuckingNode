import { GetAllProjects, GetProjectEnvironment, GetWorkspaces } from "../src/functions/projects.ts";
import { assertEquals } from "@std/assert";
import type { ProjectEnv } from "../src/types/runtimes.ts";
import { JoinPaths, ParsePath } from "../src/functions/filesystem.ts";
import { CONSTANTS } from "./constants.ts";
import { mocks } from "./mocks.ts";

const TEST_PROJECTS = {
    // (naming things is fr the hardest)
    ONE: {
        ROOT: await JoinPaths(CONSTANTS.ENV_PATH, "./test-one"),
        MAIN: await ParsePath(`${CONSTANTS.ENV_PATH}/test-one/package.json`),
        LOCKFILE: await ParsePath(`${CONSTANTS.ENV_PATH}/test-one/package-lock.json`),
        NODE_MODULES: await ParsePath(`${CONSTANTS.ENV_PATH}/test-one/node_modules`),
        WORKSPACE_PATH: await ParsePath(`${CONSTANTS.ENV_PATH}/hi`),
    },
};

const MOCK_ENV = {
    ONE: {
        main: {
            path: TEST_PROJECTS.ONE.MAIN,
            content: JSON.parse(await Deno.readTextFile(TEST_PROJECTS.ONE.MAIN)),
        },
        runtime: "node",
        manager: "npm",
        lockfile: { name: "package-lock.json", path: TEST_PROJECTS.ONE.LOCKFILE },
        hall_of_trash: TEST_PROJECTS.ONE.NODE_MODULES,
        root: TEST_PROJECTS.ONE.ROOT
    } as ProjectEnv,
};

// ACTUAL TESTS
Deno.test(
    {
        name: "reads node env",
        fn: async () => {
            const env = await GetProjectEnvironment(TEST_PROJECTS.ONE.ROOT);
            assertEquals(env, MOCK_ENV.ONE);
        },
    },
);

Deno.test(
    {
        name: "reads workspaces",
        fn: async () => {
            const workspaces = await GetWorkspaces(TEST_PROJECTS.ONE.ROOT);
            assertEquals(workspaces, [TEST_PROJECTS.ONE.WORKSPACE_PATH]);
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
            assertEquals(projects, [TEST_PROJECTS.ONE.ROOT]);

            // Restore the original method
            Deno.readTextFile = originalReadTextFile;
        },
    },
);
