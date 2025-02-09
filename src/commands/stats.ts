import { I_LIKE_JS } from "../constants.ts";
import { ColorString, LogStuff } from "../functions/io.ts";
import { GetProjectEnvironment, SpotProject } from "../functions/projects.ts";
import { NameProject } from "../functions/projects.ts";
import type { FnCPF } from "../types/platform.ts";

function StringifyDependencyRelationship(rel: FnCPF["deps"][0]["rel"]): string {
    return rel === "univ:dep"
        ? "Dep"
        : rel === "univ:devD"
        ? "Dev dep"
        : rel === "js:peer"
        ? "JS Peer dep"
        : rel === "go:ind"
        ? "Indirect dep"
        : rel === "rst:buildD"
        ? "Rust Build dep"
        : "?Dep";
}

export default async function TheStatistics(target: string) {
    const project = await SpotProject(target);
    const env = await GetProjectEnvironment(project);
    const name = await NameProject(project, "all");

    await LogStuff(
        `${name}\n${ColorString(env.runtime, "bold")} runtime & ${ColorString(env.manager, "bold")} pkg manager`,
    );

    const maxDeps = 5;

    const realDeps = env.main.cpfContent.deps;
    const deps: string = realDeps
        .toSorted()
        .slice(0, maxDeps)
        .map((dep) =>
            `${ColorString(dep.name, "bold")}@${dep.ver} ${env.manager === "deno" ? `> ${dep.src}` : ""} # ${
                ColorString(StringifyDependencyRelationship(dep.rel), "italic", "half-opaque")
            }`
        )
        .join("\n");

    if (!deps || deps.length === 0) {
        await LogStuff("No dependencies found (impressive).");
    } else {
        await LogStuff(`\nDepends on ${ColorString(realDeps.length, "bold")} ${I_LIKE_JS.MFS}:`);
        await LogStuff(
            deps,
        );
        await LogStuff(
            realDeps.length >= maxDeps ? `...and ${realDeps.length - maxDeps} more.` : "",
        );
    }
}
