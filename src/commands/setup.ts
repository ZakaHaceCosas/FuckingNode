import { CheckForPath, JoinPaths } from "../functions/filesystem.ts";
import { ColorString, LogStuff, StringifyYaml } from "../functions/io.ts";
import { deepMerge, GetProjectEnvironment, NameProject, SpotProject } from "../functions/projects.ts";
import type { FkNodeYaml } from "../types/config_files.ts";
import type { TheSetuperConstructedParams } from "./constructors/command.ts";
import { StringUtils } from "@zakahacecosas/string-utils";
import { parse as parseYaml } from "@std/yaml";
import { parse as parseJsonc } from "@std/jsonc";

// TODO - take these constants to an external file
// TODO 2 - add more templates, of course

const commons = {
    buildTargets: ["dist/", "out/", "build/", ".cache/"],
    baseJsGitignore: [
        "# built / output files",
        ...["dist/", "out/", "build/", ".cache/"],
        ".deno/",
        "",
        "# environment",
        ".env",
        ".env.local",
        ".env.*.local",
        "",
        "# logs",
        "npm-debug.log*",
        "yarn-debug.log*",
        "yarn-error.log*",
        "bun-debug.log*",
        "lerna-debug.log*",
        "",
        "# caches",
        ".npm/",
        ".bun/",
        ".pnp/",
        ".pnp.js",
        "deno_dir/",
        "",
        "# modules",
        "node_modules/",
    ].join("\n"),
    jsLockfiles: ["deno.lock", "bun.lock", "bun.lockb", "yarn.lock", "pnpm-lock.yaml", "package-lock.json"],
};

const actualSetups: {
    fknodeBasic: FkNodeYaml;
    fknodeAllowAll: FkNodeYaml;
    gitignoreJs: string;
    gitignoreJsNoLock: string;
    tsStrictest: object;
} = {
    fknodeBasic: {
        destroy: {
            intensities: ["hard"],
            targets: commons.buildTargets,
        },
    },
    fknodeAllowAll: {
        divineProtection: "disabled",
        destroy: {
            intensities: ["*"],
            targets: commons.buildTargets,
        },
        flagless: {
            flaglessCommit: false,
            flaglessDestroy: true,
            flaglessLint: true,
            flaglessPretty: true,
            flaglessUpdate: true,
        },
        commitActions: true,
    },
    gitignoreJs: commons.baseJsGitignore,
    gitignoreJsNoLock: `${commons.baseJsGitignore}\n${commons.jsLockfiles}`,
    tsStrictest: {
        compilerOptions: {
            "strict": true,
            "noImplicitAny": true,
            "noImplicitOverride": true,
            "strictNullChecks": true,
            "noUnusedLocals": true,
            "noUnusedParameters": true,
            "incremental": true,
            "esModuleInterop": true,
            "forceConsistentCasingInFileNames": true,
            "allowSyntheticDefaultImports": true,
            "strictFunctionTypes": true,
            "alwaysStrict": true,
            "strictPropertyInitialization": true,
            "noStrictGenericChecks": false,
            "noImplicitThis": true,
            "noImplicitReturns": true,
            "noFallthroughCasesInSwitch": true,
            "exactOptionalPropertyTypes": true,
            "strictBindCallApply": true,
            "useUnknownInCatchVariables": true,
        },
    },
};

const setups: { name: string; desc: string; content: string | FkNodeYaml; seek: "fknode.yaml" | ".gitignore" | "tsconfig.json" }[] = [
    {
        name: "fknode-basic",
        desc: "A very basic fknode.yaml file.",
        content: actualSetups.fknodeBasic,
        seek: "fknode.yaml",
    },
    {
        name: "fknode-allow-all",
        desc: "An fknode.yaml file that allows every feature to run (commits too!).",
        content: actualSetups.fknodeAllowAll,
        seek: "fknode.yaml",
    },
    {
        name: "gitignore-js",
        desc: "A gitignore file for JavaScript projects.",
        content: actualSetups.gitignoreJs,
        seek: ".gitignore",
    },
    {
        name: "gitignore-js-nolock",
        desc: "A gitignore file for JavaScript projects (also ignores lockfiles).",
        content: actualSetups.gitignoreJsNoLock,
        seek: ".gitignore",
    },
    {
        name: "ts-strictest",
        desc: "Strictest way of TypeScripting, ensuring cleanest code.",
        content: actualSetups.tsStrictest,
        seek: "tsconfig.json",
    },
];

const visibleSetups = setups.map(({ name, desc, seek }) => ({
    Name: ColorString(name, seek === "fknode.yaml" ? "red" : seek === "tsconfig.json" ? "bright-blue" : "orange"),
    Description: ColorString(desc, "bold"),
}));

export default async function TheSetuper(params: TheSetuperConstructedParams) {
    if (!StringUtils.validate(params.setup)) {
        await LogStuff(StringUtils.table(visibleSetups));
        await LogStuff(
            "You either didn't provide a project / target setup or provided invalid ones, so up here are all possible setups.",
        );
        return;
    }

    const project = await SpotProject(params.project);
    const env = await GetProjectEnvironment(project);
    const desiredSetup = StringUtils.normalize(params.setup, true);
    const setupToUse = setups.find((s) => (StringUtils.normalize(s.name, true)) === desiredSetup);

    if (
        !setupToUse
    ) throw new Error(`Given setup ${params.setup} is not valid! Choose from the list ${setups.map((s) => s.name)}.`);

    const path = await JoinPaths(env.root, setupToUse.seek);
    const exists = await CheckForPath(path);

    if (
        !(await LogStuff(
            `Should we add the ${ColorString(setupToUse.name, "bold")} ${ColorString(setupToUse.seek, "italic")} file to ${await NameProject(
                project,
                "name-ver",
            )}?${
                exists
                    ? setupToUse.seek === "tsconfig.json"
                        ? "\nNote: Your existing tsconfig.json will be merged with this template. Comments won't be preserved!"
                        : setupToUse.seek === "fknode.yaml"
                        ? "\nNote: Your existing fknode.yaml will be overwritten by this template."
                        : "\nNote: Your existing .gitignore will be merged with this template."
                    : ""
            }`,
            "what",
            undefined,
            true,
        ))
    ) {
        await LogStuff("Alright. No changes made.", "tick");
        return;
    }

    let finalContent: string;

    if (exists) {
        const fileContent = await Deno.readTextFile(path);
        if (setupToUse.seek === ".gitignore") {
            finalContent = `${fileContent}\n${setupToUse.content}`;
        } else if (setupToUse.seek === "fknode.yaml") {
            const parsedContent = parseYaml(fileContent);
            finalContent = StringifyYaml(deepMerge(setupToUse.content, parsedContent));
        } else {
            // (ts)
            const parsedContent = parseJsonc(fileContent);
            finalContent = JSON.stringify(deepMerge(setupToUse.content, parsedContent), undefined, 4);
        }
    } else {
        finalContent = setupToUse.seek === "fknode.yaml"
            ? StringifyYaml(setupToUse.content)
            : setupToUse.seek === "tsconfig.json"
            ? JSON.stringify(setupToUse.content, undefined, 4)
            : setupToUse.content as string;
    }

    await Deno.writeTextFile(
        path,
        finalContent,
    );

    await LogStuff("Done!", "tick");
}
