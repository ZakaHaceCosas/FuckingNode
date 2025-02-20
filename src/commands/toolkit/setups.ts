import { ColorString } from "../../functions/io.ts";
import type { FkNodeYaml } from "../../types/config_files.ts";

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

const ACTUAL_SETUPS: {
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

export const SETUPS: {
    name: string;
    desc: string;
    content: string | FkNodeYaml;
    seek: "fknode.yaml" | ".gitignore" | "tsconfig.json";
}[] = [
    {
        name: "fknode-basic",
        desc: "A very basic fknode.yaml file.",
        content: ACTUAL_SETUPS.fknodeBasic,
        seek: "fknode.yaml",
    },
    {
        name: "fknode-allow-all",
        desc: "An fknode.yaml file that allows every feature to run (commits too!).",
        content: ACTUAL_SETUPS.fknodeAllowAll,
        seek: "fknode.yaml",
    },
    {
        name: "gitignore-js",
        desc: "A gitignore file for JavaScript projects.",
        content: ACTUAL_SETUPS.gitignoreJs,
        seek: ".gitignore",
    },
    {
        name: "gitignore-js-nolock",
        desc: "A gitignore file for JavaScript projects (also ignores lockfiles).",
        content: ACTUAL_SETUPS.gitignoreJsNoLock,
        seek: ".gitignore",
    },
    {
        name: "ts-strictest",
        desc: "Strictest way of TypeScripting, ensuring cleanest code.",
        content: ACTUAL_SETUPS.tsStrictest,
        seek: "tsconfig.json",
    },
];

export const VISIBLE_SETUPS = SETUPS.map(({ name, desc, seek }) => ({
    Name: ColorString(name, seek === "fknode.yaml" ? "red" : seek === "tsconfig.json" ? "bright-blue" : "orange"),
    Description: ColorString(desc, "bold"),
}));
