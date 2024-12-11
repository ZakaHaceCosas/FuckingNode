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

    const USAGE = formatCmd([
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
    ]);

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

    const MANAGER_OPTIONS = formatCmd([
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
            "list [--ignored / --alive]",
            "Lists all of your added projects. You can use --ignored or --alive to filter ignored projects.",
        ],
        [
            "manager",
            "cleanup",
            "Shows invalid (invalid path, duplicates...) and lets you remove them.",
        ],
    ]);
    const CLEAN_OPTIONS = formatCmd([
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
            "Remove additional files and DIRs (e.g. 'dist/', 'out/', etc...) when cleaning. Requires you to specify files and DIRs to remove from the fknode.yaml).",
        ],
        [
            "--commit",
            null,
            `If your Git working tree was clean before ${APP_NAME.CASED} touched it, and you performed actions that change the code (e.g. --pretty or --update), it'll commit them using a default commit message. Requires "commitActions" to be set to true in your fknode.yaml. You can override the default commit message with "commitMessage" in your fknode.yaml.`,
        ],
    ]);
    const SETTINGS_OPTIONS = formatCmd([
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
        [
            "change",
            "<update-freq | default-int> <value>",
            "Allows to change chosen settings.",
        ],
    ]);
    const KICKSTART_OPTIONS = formatCmd([
        [
            "kickstart",
            "<git-url> [path] [manager]",
            "Clones the repo provided with <git-url> into specified [path], or CWD/<repo-name> if not given, and auto-installs dependencies with provided [manager], or pnpm by default. If you don't have pnpm it doesn't auto-choose another manager. Use pnpm >:D.",
        ],
    ]);
    const MIGRATE_OPTIONS = formatCmd([
        [
            "migrate",
            "<project> <target>",
            "Automatically migrates a given <project> to a given <target> package manager (npm, pnpm, and yarn). Does not support cross-runtime migration, and relies on each manager's ability to understand the other one's package manager formats.",
        ],
    ]);
    const ABOUT_OPTIONS = formatCmd([
        [
            "about",
            null,
            "Shows a simple (but cool looking!) about screen. No params taken. The sentence below the app name is randomized from an internal list, by the way.",
        ],
    ]);
    const HELP_OPTIONS = formatCmd([
        ["help", "[command]", "Shows help for the given command, or general help if no command (or invalid command) given."],
    ]);

    switch ((query ?? "").trim()) {
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
                `'settings' lets you view and manage settings related commands. Options:\n${SETTINGS_OPTIONS}`,
                undefined,
                true,
            );
            break;
        case "kickstart":
            await LogStuff(
                `'kickstart' allows you to kickstart a dev repo easily. Options:\n${KICKSTART_OPTIONS}`,
            );
            break;
        case "migrate":
            await LogStuff(MIGRATE_OPTIONS);
            break;
        case "about":
            await LogStuff(ABOUT_OPTIONS);
            break;
        case "help":
            await LogStuff(HELP_OPTIONS);
            break;
        case undefined:
        case "":
        default:
            await NoParamProvided();
            break;
    }
}
