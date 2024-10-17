import { GetDirSize, GetMotherfuckers, LogStuff } from "./functions.ts";

export default async function GetFuckingStats(includeSelf: boolean) {
    const mfs = await GetMotherfuckers();
    for (const mf of mfs) {
        let size = await GetDirSize(`${mf}/node_modules`);
        if (includeSelf) {
            size += await GetDirSize(mf);
        }

        let message: string = "Motherfucker.";

        if (size > 1000) {
            message = "Big motherfucker.";
        } else if (size > 3000) {
            message = "Big ass motherfucker (we're over a GB!)";
        } else if (size > 9000) {
            message = "Insanely motherfucking insane.";
        } else if (size > 9999) {
            message = "WHAT THE FUCKING FUCK ARE YOU FUCKING CODING IN FUCKING THERE??";
        }

        await LogStuff(
            `${mf} is taking ${size} MB in your drive. ${message}`,
        );
    }
}
