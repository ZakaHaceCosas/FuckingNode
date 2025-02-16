import { DEFAULT_FKNODE_YAML, VERSIONING } from "../src/constants.ts";
import { JoinPaths, ParsePath } from "../src/functions/filesystem.ts";
import type { ProjectEnvironment } from "../src/types/platform.ts";

// CONSTANTS
export const CONSTANTS = {
    CWD: Deno.cwd(),
    ENV_PATH: await JoinPaths(Deno.cwd(), "tests/environment"),
    INTEROP_PATH: await JoinPaths(Deno.cwd(), "tests/interop"),
};

// (naming things is fr the hardest)
const TEST_PROJECTS: Record<string, ProjectEnvironment> = {
    ONE: {
        root: await ParsePath(`${CONSTANTS.ENV_PATH}/test-one`),
        settings: DEFAULT_FKNODE_YAML,
        main: {
            path: await ParsePath(`${CONSTANTS.ENV_PATH}/test-one/package.json`),
            name: "package.json",
            stdContent: JSON.parse(await Deno.readTextFile(await ParsePath(`${CONSTANTS.ENV_PATH}/test-one/package.json`))),
            cpfContent: {
                name: "uwu.js",
                version: "1.0.0",
                rm: "npm",
                deps: [
                    {
                        name: "tslib",
                        ver: "^2.0.0",
                        rel: "univ:dep",
                        src: "npm",
                    },
                ],
                ws: [
                    await ParsePath(`${CONSTANTS.ENV_PATH}/test-two`),
                ],
                internal: {
                    fknode: VERSIONING.APP,
                    fknodeCpf: "1.0.0",
                    fknodeIol: "1.0.0",
                },
            },
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
