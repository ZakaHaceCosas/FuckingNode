import { InteropedFeatures } from "./feature-module.ts";
import { dedupeDependencies, findDependency, internalValidators, Parsers } from "./parse-module.ts";
import { Installers } from "./installer-module.ts";

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
    IsPackageFileValid: {
        Golang: internalValidators.isPkgFileGolang,
        Cargo: internalValidators.isPkgFileCargo,
        Deno: internalValidators.isPkgFileDeno,
        NodeBun: internalValidators.isPkgFileNodeBun,
    },
    PackageFileUtils: {
        SpotDependency: findDependency,
        DedupeDependencies: dedupeDependencies,
    },
    Installers: {
        UniJs: Installers.UniJs,
        Cargo: Installers.Cargo,
        Golang: Installers.Golang,
    },
    Features: InteropedFeatures,
};
