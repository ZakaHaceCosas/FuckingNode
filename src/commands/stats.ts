import { StringUtils, type UnknownString } from "@zakahacecosas/string-utils";
import { I_LIKE_JS } from "../constants.ts";
import { ColorString, LogStuff } from "../functions/io.ts";
import { GetProjectEnvironment, SpotProject } from "../functions/projects.ts";
import { NameProject } from "../functions/projects.ts";
import type { FnCPF } from "../types/platform.ts";

function StringifyDependencyRelationship(rel: FnCPF["deps"][0]["rel"]): string {
    return rel === "univ:dep"
        ? "Dependency"
        : rel === "univ:devD"
        ? "Dev Dependency"
        : rel === "js:peer"
        ? "JS Peer Dependency"
        : rel === "go:ind"
        ? "Indirect Dependency"
        : rel === "rst:buildD"
        ? "Rust Build Dependency"
        : "Dependency...?";
}

export default async function TheStatistics(target: UnknownString) {
    const project = await SpotProject(target);
    const env = await GetProjectEnvironment(project);
    const name = await NameProject(project, "all");

    await LogStuff(
        `${name} · ${ColorString(env.runtime, "bold")} runtime · ${ColorString(env.manager, "bold")} pkg manager`,
    );

    const maxDeps = 3;

    const realDeps = env.main.cpfContent.deps;
    const deps: string = realDeps
        .toSorted()
        .slice(0, maxDeps)
        .map((dep) =>
            `${ColorString(dep.name, "bold")}@${ColorString(dep.ver, "italic")} ${env.manager === "deno" ? `> ${dep.src}` : ""} # ${
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
            realDeps.length >= maxDeps ? `...and ${realDeps.length - maxDeps} more.\n` : "\n",
        );
    }

    if (env.manager === "go" || env.manager === "cargo") return;

    await LogStuff("Let's see how does your project compare to the Recommended Community Standards.", "chart");

    if (StringUtils.validateAgainst(env.runtime, ["node", "bun"])) {
        // deno-lint-ignore no-explicit-any
        const content = env.main.stdContent as any;

        const p = content.private;
        const l = content.license;
        const a = content.author;
        const c = content.contributors;
        const d = content.description;
        const r = content.repository;
        const b = content.bugs;
        const t = content.type;

        await LogStuff(
            p ? "This is a private project. Running generic checks." : "This is a public project. Running additional package checks.",
            "bulb",
        );

        await LogStuff(l ? `${l} license, good.` : "No license found. You should specify it!", l ? "tick" : "error");
        if (!p || a) {
            await LogStuff(
                a ? `Made by ${typeof a === "string" ? a : a.name}, nice.` : "No author found. Who made this 'great' code?",
                a ? "tick" : "error",
            );
        }
        await LogStuff(
            c
                ? `So we've got ${c.length} contributor(s), great.`
                : "No contributors found. If none, that's fine, but if someone helps, mention them.",
            c ? "tick" : "bruh",
        );
        await LogStuff(
            d ? `${ColorString(d, "italic")}, neat description.` : "No description found. What does your code even do?",
            d ? "tick" : "error",
        );
        if (!p) {
            await LogStuff(
                r ? `Known repo URL, awesome.` : "You didn't specify a repository, why?",
                r ? "tick" : "error",
            );
        }
        if (!p) {
            await LogStuff(
                b ? `Known bug-report URL, incredible.` : "You didn't specify where to report bugs. Don't be lazy and accept feedback!",
                b ? "tick" : "error",
            );
        }
        await LogStuff(
            t === "module"
                ? `This is an ESM project, lovely.`
                : `Using CommonJS is not 'wrong', but not right either. Consider switching to ESM, and if your tooling doesn't allow it, well, change your tooling :/${
                    t
                        ? ""
                        : "\nNote: The 'type' field was not specified, so Node assumes CJS. If it turns out you use ESM, specify type='module'."
                }`,
            t ? "tick" : "bruh",
        );
        return;
    } else {
        await LogStuff("Checking Deno project files isn't supported yet. It's planned to be added real soon."); // (TODO)
        return;
    }
}
