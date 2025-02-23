import { CheckForPath, JoinPaths } from "../functions/filesystem.ts";
import { ColorString, LogStuff, StringifyYaml } from "../functions/io.ts";
import { deepMerge, GetProjectEnvironment, NameProject, SpotProject } from "../functions/projects.ts";
import type { TheSetuperConstructedParams } from "./constructors/command.ts";
import { StringUtils } from "@zakahacecosas/string-utils";
import { parse as parseYaml } from "@std/yaml";
import { parse as parseJsonc } from "@std/jsonc";
import { SETUPS, VISIBLE_SETUPS } from "./toolkit/setups.ts";

export default async function TheSetuper(params: TheSetuperConstructedParams) {
    if (!StringUtils.validate(params.setup)) {
        await LogStuff(StringUtils.table(VISIBLE_SETUPS));
        await LogStuff(
            "You either didn't provide a project / target setup or provided invalid ones, so up here are all possible setups.",
        );
        return;
    }

    const project = await SpotProject(params.project);
    const env = await GetProjectEnvironment(project);
    const desiredSetup = StringUtils.normalize(params.setup, true);
    const setupToUse = SETUPS.find((s) => (StringUtils.normalize(s.name, true)) === desiredSetup);

    if (
        !setupToUse
    ) throw new Error(`Given setup ${params.setup} is not valid! Choose from the list ${SETUPS.map((s) => s.name)}.`);

    const path = JoinPaths(env.root, setupToUse.seek);
    const exists = CheckForPath(path);

    if (
        !(await LogStuff(
            `Should we add the ${ColorString(setupToUse.name, "bold")} ${ColorString(setupToUse.seek, "italic")} file to ${await NameProject(
                project,
                "name-ver",
            )}?${
                exists
                    ? setupToUse.seek === "tsconfig.json"
                        ? "\nNote: Your existing tsconfig.json will be merged with this template. Comments won't be preserved!"
                        : `\nNote: Your existing ${setupToUse.seek} will be merged with this template. Duplications may happen.`
                    : ""
            }`,
            "what",
            undefined,
            true,
        ))
    ) {
        await LogStuff("Alright. No changes made.", "tick");
        return;
    }

    let finalContent: string;

    if (exists) {
        const fileContent = await Deno.readTextFile(path);
        if (setupToUse.seek === "tsconfig.json") {
            const parsedContent = parseJsonc(fileContent);
            finalContent = JSON.stringify(deepMerge(setupToUse.content, parsedContent), undefined, 4);
        } else if (setupToUse.seek === "fknode.yaml") {
            const parsedContent = parseYaml(fileContent);
            finalContent = StringifyYaml(deepMerge(setupToUse.content, parsedContent));
        } else {
            // (gitignore or editorconfig)
            finalContent = `${fileContent}\n${setupToUse.content}`;
        }
    } else {
        finalContent = setupToUse.seek === "fknode.yaml"
            ? StringifyYaml(setupToUse.content)
            : setupToUse.seek === "tsconfig.json"
            ? JSON.stringify(setupToUse.content, undefined, 4)
            : setupToUse.content.toString();
    }

    await Deno.writeTextFile(
        path,
        finalContent,
    );

    await LogStuff("Done!", "tick");
}
