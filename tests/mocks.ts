import { GetAppPath } from "../src/functions/config.ts";
import { CONSTANTS } from "./constants.ts";

export const mocks = {
    readTextFile: () => {
        return async (path: string | URL): Promise<string> => {
            const resolvedPath = typeof path === "string" ? path : path.toString();
            switch (resolvedPath) {
                case await GetAppPath("MOTHERFKRS"):
                    return `${CONSTANTS.ENV_PATH}/test-one`; // we give /test-one instead of \\test-one in purpose to ensure paths are parsed before returning them
                default:
                    return await Deno.readTextFile(path);
            }
        };
    },
};
