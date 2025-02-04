import { StringUtils } from "@zakahacecosas/string-utils";
import { ColorString, LogStuff } from "../functions/io.ts";
import type { TheCompaterConstructedParams } from "./constructors/command.ts";
import { APP_URLs } from "../constants.ts";

const featureCompatibility = [
    { Feature: "Cleanup", NodeJS: "Yes", Deno: "Partial", Bun: "Partial", Go: "Partial", Cargo: "No" },
    { Feature: "Kickstart", NodeJS: "Yes", Deno: "Yes", Bun: "Yes", Go: "Yes", Cargo: "Yes" },
    { Feature: "Commit", NodeJS: "Yes", Deno: "Yes", Bun: "Yes", Go: "Partial", Cargo: "Partial" },
    { Feature: "Release", NodeJS: "npm", Deno: "jsr", Bun: "npm", Go: "No", Cargo: "No" },
];

const advancedFeatureCompatibility = [
    { Option: "Lint", NodeJS: "Yes", Deno: "No", Bun: "Yes", Go: "No", Cargo: "No" },
    { Option: "Pretty", NodeJS: "Yes", Deno: "Partial", Bun: "Yes", Go: "Yes", Cargo: "Yes (untested)" },
    { Option: "Destroy", NodeJS: "Yes", Deno: "Yes", Bun: "Yes", Go: "Yes", Cargo: "Yes" },
    { Option: "Update", NodeJS: "Yes", Deno: "Yes", Bun: "Yes", Go: "Yes", Cargo: "Yes" },
];

const kickstartCompatibility = [
    { Feature: "Kickstart itself", NodeJS: "Yes", Deno: "Yes", Bun: "Yes", Go: "Yes", Cargo: "Yes" },
];

const migrateCompatibility = [
    { From: "NodeJS", To: "Deno", Supported: "NO" },
    { From: "NodeJS", To: "Bun", Supported: "YES" },
    { From: "Deno", To: "NodeJS", Supported: "NO" },
    { From: "Bun", To: "NodeJS", Supported: "YES" },
    { From: "------" },
    { From: "NodeJS / npm", To: "pnpm / yarn", Supported: "YES" },
    { From: "NodeJS / pnpm", To: "npm / yarn", Supported: "YES" },
    { From: "NodeJS / yarn", To: "npm / pnpm", Supported: "YES" },
];

export default async function TheCompater(params: TheCompaterConstructedParams) {
    await LogStuff(
        `${
            ColorString("This table shows feature compatibility across environments.", "bold")
        }\nMore details available at ${APP_URLs.WEBSITE}/manual/cross-runtime`,
        "bulb",
    );

    const overallSupport = async () => {
        await LogStuff("OVERALL SUPPORT ---");
        console.table(featureCompatibility);
        await LogStuff("\nFor specific compatibility details, run 'compat' followed by any of these: cleaner, kickstart, migrate.");
        return;
    };

    if (!StringUtils.validate(params.target)) {
        await overallSupport();
        return;
    }

    switch (StringUtils.normalize(params.target, true, true)) {
        case "cleaner":
        case "advanced":
            await LogStuff("ADVANCED CLEANER FEATURES SUPPORT ---");
            console.table(advancedFeatureCompatibility);
            return;
        case "kickstart":
            await LogStuff("KICKSTART FEATURES SUPPORT ---");
            console.table(kickstartCompatibility);
            // IDEs too, this is simple so i ain't extracting to a constant
            console.table([
                { "Supported IDEs": ["VSCode", "VSCodium", "Notepad++", "Sublime", "Emacs", "Atom"] },
            ]);
            return;
        case "migrate":
            await LogStuff("MIGRATE FEATURES SUPPORT ---");
            console.table(migrateCompatibility);
            return;
        default:
            await overallSupport();
            return;
    }
}
