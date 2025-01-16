import { AddProject, RemoveProject } from "../src/commands/manage.ts";
import { PerformAuditing } from "../src/commands/toolkit/auditer.ts";
import { JoinPaths, ParsePath } from "../src/functions/filesystem.ts";
import { CONSTANTS } from "./constants.ts";
import { assertEquals } from "@std/testing";

Deno.test({
    name: "audits test-three (Y, Y, Y, N, Y, Y, N, N, N, N)",
    fn: async () => {
        const path = await ParsePath(await JoinPaths(CONSTANTS.ENV_PATH, "test-three/"));
        await AddProject(path, true)
        const res = await PerformAuditing(path, true);
        if (res === 0) return;
        if (res === 1) return;
        assertEquals(res.percentage.toFixed(2), "40.00");
        await RemoveProject(path, true)
    },
});
