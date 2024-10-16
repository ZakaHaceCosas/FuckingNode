import { iLikeJs } from "./constants.ts";
import { GetDirSize, GetMotherfuckers, LogStuff } from "./functions.ts";

export default async function GetFuckingStats(includeSelf: boolean) {
    const mfs = await GetMotherfuckers();

    let totalSpace: number = 0;

    for (const mf of mfs) {
        let size = await GetDirSize(`${mf}/node_modules`);
        if (includeSelf) {
            size += await GetDirSize(mf);
        }

        let message: string = iLikeJs.mf;

        if (size < 100) {
            message = "That's actually okay ngl.";
        } else if (size > 1000) {
            message = `Big ${iLikeJs.mf}.`;
        } else if (size > 3000) {
            message = `Giant ${iLikeJs.mf} (we're over a GB!)`;
        } else if (size > 9000) {
            message = `Insanely ${iLikeJs.mfn} insane.`;
        } else if (size > 9999) {
            message =
                `WHAT THE ${iLikeJs.fkn.toUpperCase} ${iLikeJs.f.toUpperCase} ARE YOU ${iLikeJs.fkn.toUpperCase} CODING IN ${iLikeJs.fkn.toUpperCase} THERE??`;
        }

        await LogStuff(
            `${mf} is taking ${size} MB in your drive. ${message}`,
        );

        totalSpace += size;
    }

    console.log("\n"); // glue stick fix
    await LogStuff(
        `In total, your ${iLikeJs.mfs} are taking up to ${totalSpace} MB.`,
        "bruh",
    );
}
