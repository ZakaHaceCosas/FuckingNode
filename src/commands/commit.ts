import { ColorString, LogStuff, ParseFlag } from "../functions/io.ts";
import { GetProjectEnvironment, NameProject, SpotProject } from "../functions/projects.ts";
import type { TheCommitterConstructedParams } from "./constructors/command.ts";
import { Commander } from "../functions/cli.ts";
import { Git } from "../utils/git.ts";
import { StringUtils } from "@zakahacecosas/string-utils";
import { FknError } from "../utils/error.ts";
import { isDis } from "../constants.ts";

export default async function TheCommitter(params: TheCommitterConstructedParams) {
    if (!StringUtils.validate(params.message)) throw new Error("No commit message specified!");

    const CWD = Deno.cwd();
    const project = await SpotProject(CWD);
    const env = await GetProjectEnvironment(project);

    if (!(await Git.IsRepo(project))) {
        throw new Error(
            "Are you serious right now? Making a commit without being on a Git repo...\nThis project isn't a Git repository. We can't commit to it.",
        );
    }

    const commitCmd = (!isDis(env.settings.commitCmd)) ? StringUtils.normalize(env.settings.commitCmd) : "disable";

    if (commitCmd !== "disable" && env.commands.run === "__UNSUPPORTED") {
        throw new FknError(
            "Interop__CannotRunJsLike",
            `Your fknode.yaml file has a commitCmd key, but ${env.manager} doesn't support JS-like "run" tasks, so we can't execute that task. To avoid undesired behavior, we stopped execution. Please remove the commitCmd key from this fknode.yaml. Sorry!`,
        );
    }

    const branches = await Git.GetBranches(project);

    const gitProps = {
        fileCount: (await Git.GetFilesReadyForCommit(project)).length,
        branch: (params.branch && !ParseFlag("push", true).includes(params.branch))
            ? branches.all.includes(StringUtils.normalize(params.branch)) ? params.branch : "__ERROR"
            : branches.current,
    };

    if (!StringUtils.validate(gitProps.branch) || gitProps.branch === "__ERROR") {
        throw new Error(
            params.branch
                ? `Given branch ${params.branch} wasn't found! These are your repo's branches:\n${
                    branches.all.toString().replaceAll(",", ", ")
                }.`
                : `For whatever reason we weren't able to identify your project's branches, so we can't commit. Sorry!`,
        );
    }

    const actions: string[] = [];

    if (commitCmd !== "disable") {
        // otherwise TS shows TypeError for whatever reason
        const typed: string[] = env.commands.run as string[];

        actions.push(
            `Run ${
                ColorString(
                    `${typed.join(" ")} ${commitCmd}`,
                    "bold",
                )
            }`,
        );
    }

    actions.push(
        `If everything above went alright, commit ${ColorString(gitProps.fileCount, "bold")} file(s) to branch ${
            ColorString(gitProps.branch, "bold")
        } with message "${ColorString(params.message.trim(), "bold", "italic")}"`,
    );

    if (params.push) {
        actions.push(
            "If everything above went alright, push all commits to GitHub",
        );
    }

    const confirmation = await LogStuff(
        `Heads up! We're about to take the following actions:\n${actions.join("\n")}\n\n- all of this at ${await NameProject(
            project,
            "all",
        )}`,
        "heads-up",
        "red",
        true,
    );

    if (!confirmation) return;

    // run their commitCmd
    if (commitCmd !== "disable") {
        const commitCmdOutput = await Commander(
            env.commands.run[0],
            [env.commands.run[1], commitCmd],
            false,
        );

        if (!commitCmdOutput.success) {
            throw new FknError(
                "Commit__Fail__CommitCmd",
                `Commit command (${commitCmd}) exited with a non-0 exit code. Check what's up!`,
            ).debug(commitCmdOutput.stdout);
        }
    }

    // by this point we assume prev task succeeded
    await Git.Commit(
        project,
        params.message,
        "none",
        [],
    );

    if (params.push) {
        // push stuff to git
        const pushOutput = await Git.Push(project, gitProps.branch);
        if (pushOutput === 1) {
            throw new Error(`Git push failed unexpectedly.`);
        }
    }

    Deno.chdir(CWD);
    await LogStuff(`That worked out! Commit "${params.message}" should be live now.`, "tick", ["bold", "bright-green"]);
    return;
}
