import { GetProjectEnvironment, SpotProject } from "../functions/projects.ts";
import { LaunchUserIDE } from "../functions/user.ts";
import type { TheLauncherConstructedParams } from "./constructors/command.ts";
import { FkNodeInterop } from "./interop/interop.ts";

export default async function TheLauncher(params: TheLauncherConstructedParams) {
    const path = await SpotProject(params.project);

    Deno.chdir(path);

    await LaunchUserIDE();
    await FkNodeInterop.Features.Update({
        env: await GetProjectEnvironment(path),
        verbose: true,
    });
    // TODO: add launchCmd
}
