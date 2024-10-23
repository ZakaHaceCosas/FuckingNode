import { I_LIKE_JS } from "./constants.ts";
import { GetDirSize, GetMotherfuckers, LogStuff } from "./functions.ts";

export default async function GetFuckingStats(includeSelf: boolean) {
    const mfs = await GetMotherfuckers();

    let totalSpace: number = 0;

    await LogStuff(`This is ${I_LIKE_JS.MFLY} going to take a while. Have a coffee meanwhile!`, "bruh");

    for (const mf of mfs) {
        let size = await GetDirSize(`${mf}/node_modules`);
        const selfSize = await GetDirSize(mf);
        if (!selfSize) {
            await LogStuff(`Feels like ${mf} doesn't exist?`, "error");
            continue;
        }
        if (!size) {
            await LogStuff(`${mf} doesn't have a node_modules DIR? What's up?`, "warn");
            continue;
        }

        if (includeSelf) {
            size += selfSize;
        }

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
            `${mf} is taking ${size.toFixed(3)} MB in your drive. ${message}`,
            "trash",
        );

        totalSpace += size;
    }

    console.log(""); // glue stick fix
    await LogStuff(
        `In total, your ${I_LIKE_JS.MFS} are taking up to ${totalSpace.toFixed(3)} MB.`,
        "bruh",
    );
}
