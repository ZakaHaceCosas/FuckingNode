import { APP_NAME } from "../constants.ts";
import { ColorString, LogStuff, SpaceString } from "../functions/io.ts";
import type { TheHelperConstructedParams } from "./constructors/command.ts";

type helpItem = [string, string | null, string];
type helpThing = helpItem[];

function formatCmd(obj: helpThing): string {
    const strings: string[] = [];

    for (const thingy of obj) {
        const cmd: string = ColorString(thingy[0], "bright-blue");
        const params: string | null = thingy[1] ? ColorString(thingy[1], "italic") : null;
        const desc: string = thingy[2];

        strings.push(`${cmd} ${ColorString(params ?? "", "bold")}\n${SpaceString(desc, 2)}`);
    }

    return strings.join("\n----\n");
}

export default async function TheHelper(params: TheHelperConstructedParams) {
    const { query } = params;

    const _USAGE: helpThing = [
        [
            "clean",
            "<intensity | --> [--update] [--verbose] [--lint] [--pretty] [--commit]",
            "Cleans all of your projects.",
        ],
        [
            "manager",
            "add <path> | remove <path> | ignore <path> | revive <path> | list | cleanup",
            "Manages your projects.",
        ],
        [
            "kickstart",
            "<git-url> [path] [npm | pnpm | yarn | deno | bun]",
            `Quickly clones a repo, installs deps, setups ${APP_NAME.CASED}, and opens Visual Studio Code.`,
        ],
        [
            "settings",
            "[setting] [extra parameters]",
            "Allows to change the CLIs setting. Run it without args to see current settings.",
        ],
        [
            "migrate",
            "<target>",
            "Migrates a project from one package manager to another and reinstalls deps.",
        ],
        ["upgrade", null, "Checks for updates."],
        ["about", null, "Shows info about the app."],
        ["--version, -v", null, "Shows current version."],
        [
            "--help, -h",
            "[command]",
            "Shows this menu, or the help menu for a specific command, if provided.",
        ],
    ];
    const USAGE = formatCmd(_USAGE);

    async function NoParamProvided() {
        await LogStuff(
            `Usage: ${ColorString(APP_NAME.CLI, "bright-green")} <command> [params...]\n\n${USAGE}\n`,
            undefined,
            true,
        );
        await LogStuff(
            ColorString(
                "Pro tip: Run --help <command-name> to get help with a specific command.",
                "bright-yellow",
            ),
            "bulb",
            true,
        );
    }

    const _CLEAN_OPTIONS: helpThing = [
        [
            "clean",
            "<intensity>",
            "'normal' | 'hard' | 'maxim' - The higher, the deeper (but more time-consuming) the cleaning will be.",
        ],
        [
            "--update",
            null,
            "Update all your projects before cleaning them.",
        ],
        ["--verbose", null, "Show more detailed ('verbose') logs."],
        [
            "--lint",
            null,
            "Lint the project's code if possible. You'll need either ESLint in your devDependencies or a custom lint script specified in the fknode.yaml.",
        ],
        [
            "--pretty",
            null,
            "Prettify the project's code if possible. You'll need either Prettier in your devDependencies or a custom prettify script specified in the fknode.yaml.",
        ],
        [
            "--destroy",
            null,
            "Remove additional files and DIRs (e.g. 'dist/', 'out/', etc...) when cleaning. Requires you to specify files and DIRs to remove from the fknode.yaml)."
        ],
        [
            "--commit",
            null,
            `If your Git working tree was clean before ${APP_NAME.CASED} touched it, and you performed actions that change the code (e.g. --pretty or --update), it'll commit them using a default commit message. Requires "commitActions" to be set to true in your fknode.yaml. You can override the default commit message with "commitMessage" in your fknode.yaml.`
        ]
    ];
    const _MANAGER_OPTIONS: helpThing = [
        [
            "manager",
            "add <path>",
            "Adds a project to your list.",
        ],
        [
            "manager",
            "remove <path>",
            "Removes a project from your list.",
        ],
        [
            "manager",
            "ignore <path>",
            "Ignores a project so it's not cleaned or updated but still on your list.",
        ],
        [
            "manager",
            "revive <path>",
            "Stops ignoring an ignored project.",
        ],
        [
            "manager",
            "list",
            "Lists all of your added projects.",
        ],
        [
            "manager",
            "cleanup",
            "Shows invalid (invalid path, duplicates...) and lets you remove them.",
        ],
    ];

    const MANAGER_OPTIONS = formatCmd(_MANAGER_OPTIONS);
    const CLEAN_OPTIONS = formatCmd(_CLEAN_OPTIONS);

    const _SETTINGS: helpThing = [
        [
            "flush",
            "<'logs' | 'updates' | 'projects' | 'all'> [--force]",
            "Flushes (removes) chosen config files.",
        ],
        [
            "schedule",
            `<hour> <day>`,
            `Schedule ${APP_NAME.STYLED}'s cleanup.\n  Runs every <day> days at the <hour> of the day.\n  "schedule 15 3", will schedule the cleaner to run with your default intensity every 3 days at 15:00.`,
        ],
        [
            "auto-flush",
            `<day>`,
            `Schedule flushing files every <day> days. Only supports flushing log files.`,
        ],
        [
            "repair",
            null,
            `Resets all settings to their default value.`,
        ],
    ];
    const SETTINGS = formatCmd(_SETTINGS);

    if (!query) {
        await NoParamProvided();
        return;
    }

    switch (query) {
        case "clean":
            await LogStuff(
                "'clean' will clean your added projects. Flags:\n" +
                    CLEAN_OPTIONS,
                undefined,
                true,
            );
            break;
        case "manager":
            await LogStuff(
                "'manager' will let you manage projects. Flags:\n" +
                    MANAGER_OPTIONS,
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
