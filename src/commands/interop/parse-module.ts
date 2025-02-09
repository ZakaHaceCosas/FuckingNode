/**
 * @file This file includes parses for file formats that cannot be parsed using existing libraries that I'm aware of, e.g. Go.mod.
 * @author ZakaHaceCosas
 */

import { StringUtils, type UnknownString } from "@zakahacecosas/string-utils";
import type { CargoPkgFile, DenoPkgFile, FnCPF, GolangPkgFile, NodePkgFile } from "../../types/platform.ts";
import { FnCPFInternal } from "../../constants.ts";
import { FknError } from "../../utils/error.ts";
import { parse as parseToml } from "@std/toml";
import { parse as parseJsonc } from "@std/jsonc";
import { FkNodeInterop } from "./interop.ts";

export const internalValidators = {
    // deno-lint-ignore no-explicit-any
    isPkgFileCargo: (obj: any): obj is CargoPkgFile => {
        return obj && typeof obj === "object" && obj.package && obj.package.name && StringUtils.validate(obj.package.name) &&
            obj.package.version &&
            StringUtils.validate(obj.package.version);
    },

    // deno-lint-ignore no-explicit-any
    isPkgFileGolang: (obj: any): obj is GolangPkgFile => {
        return obj && typeof obj === "object" && obj.module && StringUtils.validate(obj.module) && obj.go && StringUtils.validate(obj.go);
    },

    // deno-lint-ignore no-explicit-any
    isPkgFileDeno: (obj: any): obj is DenoPkgFile => {
        return obj && typeof obj === "object" && obj.name && StringUtils.validate(obj.name) && obj.version && StringUtils.validate(obj.version);
    },

    // deno-lint-ignore no-explicit-any
    isPkgFileNodeBun: (obj: any): obj is NodePkgFile => {
        return obj && typeof obj === "object" && obj.name && StringUtils.validate(obj.name) && obj.version && StringUtils.validate(obj.version);
    },
};

/**
 * gets a Golang require-like string:
 * ```go
 * require (
 *      "entry"
 *      "another-entry"
 * )
 * ```
 * and returns all entries in a string array.
 *
 * ### things to note
 * - by design, parens are included, so it'll always be `["(", ..., ")"]`
 * - capable of handling multiple requires (e.g "`require () require ()`")
 *
 * @export
 * @param {string[]} content string[] (assumes you splitted lines with something like `.split("\n")`)
 * @param {string} kw keyword to use as "key" in `key(vals)`
 * @returns {string[]}
 */
export function internalGolangRequireLikeStringParser(content: string[], kw: string): string[] {
    const toReturn: string[] = [];
    let requireCount = 0;

    content.map((line) => {
        const l = StringUtils.normalize(line);
        if (l === `${StringUtils.normalize(kw, true, true)} (`) {
            if (requireCount === 0) toReturn.push(l);
            requireCount++;
        } else if (l === ")") {
            // nah
        } else {
            toReturn.push(l); // Push lines outside of require block
        }
    });

    toReturn.push(")");
    return toReturn;
}

// * ###
// * BEGIN THIS CODE SUCKS
// * ###
const internalParsers = {
    GolangPkgFile: (content: string): GolangPkgFile => {
        try {
            const lines = content.trim().split("\n");
            let module: UnknownString = "";
            let go: UnknownString = "";
            const require: GolangPkgFile["require"] = {};

            const parsedLines = internalGolangRequireLikeStringParser(lines, "require").filter((line) => line.trim() !== "");

            for (const line of parsedLines) {
                // ?? we assume that module & go version are defined
                if (line.trim().startsWith("module")) {
                    module = line.split(" ")[1]?.trim();
                    // ?? "__NO_GOLANG_MODULE";
                } else if (line.trim().startsWith("go")) {
                    const match = line.trim().match(/go\s+(\d+\.\d+)/);
                    // not mine
                    go = match ? match[0] : "__NO_GOLANG_VERSION";
                    // ?? "__NO_GOLANG_MODULE";
                } else if (line.trim().startsWith("require")) {
                    // Process the `require` line by checking for multiple strings in one line or across multiple lines

                    // If there's more than one part (URL + version)
                    // If it's broken across multiple lines (next line might contain the version), concatenate
                    const index = parsedLines.indexOf(line);
                    let newIndex = index + 1;

                    while (newIndex < parsedLines.length) {
                        const nextLine = parsedLines[newIndex]?.trim();

                        if (nextLine === undefined) {
                            break; // break if the line is invalid
                        }

                        const nextParts = nextLine.split(/\s+/);

                        if (nextParts[0] === undefined || nextParts[1] === undefined) {
                            break; // break if invalid
                        }

                        const moduleName = nextParts[0].trim();
                        const version = nextParts[1].trim();
                        const isIndirect = (nextParts[2] ?? "").includes("indirect") || (nextParts[3] ?? "").includes("indirect");
                        require[moduleName] = {
                            version: version,
                            indirect: isIndirect,
                        };

                        newIndex++; // Move to the next line after processing
                    }
                }
            }

            if (!StringUtils.validate(module) || !StringUtils.validate(go)) {
                throw new FknError("Env__UnparsableMainFile", `Given go.mod contents are unparsable.\n${content}`);
            }

            const toReturn: GolangPkgFile = {
                module,
                go,
                require,
            };

            if (!FkNodeInterop.IsPackageFileValid.Golang(toReturn)) {
                throw new FknError("Env__UnparsableMainFile", `Given go.mod contents are unparsable.`);
            }

            return toReturn;
        } catch (e) {
            throw e;
        }
    },
    CargoPkgFile: (content: string): CargoPkgFile => {
        const toReturn = parseToml(content);

        if (!FkNodeInterop.IsPackageFileValid.Cargo(toReturn)) {
            throw new FknError("Env__UnparsableMainFile", `Given Cargo.toml contents are unparsable.`);
        }

        return toReturn;
    },
    NodeBunPkgFile: (content: string): NodePkgFile => {
        const toReturn = parseJsonc(content);

        if (!FkNodeInterop.IsPackageFileValid.NodeBun(toReturn)) {
            throw new FknError("Env__UnparsableMainFile", `Given package.json contents are unparsable.`);
        }

        return toReturn;
    },
    DenoPkgFile: (content: string): DenoPkgFile => {
        const toReturn = parseJsonc(content);

        if (!FkNodeInterop.IsPackageFileValid.Deno(toReturn)) {
            throw new FknError("Env__UnparsableMainFile", `Given deno.json/deno.jsonc contents are unparsable.`);
        }

        return toReturn;
    },
};

export const dedupeDependencies = (deps: FnCPF["deps"]) => {
    return deps.filter((dep, index, self) => index === self.findIndex((d) => d.name === dep.name));
};

export const findDependency = (target: string, deps: FnCPF["deps"]): FnCPF["deps"][0] | undefined => {
    return deps.find((dep) => StringUtils.normalize(dep.name, true, true) === StringUtils.normalize(target, true, true));
};

// * ###
// * "END" THIS CODE SUCKS
// * ###

export const Parsers = {
    Golang: {
        STD: internalParsers.GolangPkgFile,
        CPF: (content: string, version: string | undefined, ws: string[]): FnCPF => {
            try {
                const parsedContent = internalParsers.GolangPkgFile(content);

                const deps: FnCPF["deps"] = [];

                Object.entries(parsedContent.require ?? []).map(
                    ([k, v]) => {
                        deps.push(
                            {
                                name: k,
                                ver: v.version,
                                rel: v.indirect === true ? "go:ind" : "univ:dep",
                                src: "pkg.go.dev",
                            },
                        );
                    },
                );

                return {
                    name: parsedContent.module,
                    version: version === undefined ? "Unknown" : version,
                    rm: "golang",
                    deps: dedupeDependencies(deps),
                    ws,
                    internal: FnCPFInternal,
                };
            } catch (e) {
                throw e;
            }
        },
    },
    Cargo: {
        STD: internalParsers.CargoPkgFile,
        CPF: (content: string, ws: string[]): FnCPF => {
            const parsedContent = internalParsers.CargoPkgFile(content);

            const deps: FnCPF["deps"] = [];

            function processCargoDependencies(
                depsObject: CargoPkgFile["dependencies"] | undefined,
                rValue: FnCPF["deps"][0]["rel"],
                depsArray: { name: string; ver: string; rel: string; src: string }[],
            ) {
                Object.entries(depsObject ?? {}).forEach(([k, v]) => {
                    depsArray.push({
                        name: k,
                        ver: typeof v === "object" ? String(v.version) : String(v),
                        rel: rValue,
                        src: "crates.io",
                    });
                });
            }

            processCargoDependencies(parsedContent.dependencies, "univ:dep", deps);
            processCargoDependencies(parsedContent["dev-dependencies"], "univ:devD", deps);
            processCargoDependencies(parsedContent["build-dependencies"], "rst:buildD", deps);

            return {
                name: parsedContent.package.name,
                version: parsedContent.package.version,
                rm: "cargo",
                deps: dedupeDependencies(deps),
                ws,
                internal: FnCPFInternal,
            };
        },
    },
    NodeBun: {
        STD: internalParsers.NodeBunPkgFile,
        CPF: (content: string, rt: "npm" | "pnpm" | "yarn" | "bun", ws: string[]): FnCPF => {
            const parsedContent = internalParsers.NodeBunPkgFile(content);

            if (!parsedContent.name || !parsedContent.version) {
                throw new Error("Invalid package.json file");
            }

            const deps: FnCPF["deps"] = [];
            function processNodeDependencies(
                depsObject: NodePkgFile["dependencies"] | undefined,
                rValue: FnCPF["deps"][0]["rel"],
                depsArray: { name: string; ver: string; rel: string; src: string }[],
            ) {
                Object.entries(depsObject ?? {}).map(([k, v]) => {
                    depsArray.push({ name: k, ver: v, rel: rValue, src: "npm" });
                });
            }
            processNodeDependencies(parsedContent.dependencies, "univ:dep", deps);
            processNodeDependencies(parsedContent.devDependencies, "univ:devD", deps);
            processNodeDependencies(parsedContent.peerDependencies, "js:peer", deps);

            return {
                name: parsedContent.name,
                version: parsedContent.version,
                rm: rt,
                deps: dedupeDependencies(deps),
                ws,
                internal: FnCPFInternal,
            };
        },
    },
    Deno: {
        STD: internalParsers.DenoPkgFile,
        CPF: (content: string, ws: string[]): FnCPF => {
            try {
                const parsedContent = internalParsers.DenoPkgFile(content);

                if (!parsedContent.name || !parsedContent.version) {
                    throw new Error("Invalid deno.json(c) file");
                }

                const denoImportRegex = /^(?<source>[a-z]+):(?<package>@[a-zA-Z0-9_\-/]+)@(?<version>[~^<>=]*\d+\.\d+\.\d+)$/;
                // regex not mine. deno uses platform:@scope/package@version imports so we gotta do that.

                const deps: FnCPF["deps"] = [];

                Object.values(parsedContent.imports ?? {}).map((v) => {
                    const t = v.match(denoImportRegex); // Directly use the match result
                    if (t && t.groups && t.groups["package"] && t.groups["version"] && ["npm", "jsr"].includes(t.groups["source"] ?? "")) {
                        deps.push({
                            name: t.groups["package"], // Scope/package
                            ver: t.groups["version"], // Version
                            src: t.groups["source"] as "npm" | "jsr", // Platform
                            rel: "univ:dep",
                        });
                    }
                });

                return {
                    name: parsedContent.name,
                    version: parsedContent.version,
                    rm: "deno",
                    deps: dedupeDependencies(deps),
                    ws,
                    internal: FnCPFInternal,
                };
            } catch (e) {
                console.error(e);
                throw e;
            }
        },
    },
};
