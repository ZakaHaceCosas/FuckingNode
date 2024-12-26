import { I_LIKE_JS } from "../constants.ts";
import { CheckForPath, ParsePath } from "../functions/filesystem.ts";
import { ColorString, LogStuff } from "../functions/io.ts";
import { GetProjectEnvironment, SpotProject } from "../functions/projects.ts";
import { NameProject } from "../functions/projects.ts";
import type { DenoPkgJson, NodePkgJson } from "../types/runtimes.ts";

export default async function TheStatistics(target: string) {
    const project = await SpotProject(target);
    if (!project || !(await CheckForPath(project))) {
        await LogStuff(`We couldn't find a project in ${await ParsePath(target)}. What's up?`, "warn");
        return;
    }

    const env = await GetProjectEnvironment(project);
    const name = await NameProject(project, "all");

    await LogStuff(
        `${name}\n${ColorString(env.runtime, "bold")} runtime & ${ColorString(env.manager, "bold")} pkg manager\nMain file: ${env.main}`,
    );

    let deps: Record<string, string> | undefined;
    switch (env.runtime) {
        case "deno":
            deps = (env.main.content as DenoPkgJson).imports;
            break;
        case "bun":
        case "node":
            deps = (env.main.content as NodePkgJson).dependencies;
            break;
    }

    if (!deps) {
        await LogStuff("No dependencies found (impressive).");
    } else {
        await LogStuff(`\nDepends on ${ColorString(Object.keys(deps).length, "bold")} ${I_LIKE_JS.MFS}:\n${
            ColorString(
                `${
                    Object.entries(deps)
                        .map(([dep, version]) => `${dep}@${version}`)
                        .join("\n")
                }`,
                "bold",
            )
        }`);
    }
}
