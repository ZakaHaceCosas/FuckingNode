import { I_LIKE_JS } from "../constants.ts";
import { CheckForPath, GetDirSize, ParsePath } from "../functions/filesystem.ts";
import { LogStuff } from "../functions/io.ts";
import { SpotProject } from "../functions/projects.ts";
import { NameProject } from "../functions/projects.ts";

export default async function TheStatistics(target: string) {
    const project = await SpotProject(target);
    if (!project || !(await CheckForPath(project))) {
        await LogStuff(`We couldn't find a project in ${await ParsePath(target)}. What's up?`, "warn");
        return;
    }

    // await LogStuff(`This is ${I_LIKE_JS.MFLY} going to take a while. Have a coffee meanwhile!`, "bruh");

    const size = await GetDirSize(project);

    let message: string = I_LIKE_JS.MF;

    if (size < 50) {
        message = "That's actually okay ngl.";
    } else if (size > 500) {
        message = `Big ${I_LIKE_JS.MF}.`;
    } else if (size > 1000) {
        message = `Giant ${I_LIKE_JS.MF} (we're over a GB!)`;
    } else if (size > 5000) {
        message = `Insanely ${I_LIKE_JS.MFN} insane.`;
    } else if (size > 9999) {
        message =
            `WHAT THE ${I_LIKE_JS.FKN.toUpperCase()} ${I_LIKE_JS.FK.toUpperCase()} ARE YOU ${I_LIKE_JS.FKN.toUpperCase()} CODING IN ${I_LIKE_JS.FKN.toUpperCase()} THERE??`;
    }

    const name = await NameProject(project, "name");
    await LogStuff(
        `${name} is taking ${size.toFixed(2)}MB. ${message}`,
        "trash",
    );
}
