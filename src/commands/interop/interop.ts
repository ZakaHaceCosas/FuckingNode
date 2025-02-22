import { InteropedFeatures } from "./feature-module.ts";
import { dedupeDependencies, findDependency, Parsers } from "./parse-module.ts";
import { Installers } from "./installer-module.ts";
import { Generators } from "./pkggen-module.ts";
import { BareValidators } from "./validate-module.ts";

/**
 * Functions to help with interoperability.
 * @author ZakaHaceCosas
 */
export const FkNodeInterop = {
    PackageFileParsers: {
        Golang: {
            CPF: Parsers.Golang.CPF,
            STD: Parsers.Golang.STD,
        },
        Cargo: {
            CPF: Parsers.Cargo.CPF,
            STD: Parsers.Cargo.STD,
        },
        Deno: {
            CPF: Parsers.Deno.CPF,
            STD: Parsers.Deno.STD,
        },
        NodeBun: {
            CPF: Parsers.NodeBun.CPF,
            STD: Parsers.NodeBun.STD,
        },
    },
    BareValidators: BareValidators,
    PackageFileUtils: {
        SpotDependency: findDependency,
        DedupeDependencies: dedupeDependencies,
    },
    Installers: Installers,
    Features: InteropedFeatures,
    Generators: Generators,
};
