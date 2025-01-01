import { PerformAuditing } from "../src/commands/toolkit/auditer.ts";
import { JoinPaths, ParsePath } from "../src/functions/filesystem.ts";
import { CONSTANTS } from "./constants.ts";
import { assertEquals } from "@std/testing";

Deno.test({
    name: "audits test-three (Y, Y, N, N, N, N)",
    fn: async () => {
        const p = await ParsePath(await JoinPaths(CONSTANTS.ENV_PATH, "test-three/"));
        console.log(p);
        const res = await PerformAuditing(p);
        // you are supposed to do
        // Y, Y, N, N, N, N
        if (res === 0) return;
        if (res === 1) return;
        assertEquals(res.percentage.toFixed(2), "33.33");
    },
});
