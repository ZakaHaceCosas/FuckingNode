import { APP_NAME } from "../constants.ts";
import { ColorString, LogStuff, SpaceString } from "../functions/io.ts";
import type { TheHelperConstructedParams } from "./constructors/command.ts";

function joinObjectValues(obj: Record<string, string>): string {
    return Object.values(obj).join("\n");
}

export default async function TheHelper(params: TheHelperConstructedParams) {
    const { query } = params;

    const _USAGE = {
        clean: SpaceString("clean            <intensity> [--update] [--verbose]", 8),
        manager: SpaceString("manager          add <path> | remove <path> | ignore <path> | revive <path> | list | cleanup", 8),
        migrate: SpaceString("migrate", 8),
        self_update: SpaceString("upgrade", 8),
        version: SpaceString("[--version, -v]", 8),
        help: SpaceString("[--help, -h]", 8),
    };
    const USAGE = joinObjectValues(_USAGE);

    async function NoParamProvided() {
        await LogStuff(
            `Usage:  ${ColorString(APP_NAME.CLI, "bright-green")}\n${USAGE}\n`,
            undefined,
            true,
        );
        await LogStuff(
            ColorString("Pro tip: Run --help <command-name> to get help with a specific command.", "bright-yellow"),
            "bulb",
            true
        )
    }

    const _CLEAN_OPTIONS = {
        intensity: SpaceString(
            "<intensity> 'normal' | 'hard' | 'maxim'                 The higher, the deeper (but more time-consuming) the cleaning will be.",
            4,
        ),
        update: SpaceString("--update                                                Update all your projects before cleaning them.", 4),
        verbose: SpaceString("--verbose                                               Show more detailed ('verbose') logs.", 4),
    };
    const _MANAGER_OPTIONS = {
        add: SpaceString("add <path>                                                 Adds a project to your list.", 4),
        remove: SpaceString("remove <path>                                              Removes a project from your list.", 4),
        ignore: SpaceString(
            "ignore <path>                                              Ignores a project so it's not cleaned or updated but still on your list.",
            4,
        ),
        revive: SpaceString("revive <path>                                              Stops ignoring an ignored project.", 4),
        list: SpaceString("list                                                       Lists all of your added projects.", 4),
        cleanup: SpaceString(
            "cleanup                                                    Shows invalid (invalid path, duplicates...) and lets you remove them.",
            4,
        ),
    };
    const MANAGER_OPTIONS = joinObjectValues(_MANAGER_OPTIONS);
    const CLEAN_OPTIONS = joinObjectValues(_CLEAN_OPTIONS);
    const _SETTINGS = {
        flush: SpaceString(`flush <"logs" | "updates" | "projects" | "all"> [--force]  Flushes (removes) chosen config files.`, 4),
        schedule: SpaceString(`schedule <hour> <day>                                      Schedule ${APP_NAME.STYLED}'s cleanup.`, 4),
    };
    const SETTINGS = joinObjectValues(_SETTINGS);

    if (!query) {
        await NoParamProvided();
        return;
    }

    switch (query) {
        case "clean":
            await LogStuff(
                "'clean' will clean your added projects. Flags:\n" + CLEAN_OPTIONS,
                undefined,
                true,
            );
            break;
        case "manager":
            await LogStuff(
                "'manager' will let you manage projects. Flags:\n" + MANAGER_OPTIONS,
                undefined,
                true,
            );
            break;
        case "settings":
            await LogStuff(
                `Currently supported settings:\n` + SETTINGS,
                undefined,
                true,
            );
            break;
        case "":
        default:
            await NoParamProvided();
            break;
    }
}
