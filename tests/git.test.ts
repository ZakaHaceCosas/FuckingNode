import { assertEquals } from "@std/testing";
import { Git } from "../src/utils/git.ts";

Deno.test({
    name: "gets git branches",
    fn: async () => {
        const branches = await Git.GetBranches("@zakahacecosas/fuckingnode", true);
        assertEquals(
            branches,
            {
                current: "v3",
                all: [
                    "v3",
                    "v2",
                    "master",
                    "feature-audit",
                ].sort(),
            },
        );
    },
});

Deno.test({
    name: "gets git latest tag",
    fn: async () => {
        const tag = await Git.GetLatestTag("@zakahacecosas/fuckingnode", true);
        assertEquals(
            tag,
            "2.2.1", // TODO - assuming tags use semver version, make this use the value from deno.json so we're not changing this each time for tests to pass
        );
    },
});

Deno.test({
    name: "gets git files ready for commit",
    fn: async () => {
        const files = await Git.GetFilesReadyForCommit("@zakahacecosas/fuckingnode", true);
        assertEquals(
            files,
            ["test.txt"],
        );
    },
});
