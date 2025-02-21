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
    tsLibrary: object;
    editorConfigDefault: string;
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
            "strictNullChecks": true,
            "strictBindCallApply": true,
            "strictFunctionTypes": true,
            "strictBuiltinIteratorReturn": true,
            "strictPropertyInitialization": true,
            "noImplicitAny": true,
            "noImplicitOverride": true,
            "noUnusedLocals": true,
            "noUnusedParameters": true,
            "noPropertyAccessFromIndexSignature": true,
            "noUncheckedIndexedAccess": true,
            "noUncheckedSideEffectImports": true,
            "noImplicitThis": true,
            "noImplicitReturns": true,
            "noFallthroughCasesInSwitch": true,
            "forceConsistentCasingInFileNames": true,
            "exactOptionalPropertyTypes": true,
            "useUnknownInCatchVariables": true,
        },
    },
    tsLibrary: {
        "compilerOptions": {
            "target": "ES2022",
            "module": "ESNext",
            "declaration": true,
            "outDir": "dist",
            "strict": true,
            "moduleResolution": "nodenext",
            "esModuleInterop": true,
            "skipLibCheck": true,
        },
        "include": ["src"],
    },
    editorConfigDefault: [
        "root = true",
        "",
        "[*]",
        "indent_style = space",
        "indent_size = 4",
        "end_of_line = lf",
        " charset = utf-8 ",
        "trim_trailing_whitespace = true",
        " insert_final_newline = true",
        "",

        "[*.md]",
        "trim_trailing_whitespace = false",
    ].join("\n"),
};

export const SETUPS: {
    name: string;
    desc: string;
    content: string | FkNodeYaml;
    seek: "fknode.yaml" | ".gitignore" | "tsconfig.json" | ".editorconfig";
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
    {
        name: "ts-library",
        desc: "Recommended config for libraries.",
        content: ACTUAL_SETUPS.tsLibrary,
        seek: "tsconfig.json",
    },
    {
        name: "editorconfig-default",
        desc: "A basic .editorconfig file that works for everyone.",
        content: ACTUAL_SETUPS.editorConfigDefault,
        seek: ".editorconfig",
    },
];

export const VISIBLE_SETUPS = SETUPS.map(({ name, desc, seek }) => ({
    Name: ColorString(
        name,
        seek === "fknode.yaml" ? "red" : seek === "tsconfig.json" ? "bright-blue" : seek === ".editorconfig" ? "cyan" : "orange",
    ),
    Description: ColorString(desc, "bold"),
}));
