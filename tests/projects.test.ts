import { GetAllProjects, GetProjectEnvironment, GetWorkspaces } from "../src/functions/projects.ts";
import { assertEquals } from "@std/testing";
import { TEST_ONE } from "./constants.ts";
import { mocks } from "./mocks.ts";

// ACTUAL TESTS
Deno.test(
    {
        name: "reads node env",
        fn: async () => {
            const env = await GetProjectEnvironment(TEST_ONE.root);
            assertEquals(env, TEST_ONE);
        },
    },
);

Deno.test(
    {
        name: "reads workspaces",
        fn: async () => {
            const workspaces = (await GetWorkspaces(TEST_ONE.root)) ?? "no";
            assertEquals(workspaces, TEST_ONE.workspaces);
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
            assertEquals(projects, [TEST_ONE.root]);

            // Restore the original method
            Deno.readTextFile = originalReadTextFile;
        },
    },
);
