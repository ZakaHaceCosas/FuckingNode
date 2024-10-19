import { I_LIKE_JS } from "./constants.ts";
import { GetDirSize, GetMotherfuckers, LogStuff } from "./functions.ts";

export default async function GetFuckingStats(includeSelf: boolean) {
    const mfs = await GetMotherfuckers();

    let totalSpace: number = 0;

    for (const mf of mfs) {
        let size = await GetDirSize(`${mf}/node_modules`);
        if (includeSelf) {
            size += await GetDirSize(mf);
        }

        let message: string = I_LIKE_JS.MF;

        if (size < 100) {
            message = "That's actually okay ngl.";
        } else if (size > 1000) {
            message = `Big ${I_LIKE_JS.MF}.`;
        } else if (size > 3000) {
            message = `Giant ${I_LIKE_JS.MF} (we're over a GB!)`;
        } else if (size > 9000) {
            message = `Insanely ${I_LIKE_JS.MFN} insane.`;
        } else if (size > 9999) {
            message =
                `WHAT THE ${I_LIKE_JS.FKN.toUpperCase} ${I_LIKE_JS.FK.toUpperCase} ARE YOU ${I_LIKE_JS.FKN.toUpperCase} CODING IN ${I_LIKE_JS.FKN.toUpperCase} THERE??`;
        }

        await LogStuff(
            `${mf} is taking ${size} MB in your drive. ${message}`,
        );

        totalSpace += size;
    }

    console.log("\n"); // glue stick fix
    await LogStuff(
        `In total, your ${I_LIKE_JS.MFS} are taking up to ${totalSpace} MB.`,
        "bruh",
    );
}
