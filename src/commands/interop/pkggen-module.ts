import type { DenoPkgFile, FnCPF, NodePkgFile } from "../../types/platform.ts";

const getNodeBunDeps = (cpf: FnCPF, desiredRel: FnCPF["deps"][0]["rel"]) => {
    return Object.fromEntries(
        cpf.deps.map((d) => {
            if (d.rel !== desiredRel) return "__REM";
            return [d.name, d.ver];
        }).filter((d) => d !== "__REM"),
    );
};

const getDenoDeps = (cpf: FnCPF) => {
    return Object.fromEntries(
        cpf.deps.map((d) => {
            // assuming
            // 1. deno deps can only be univ:dep
            // 2. deno deps can only be sourced from npm or jsr
            // 3. i think i built the FnCPF parser right and it keeps the @ of @scope/pkg, right?
            // i tested export at a random project (sokora) and it showed up, so i'll assume this works
            if (d.rel !== "univ:dep") return "__REM";
            return [d.name, `${d.src}:${d.name}@${d.ver}`]; // e.g. @ZakaHaceCosas/string-utils: "@ZakaHaceCosas/string-utils@^1.5.0"
        }).filter((d) => d !== "__REM"),
    );
};

export const Generators = {
    /** Generates an `npm`, `pnpm`, `yarn`, and `bun` compatible `package.json` file string from a FnCPF string. */
    NodeBun: (cpf: FnCPF, additionalParams: object): NodePkgFile => {
        const generatedPkgFile: NodePkgFile = {
            ...additionalParams,
            name: cpf.name,
            version: cpf.version,
            dependencies: getNodeBunDeps(cpf, "univ:dep"),
            devDependencies: getNodeBunDeps(cpf, "univ:devD"),
            peerDependencies: getNodeBunDeps(cpf, "js:peer"),
            workspaces: cpf.ws,
        };

        return generatedPkgFile;
    },
    /** Generates a `deno` compatible `deno.json` file string from a FnCPF string. */
    Deno: (cpf: FnCPF, additionalParams: object): DenoPkgFile => {
        const generatedPkgFile: DenoPkgFile = {
            ...additionalParams,
            name: cpf.name,
            version: cpf.version,
            imports: getDenoDeps(cpf),
            workspaces: cpf.ws,
        };

        return generatedPkgFile;
    },
    Golang: () => {
        throw new Error("Not done yet! (interop/pkg-gen/golang)");
    },
    Cargo: () => {
        throw new Error("Not done yet! (interop/pkg-gen/cargo)");
    },
};
