import { StringUtils } from "@zakahacecosas/string-utils";
import type { CargoPkgFile, DenoPkgFile, GolangPkgFile, NodePkgFile } from "../../types/platform.ts";
import { parse } from "@std/semver";
import { isObject } from "../../functions/projects.ts";

/** Bare-minimum validation. */
export const BareValidators = {
    // deno-lint-ignore no-explicit-any
    Cargo: (obj: any): obj is CargoPkgFile => {
        return obj && isObject(obj) && obj.package && obj.package.name && StringUtils.validate(obj.package.name);
    },

    // deno-lint-ignore no-explicit-any
    Golang: (obj: any): obj is GolangPkgFile => {
        return obj && isObject(obj) && obj.module && StringUtils.validate(obj.module) && obj.go &&
            StringUtils.validate(obj.go);
    },

    // deno-lint-ignore no-explicit-any
    Deno: (obj: any): obj is DenoPkgFile => {
        try {
            parse(obj.version);
        } catch {
            return false;
        }

        return obj && isObject(obj) && obj.name && StringUtils.validate(obj.name) && obj.version && StringUtils.validate(obj.version);
    },

    // deno-lint-ignore no-explicit-any
    NodeBun: (obj: any): obj is NodePkgFile => {
        try {
            parse(obj.version);
        } catch {
            return false;
        }

        return obj && isObject(obj) && obj.name && StringUtils.validate(obj.name) && obj.version && StringUtils.validate(obj.version);
    },
};
