/**
 * @file audit-v4.ts
 * @author ZakaHaceCosas
 *
 * This file only contains the new JSON-based, npm / pnpm / yarn compatible audit parser.
 *
 * HEAVY WORK IN PROGRESS. I might release V3 without this if it takes too long.
 */

import { StringUtils } from "@zakahacecosas/string-utils";

function ParseNodeReport(report: string, platform: "npm" | "pnpm" | "yarn") {
    /**
     * `yarn audit --json` returns something like THIS:
     * ```json
     * {"jsonThing": "hi"}
     * {"otherJsonThing": "uhh"}
     * // ...
     * ```
     * which is stupid, BECAUSE THAT IS _NOT_ VALID JSON! therefore the name of the variable
     */
    const yarnStupidJsonFormat = StringUtils.softlyNormalizeArray(report.split("\n")).filter((s) => s.includes('{"type":"auditAdvisory"')).map((
        s,
    ) => JSON.parse(s));

    const json = platform === "yarn" ? yarnStupidJsonFormat : JSON.parse(report);

    console.debug(platform, json);

    // TODO - go through hell again and build another cross-platform audit parser
    // because my stupid past self didn't want to use JSON because of how messed up yarn JSON is
}
