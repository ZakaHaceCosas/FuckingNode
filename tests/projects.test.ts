import { GetProjectEnvironment } from "../src/functions/projects.ts";
import { assertEquals } from "@std/assert";
import { APP_NAME } from "../src/constants.ts";
import type { ProjectEnv } from "../src/types/runtimes.ts";

// naming things is fr the hardest
// TODO - im stupid people cant just clone this repo and run the tests (they depend on my local file structure)
const uwu: ProjectEnv = {
    main: `C:\\Users\\Zaka\\${APP_NAME.CASED}\\real-life-tests\\uwu\\package.json`,
    runtime: "node",
    manager: "npm",
    lockfile: `C:\\Users\\Zaka\\${APP_NAME.CASED}\\real-life-tests\\uwu\\package-lock.json`,
    hall_of_trash: `C:\\Users\\Zaka\\${APP_NAME.CASED}\\real-life-tests\\uwu\\node_modules`,
};

Deno.test(
    {
        name: "reads node env",
        fn: async () => {
            const env = await GetProjectEnvironment("./real-life-tests/uwu");
            assertEquals(env, uwu);
        },
    },
);

// todo.
