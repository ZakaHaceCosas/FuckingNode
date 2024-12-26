import { GetProjectEnvironment } from "../src/functions/projects.ts";
import { assertEquals } from "@std/assert";
import type { ProjectEnv } from "../src/types/runtimes.ts";
import { JoinPaths, ParsePath } from "../src/functions/filesystem.ts";
import { GetAllProjects } from "../src/functions/projects.ts";
import { GetAppPath } from "../src/functions/config.ts";
import { GetWorkspaces } from "../src/functions/projects.ts";

const CONSTANTS = {
    CWD: Deno.cwd(),
    ENV_PATH: await JoinPaths(Deno.cwd(), "tests/environment"),
};

const PROJECT_ROOTS = {
    ONE: await JoinPaths(CONSTANTS.ENV_PATH, "./uwu"),
};

const uwuMain = await ParsePath(`${CONSTANTS.ENV_PATH}/uwu/package.json`);

// naming things is fr the hardest
const uwu: ProjectEnv = {
    main: {
        path: uwuMain,
        content: JSON.parse(await Deno.readTextFile(uwuMain)),
    },
    runtime: "node",
    manager: "npm",
    lockfile: await ParsePath(`${CONSTANTS.ENV_PATH}/uwu/package-lock.json`),
    hall_of_trash: await ParsePath(`${CONSTANTS.ENV_PATH}/uwu/node_modules`),
};

Deno.test(
    {
        name: "reads node env",
        fn: async () => {
            const env = await GetProjectEnvironment(PROJECT_ROOTS.ONE);
            assertEquals(env, uwu);
        },
    },
);

Deno.test(
    {
        name: "reads workspaces",
        fn: async () => {
            const env = await GetWorkspaces(PROJECT_ROOTS.ONE);
            assertEquals(env, [await ParsePath(`${CONSTANTS.ENV_PATH}/hi`)]);
        },
    },
);

Deno.test(
    {
        name: "returns all projects",
        fn: async () => {
            const originalReadTextFile = Deno.readTextFile;

            // mock readTextFile
            Deno.readTextFile = async (path: string | URL) => {
                if (path === (await GetAppPath("MOTHERFKRS"))) {
                    return `${CONSTANTS.ENV_PATH}/uwu`; // we give /uwu instead of \\uwu in purpose to ensure paths are parsed before returning them
                }
                return await originalReadTextFile(path);
            };

            const projects = await GetAllProjects();
            assertEquals(projects, [PROJECT_ROOTS.ONE]);
        },
    },
);
