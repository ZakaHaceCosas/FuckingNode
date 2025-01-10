import { CommandExists } from "../src/functions/cli.ts";
import { assertEquals } from "@std/testing";

// ACTUAL TESTS
// this test requires you to have the 3 titans (node deno and bun) and the 3 node sub-titans (npm pnpm and yarn)
Deno.test(
    {
        name: "detects all managers and runtimes",
        fn: async () => {
            const npm = await CommandExists("npm");
            assertEquals(npm, true);
            const pnpm = await CommandExists("pnpm");
            assertEquals(pnpm, true);
            const yarn = await CommandExists("yarn");
            assertEquals(yarn, true);
            const deno = await CommandExists("deno");
            assertEquals(deno, true);
            const bun = await CommandExists("bun");
            assertEquals(bun, true);
        },
    },
);
