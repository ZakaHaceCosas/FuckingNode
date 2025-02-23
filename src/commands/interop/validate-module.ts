import { StringUtils } from "@zakahacecosas/string-utils";
import type { CargoPkgFile, DenoPkgFile, GolangPkgFile, NodePkgFile } from "../../types/platform.ts";
import { parse } from "@std/semver";
import { isObject } from "../../functions/projects.ts";

/** Bare-minimum validation. */
export const BareValidators = {
    // deno-lint-ignore no-explicit-any
    Cargo: (obj: any): obj is CargoPkgFile => {
        return isObject(obj) && obj["package"] && StringUtils.validate(obj["package"]["name"]);
    },

    // deno-lint-ignore no-explicit-any
    Golang: (obj: any): obj is GolangPkgFile => {
        return isObject(obj) && StringUtils.validate(obj["module"]) &&
            StringUtils.validate(obj["go"]);
    },

    // deno-lint-ignore no-explicit-any
    Deno: (obj: any): obj is DenoPkgFile => {
        try {
            parse(obj.version);
        } catch {
            return false;
        }

        return isObject(obj) && StringUtils.validate(obj["name"]) && StringUtils.validate(obj["version"]);
    },

    // deno-lint-ignore no-explicit-any
    NodeBun: (obj: any): obj is NodePkgFile => {
        try {
            parse(obj.version);
        } catch {
            return false;
        }

        return isObject(obj) && StringUtils.validate(obj["name"]) && StringUtils.validate(obj["version"]);
    },
};
