import { Flush } from "../commands/settings.ts";
import TheUpdater from "../commands/updater.ts";
import type { CF_FKNODE_SCHEDULE } from "../types/config_files.ts";
import { GetAppPath, GetSettings } from "./config.ts";
import { GetDateNow, MakeRightNowDateStandard } from "./date.ts";
import { parse as parseYaml } from "@std/yaml";

export async function RunScheduledTasks() {
    try {
        const { updateFreq, logFlushFreq } = await GetSettings();
        const scheduleFile: CF_FKNODE_SCHEDULE = parseYaml(await Deno.readTextFile(await GetAppPath("SCHEDULE"))) as CF_FKNODE_SCHEDULE;

        const currentDate: Date = MakeRightNowDateStandard(GetDateNow());
        const CalculateDifference = (date: Date) => (currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

        const dates = {
            updater: {
                last: scheduleFile.updater.lastCheck,
                diff: CalculateDifference(
                    MakeRightNowDateStandard(scheduleFile.updater.lastCheck),
                ),
            },
            flusher: {
                last: scheduleFile.flusher.lastFlush,
                diff: CalculateDifference(
                    MakeRightNowDateStandard(scheduleFile.flusher.lastFlush),
                ),
            },
        };

        if (dates.updater.diff >= updateFreq) {
            await TheUpdater({
                silent: false,
            });
        }

        if (dates.flusher.diff >= logFlushFreq) {
            await Flush("logs", true);
        }
    } catch (e) {
        throw e;
    }
}
