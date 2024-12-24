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
            "<intensity | --> [--update] [--verbose] [--lint] [--pretty] [--commit] [--destroy]",
            "Cleans all of your projects.",
        ],
        [
            "manager",
            "add <path> | remove <path> | list | cleanup",
            "Manages your projects.",
        ],
        [
            "kickstart",
            "<git-url> [path] [npm | pnpm | yarn | deno | bun]",
            `Quickly clones a repo, installs deps, setups ${APP_NAME.CASED}, and opens your favorite editor.`,
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
        );
        await LogStuff(
            ColorString(
                "Pro tip: Run --help <command-name> to get help with a specific command.",
                "bright-yellow",
            ),
            "bulb",
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
            "<intensity> [...flags]",
            "'normal' | 'hard' | 'hard-only' | 'maxim' - The higher, the deeper (but more time-consuming) the cleaning will be.",
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
            "Remove additional files and DIRs (e.g. 'dist/', 'out/', etc...) when cleaning. Requires you to specify files and DIRs to remove in the fknode.yaml.",
        ],
        [
            "--commit",
            null,
            `Commit any action that changes the code (e.g. --pretty or --update) when all of these are true:\n${
                SpaceString(`- "commitActions" is set to true in your fknode.yaml.`, 4)
            }\n${SpaceString(`- Local working tree was clean before ${APP_NAME.CASED} touched it.`, 4)}\n${
                SpaceString(`- Local repo is not behind upstream.`, 4)
            }\n  Uses a default commit message; override it by setting "commitMessage" in your fknode.yaml.`,
        ],
    ]);
    const SETTINGS_OPTIONS = formatCmd([
        [
            "flush",
            "<'logs' | 'updates' | 'projects' | 'all'> [--force]",
            "Flushes (removes) chosen config files.",
        ],
        [
            "repair",
            null,
            `Resets all settings to their default value.`,
        ],
        [
            "change",
            "<update-freq | default-int | fav-editor> <value>",
            "Allows to change chosen settings.",
        ],
    ]);
    const KICKSTART_OPTIONS = formatCmd([
        [
            "kickstart",
            "<git-url> [path] [manager]",
            "Clones <git-url> to [path] (or ./<repo-name> by default), installs deps with [manager] (or default (pnpm, bun, or deno) if not given), opens your editor (VSCode by default, change from settings), and adds the project to your list.",
        ],
    ]);
    const MIGRATE_OPTIONS = formatCmd([
        [
            "migrate",
            "<project> <target>",
            "Automatically migrates a given <project> to a given <target> package manager (npm, pnpm, and yarn). Does not support cross-runtime migration, and relies on each manager's ability to understand the other one's package manager formats.",
        ],
    ]);
    const UPGRADE_OPTIONS = formatCmd([
        [
            "upgrade",
            null,
            "Checks for updates.",
        ],
    ]);
    const ABOUT_OPTIONS = formatCmd([
        [
            "about",
            null,
            "Shows a simple (but cool looking!) about screen. No params taken. Includes random sentences below the logo.",
        ],
    ]);
    const HELP_OPTIONS = formatCmd([
        [
            "help",
            "[command]",
            "Shows help for the given command, or general help if no command (or invalid command) given.",
        ],
    ]);

    switch ((query ?? "").trim()) {
        case "clean":
            await LogStuff(
                `'clean' will clean your added projects. Options and flags:\n${CLEAN_OPTIONS}`,
            );
            break;
        case "manager":
            await LogStuff(
                `'manager' will let you manage projects. Options:\n${MANAGER_OPTIONS}`,
            );
            break;
        case "settings":
            await LogStuff(
                `'settings' lets you manage app configurations and more. Options:\n${SETTINGS_OPTIONS}`,
            );
            break;
        case "kickstart":
            await LogStuff(
                `'kickstart' allows you to kickstart a repo easily. Options:\n${KICKSTART_OPTIONS}`,
            );
            break;
        case "migrate":
            await LogStuff(MIGRATE_OPTIONS);
            break;
        case "UPGRADE":
            await LogStuff(UPGRADE_OPTIONS);
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
