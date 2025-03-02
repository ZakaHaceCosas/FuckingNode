import { assertEquals } from "@std/assert";
import { JoinPaths, ParsePath, ParsePathList } from "../src/functions/filesystem.ts";

Deno.test({
    name: "paths are parsed correctly",
    fn: () => {
        assertEquals(
            ParsePath("--self"),
            Deno.cwd(),
        );
    },
});

Deno.test({
    name: "path list is parsed correctly",
    fn: () => {
        assertEquals(
            ParsePathList(`${Deno.cwd()}\n${JoinPaths(Deno.cwd(), "test")}\n`),
            [
                Deno.cwd(),
                JoinPaths(Deno.cwd(), "test"),
            ],
        );
    },
});
