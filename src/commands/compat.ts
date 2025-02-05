import { StringUtils } from "@zakahacecosas/string-utils";
import { ColorString, LogStuff } from "../functions/io.ts";
import type { TheCompaterConstructedParams } from "./constructors/command.ts";
import { APP_URLs } from "../constants.ts";

const indicators = {
    y: ColorString("Yes", "bright-green"),
    n: ColorString("No", "red"),
    p: ColorString("Partial", "orange"),
};

const featureCompatibility = [
    { Feature: "Cleanup", NodeJS: indicators.y, Deno: indicators.p, Bun: indicators.p, Go: indicators.p, Cargo: indicators.y },
    { Feature: "Kickstart", NodeJS: indicators.y, Deno: indicators.y, Bun: indicators.y, Go: indicators.y, Cargo: indicators.y },
    { Feature: "Commit", NodeJS: indicators.y, Deno: indicators.y, Bun: indicators.y, Go: indicators.p, Cargo: indicators.p },
    { Feature: "Release", NodeJS: "npm", Deno: "jsr", Bun: "npm", Go: indicators.y, Cargo: indicators.y },
];

const advancedFeatureCompatibility = [
    { Option: "Lint", NodeJS: indicators.y, Deno: indicators.y, Bun: indicators.y, Go: indicators.y, Cargo: indicators.y },
    { Option: "Pretty", NodeJS: indicators.y, Deno: indicators.p, Bun: indicators.y, Go: indicators.y, Cargo: indicators.y },
    { Option: "Destroy", NodeJS: indicators.y, Deno: indicators.y, Bun: indicators.y, Go: indicators.y, Cargo: indicators.y },
    { Option: "Update", NodeJS: indicators.y, Deno: indicators.y, Bun: indicators.y, Go: indicators.y, Cargo: indicators.y },
];

const kickstartCompatibility = [
    { NodeJS: indicators.y, Deno: indicators.y, Bun: indicators.y, Go: indicators.y, Cargo: indicators.y },
];

const migrateCompatibility = [
    { From: "NodeJS", To: "Deno", Supported: indicators.n },
    { From: "NodeJS", To: "Bun", Supported: indicators.y },
    { From: "Deno", To: "NodeJS", Supported: indicators.n },
    { From: "Bun", To: "NodeJS", Supported: indicators.y },
    { From: "---", To: "---", Supported: "---" },
    { From: "NodeJS / npm", To: "pnpm / yarn", Supported: indicators.y },
    { From: "NodeJS / pnpm", To: "npm / yarn", Supported: indicators.y },
    { From: "NodeJS / yarn", To: "npm / pnpm", Supported: indicators.y },
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
        await LogStuff(StringUtils.table(featureCompatibility));
        await LogStuff("For specific compatibility details, run 'compat' followed by any of these: cleaner, kickstart, migrate.");
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
            await LogStuff(StringUtils.table(advancedFeatureCompatibility));
            return;
        case "kickstart":
            await LogStuff("KICKSTART FEATURE SUPPORT ---");
            await LogStuff(StringUtils.table(kickstartCompatibility));
            // IDEs too, this is simple so i ain't extracting to a constant
            await LogStuff(StringUtils.table([
                { "Supported IDEs": ["VSCode", "VSCodium", "Notepad++", "Sublime", "Emacs", "Atom"] },
            ]));
            return;
        case "migrate":
            await LogStuff("MIGRATE FEATURES SUPPORT ---");
            await LogStuff(StringUtils.table(migrateCompatibility));
            return;
        default:
            await overallSupport();
            return;
    }
}
