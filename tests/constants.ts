import { JoinPaths, ParsePath } from "../src/functions/filesystem.ts";
import type { ProjectEnv } from "../src/types/runtimes.ts";

// CONSTANTS
export const CONSTANTS = {
    CWD: Deno.cwd(),
    ENV_PATH: await JoinPaths(Deno.cwd(), "tests/environment"),
};

// (naming things is fr the hardest)
const TEST_PROJECTS: Record<string, ProjectEnv> = {
    ONE: {
        root: await ParsePath(`${CONSTANTS.ENV_PATH}/test-one`),
        main: {
            path: await ParsePath(`${CONSTANTS.ENV_PATH}/test-one/package.json`),
            name: "package.json",
            content: JSON.parse(await Deno.readTextFile(await ParsePath(`${CONSTANTS.ENV_PATH}/test-one/package.json`))),
        },
        commands: {
            base: "npm",
            clean: [
                [
                    "dedupe",
                ],
                [
                    "prune",
                ],
            ],
            exec: [
                "npx",
            ],
            update: [
                "update",
            ],
            audit: [
                "audit",
                "--include-workspace-root",
            ],
            run: ["npm", "run"],
            publish: ["publish"],
        },
        runtime: "node",
        manager: "npm",
        lockfile: {
            name: "package-lock.json",
            path: await ParsePath(`${CONSTANTS.ENV_PATH}/test-one/package-lock.json`),
        },
        hall_of_trash: await ParsePath(`${CONSTANTS.ENV_PATH}/test-one/node_modules`),
        workspaces: [await ParsePath(`${CONSTANTS.ENV_PATH}/test-two`)],
    },
};

export const TEST_ONE = TEST_PROJECTS["ONE"]!;
