import { I_LIKE_JS } from "./constants.ts";
import { CheckForPath, GetAllProjects, GetDirSize, JoinPaths, LogStuff, ParsePath } from "./functions.ts";

export default async function TheStatistics() {
    const projects = await GetAllProjects();

    let totalSpace: number = 0;

    await LogStuff(`This is ${I_LIKE_JS.MFLY} going to take a while. Have a coffee meanwhile!`, "bruh");

    for (const project of projects) {
        const workingPath = ParsePath("path", project) as string;

        const nodeGarbagePath = JoinPaths(workingPath, "node_modules");

        if (!(await CheckForPath(workingPath))) {
            await LogStuff(`${workingPath} doesn't exist?`, "warn");
            continue;
        }
        if (!(await CheckForPath(nodeGarbagePath))) {
            await LogStuff(`${workingPath} doesn't have a node_modules DIR. What's up?`, "warn");
            continue;
        }

        let size = await GetDirSize(nodeGarbagePath);
        size += await GetDirSize(workingPath);

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
                `WHAT THE ${I_LIKE_JS.FKN.toUpperCase} ${I_LIKE_JS.FK.toUpperCase} ARE YOU ${I_LIKE_JS.FKN.toUpperCase} CODING IN ${I_LIKE_JS.FKN.toUpperCase} THERE??`;
        }

        await LogStuff(
            `${workingPath} is taking ${size.toFixed(2)}MB. ${message}`,
            "trash",
        );

        totalSpace += size;
    }

    console.log(""); // glue stick fix
    await LogStuff(
        `In total, your ${I_LIKE_JS.MFS} are taking up to ${totalSpace.toFixed(2)}MB.`,
        "bruh",
    );
}
