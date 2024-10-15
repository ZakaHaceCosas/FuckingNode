// app version
export const VERSION = "1.0.0";

// help
const _USAGE = {
    clean: "    clean   [--update] [--verbose]",
    add: "    manager add <item> | remove <item> | list",
    version: "            [--version]",
    help: "            [--help]",
};
const USAGE = _USAGE.clean +
    "\n" +
    _USAGE.add +
    "\n" +
    _USAGE.version +
    "\n" +
    _USAGE.help;
const _OPTIONS = {
    version: "    --version    Show the version of FuckingNode you're currently on.",
};
const OPTIONS = _OPTIONS.version;
const _CLEAN_OPTIONS = {
    update: "    --update     Update all your projects before cleaning them.",
    verbose: "    --verbose    Show more detailed ('verbose') logs.",
    maxim: "    --maxim      Maxim clean all projects (recursively remove node_modules/).",
};
const CLEAN_OPTIONS = _CLEAN_OPTIONS.update +
    "\n" +
    _CLEAN_OPTIONS.verbose +
    "\n" +
    _CLEAN_OPTIONS.maxim;
export const HELP = "Usage: fuckingnode\n" +
    USAGE +
    "\n\nClean options:\n" +
    CLEAN_OPTIONS +
    "\n\nOptions:\n" +
    OPTIONS;
