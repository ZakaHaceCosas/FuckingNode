<!-- markdownlint-disable MD024 -->

# F\*ckingNode Changelog

All notable changes will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased (upcoming major release)

### Breaking changes

- **Order of `clean` arguments swapped:** It's now `clean <project | "--"> <intensity | "--"> [...flags]` instead of `clean <intensity | "--"> <project | "--"> [...flags]`. This was made so the command makes more sense. E.g., `clean my-project hard`.

### Added

- Added a **new command** `release`. Automatically runs our typical cleanup & maintenance automation, but also bumps SemVer version from your package file, commits your changes, creates a Git tag, pushes to mainstream, and **automatically publishes to `npm` or `jsr`**, from a single command.
  - `dry-run` and other options are available to prevent Git commit and npm/jsr publish tasks from running, if desired.
  - The process is 90-100% automated, however you'll have to move your hands in some cases (we still save you some time with this addition :wink:):
    - Always when publishing to JSR, as you're required to click once in their web UI to authorize the publishing.
    - When publishing to npm and have 2FA enabled and required for publishing.
  - `publish` is allowed as an alias to the command.
- Added a new `maxim-only` intensity level. Plus, now `maxim` cleanup should work on per-project cleanup as well.
- (WIP; Windows only) Added new shell-based installers (`.ps1` for Windows, and soon `.sh` for macOS and Linux).
- (WIP; Windows only) Added an `fknode` CLI shortcut. Equivalent to `fuckingnode`.
- Added support for quick flags (or however you call those) for the `clean` command, so `-l` instead of `--lint` for example will work.
- Added recognition of new `bun.lock` file to identify Bun projects.
- Added a new `errors.log` file, stored with all of our config files. Some errors will now dump more detailed info in there.

### Changed

- Now error messages for not found / not added projects are consistent.
- Now any generated YAML files by the CLI follow common formatting.

### Fixed

- Fixed `manager add` allowing to add _one_ duplicate of each entry.
- Fixed `manager add` project-env errors being ambiguous. Now they're more specific (missing lockfile, missing path, etc...).
- Fixed project paths not being correctly handled in some cases.
- Fixed the CLI running init task (check for updates & config files) twice.
- Fixed cleaner intensity being hypothetically case sensitive.
- Fixed the confirmation for using maxim cleanup.
- Fixed projects not being alphabetically sorted when listing them.
- Fixed Bun projects' config files not being properly read.
- Fixed the app randomly showing "That worked out!" before any other CLI output.
- Fixed schedules running each time you run the CLI after they reach their scheduled run time once (they didn't reset the timer).

## [2.2.1] 16-01-2025

### Changed

- Now you don't need to confirm if you want to add Deno or Bun projects.
- Now sync output of command is hidden behind `--verbose`.
- Now project validation can return more error codes (`"CantDetermineEnv"`, `"NoLockfile"`).

### Fixed

- Fixed `--self` not being recognized for per-project cleanup.
- Fixed autocommit not running if committable actions were made through a flagless feature instead of a flagged feature.
- Fixed issues with workspaces:
  - Not validating that workspace arrays exist
  - Not parsing `deno.jsonc` properly.
  - When adding a project, always seeking for `package.json` instead of the runtime's specific main file.

## [2.2.0] 15-01-2025

### Breaking changes

- Update config file has been "reset" (renamed from `*-updates.yaml` to `*-schedule.yaml`). Last update check will be overwritten.

### Added

- Added per-project cleanup.
- Added flagless features, allowing to enable features (e.g. the auto linter) in a per-project basis and without depending on a `--lint` flag.
- Added auto flush for log files, so they're auto cleaned every once in a while. Frequency can be changed.

### Changed

- Renamed `flush updates` to `flush schedule`.

### Fixed

- Fixed `clean --update` updating twice, once ignoring `updateCmdOverride` if present.
- Fixed cleaner and updater messages being messed up (showing "Cleaned ...!" after updating, e.g.).
- Fixed `updateCmdOverride` not being used, because the CLI mixed up "npm run" with "npx" (and the same on all package managers).
- Fixed the app not properly handling changes to what settings are available from one update to another.

## [2.1.0] 14-01-2024

### Added

- Added a **new** experimental **command**: _**audit**_. Currently it's only available for `npm` users and behind the `--experimental-audit` flag. TL;DR it helps you better understand security audits by asking questions, read more in [here](https://zakahacecosas.github.io/FuckingNode/learn/audit/).
- Added support for more IDEs / code editors as favorite editors (VSCodium, Emacs, Notepad++, Atom).
- Added a `repo` command that shows the URL to GitHub.

### Changed

- Changed `stats` so it displays just the first 5 dependencies and then an "and x more" string. Also removed "Main file:" string.

### Fixed

- Fixed handling of duplicates with `manager cleanup` sometimes misbehaving (either not detecting duplicates or removing duplicates AND the original entry).

## [2.0.3] 08-01-2025

Happy new year btw

### Added

- Added a `documentation` command to show a link to our website, where everything is documented more in-depth.

### Changed

- Now you'll be shown a warning if we couldn't remove a temporary DIR.

### Fixed

- Fixed the app skipping `deno.jsonc`, meaning projects with a `deno.jsonc` and not a `package.json` wouldn't work properly.
- Fixed doing so many path-related operations just to get a project's working env, slightly improving performance.
- Fixed the help command being case sensitive.
- Fixed some useless debug logs being shown.
- Fixed `stats` showing `[object Object]` as the "Main file".

## [2.0.2] 28-12-2024

### Fixed

- Fixed a long standing issue with hard cleanup: it didn't properly detect if you had certain managers like `npm`, skipping them when it shouldn't. _(That has been in there since october :skull:)_.
- Fixed the updater thinking you're on an outdated version when you aren't.
- Fixed settings displaying `autoFlush` related settings (that's not a feature).
- Fixed `kickstart` not knowing where was the project cloned (hence failing).
- Fixed `kickstart` cloning into non-empty DIRs or paths that aren't a DIR (hence, again, failing).
- Fixed `kickstart`'s process being blocked by add confirmation for Deno and Bun projects.

## [2.0.1] 26-12-2024

### Fixed

- This release SHOULD have fixed macOS and Linux compatibility. Report any issues you find, please. Thank you.

## [2.0.0] 25-12-2024 <!-- 2.0.0 - major release, even tho there aren't "breaking" changes (well, adding runtimes that aren't Node to the "F*ckingNODE" project is kinda "breaking") -->

### Breaking changes

- `.fknodeignore` becomes `fknode.yaml`, and follows a new format detailed in the `README.md`.
- `self-update` becomes `upgrade`.
- The project list and other config files will "reset" when downloading this update (simply because file names changed from `.json` to `.yaml`). You can recover old data from `C:\Users\YOUR_USER\AppData\FuckingNode\`.
- `manager revive` and `manager ignore` have been removed, as ignoring is now more complex. **You can still ignore projects manually from the `fknode.yaml`**. We will (hopefully) readd ignoring CLI commands in a future release.

### Added

- **Added partial support for cleanup of both the Bun and Deno JavaScript runtimes.**
- Added new capabilities besides cleaning and updating.
  - Automatic linting of projects.
  - Automatic prettifying of projects.
  - Automatic removal of unneeded files (e.g. `dist/`, `out/`, etc...).
  - Added the ability to auto-commit these changes (only if there weren't previous uncommitted changes).
- Added an install script for Microsoft Windows.
- Added the option to flush config files (like `.log`s), so the user can save up space.
- Added the ability to customize whether an ignored project should ignore updates, cleanup, or everything.
- Added much more better support for workspaces, by recognizing `pnpm-workspace.yaml`, `yarnrc.yaml` and `bunfig.toml`.
- Added the ability to only do a hard cleanup (global cache cleanup), by running either `global-clean`, `hard-clean`, or `clean hard-only`.
- Added an about page.
- Added the `--alive` flag to `manager list` so it only lists projects that are not ignored.
- Added a `settings` command which allows to tweak:
  - Update check frequency
  - Default cleaner intensity
  - Favorite editor (for new `kickstart` command).
- Now verbose logging in `clean` will show the time it took for each project to be cleaned.
- Added a `kickstart` command to quickly clone a Git repo and start it up a project.
- Added the ability to override the command used by the `--update` task in `clean`, via `fknode.yaml`.
- Added `stats` as a different command. It's now stabilized and instead of showing a project's size, it shows other relevant data. Many more props to be added in future minor releases.
- Added the ability to use a project's name instead of their path in some cases.
  - For example, `manager remove myProject` instead of `remove "C:\\Users\\Zaka\\myProject"`, as long as the `name` field in `package.json` (or it's equivalent) is set to `myProject`.
- Added support for Linux and macOS (that should actually work). Also, thanks to @dimkauzh, added support for NixOS.

### Changed

- Now `self-update` is called `upgrade`.
- Now all commands show their output fully synchronously, giving the feel of a faster CLI and properly reflecting what is being done.
- Now in some places instead of an "Unknown command" error, the help menu is shown so you can see what commands are valid.
- Now `manager list` shows, if possible, the name of the project from the `package.json`, alongside it's absolute path. Also, now projects are alphabetically sorted by name (by their path if not possible to obtain their name). This also applies to any other listing, like cleaner reports when using `--verbose`.
- Now the CLI has cool looking colors 🙂.
- Now, projects without a `node_modules` DIR won't show a warning before adding them.
- Now, `manager cleanup` will show next to the project's path an error code indicating why it's in there.
- Now the app uses YAML instead of JSON for its config files.
- Now the clean command can be used without providing an intensity (use `--` to pass flags).

### Fixed

- Fixed `clean hard` not working with `npm`, as cache required a `--force` arg.
- Fixed `clean hard` wasting resources by recursively running global commands (like cache cleaning).
- Fixed `clean hard` trying to use, for example, `yarn clean` with users that don't have `yarn` installed.
- Fixed the CLI writing unneeded logs from `npm` / `pnpm` / `yarn` to the `.log` file.
- Fixed the app crashing (unhandled error) upon joining two untraceable paths.
- Fixed the app crashing (unhandled error) upon calling `manager list` and having untraceable paths saved.
- Fixed `clean` writing twice to the `stdout` what cleanup commands would do.
- Fixed many potential unhandled errors at many places.
- Fixed the base directory for app config being recursively created on each run.
- Fixed `manager list` not listing ignored projects (showing an empty list when there are ignored projects).
- Fixed `upgrade` (_`self-update`_) not correctly handling GitHub's rate limit.
- Fixed an issue where naming projects (reading their `name` from `package.json`) would crash the CLI.
- Fixed unreliability when finding out if a project uses Node, Deno, or Bun.
- Fixed projects not being correctly added due to missing `await` keyword.
- Fixed `--help <command>` working but `help <command>` (without `--`) not.
- Fixed the log file being unreadable because it saved `\x1b` stuff.
- Fixed the CLI writing twice the "There's a new version!" message.

### Removed

- `settings schedule`. Due to `Deno.cron()`s limitations, this feature is not viable as of now.
- `manager ignore` and `manager revive` as commands. Since ignoring projects (which is STILL A FEATURE) is now more complex, ignoring from the CLI requires to be remade from scratch. It'll be likely re-added in a future release.

## [1.4.2] 27-10-2024

### Added

- Added `settings schedule <hour> <day>` to schedule F\*ckingNode, so your projects are automatically cleaned.

### Fixed

- Fixed an issue with path joining that made the app unusable (as it couldn't access config files).

## [1.4.1] 26-10-2024

### Fixed

- Fixed `manager add` not detecting workspaces when an object instead of an array is used.
- Fixed `manager add` not correctly resolving relative paths, such as `../../my-project`.

## [1.4.0] 26-10-2024

### Added

- Added support for monorepos / Node workspaces. When adding a project, now F\*ckingNode will look through the `package.json`. If `workspaces` are found, it will prompt to add them as separate projects so they get their own cleanup as well.
- Added cleaning levels, adding a new `hard` level and replacing the `--maxim` flag. Now `clean` takes a level, either `clean normal`, `clean hard`, or `clean maxim` (if no level, "normal" will be used as default).
  - `normal` will do the easy: recursively run cleaning commands.
  - `hard` will do what default used to do (clean + dedupe) + it will also clean cache.
  - `maxim` will do what maxim does: forcedly remove `node_modules/` for everyone.
- Added `list --ignored` flag to only list ignored projects.

### Changed

- **Rename some paths used to store program info.**
- Now flag commands like --help or --version are now case unsensitive and all support single dash calls (-help) and 1st letter calls (-h, -v).
- Now `migrate` will install with the new manager before removing the old lockfile. As far as I know some managers can understand other managers' lockfile format, so this will make stuff less likely to fail.

### Removed

- Remove the `--full` arg from `stats`. Now the project itself is always counted.

### Fixed

- Fixed `stats` adding it's self size twice, incorrectly increasing the MB size.
- Fixed paths being always joined as `some/location`, now Deno's `join` function is used to avoid issues.
- Fixed `manager cleanup` not detecting some projects (an error with duplicate handling).
- "Fixed" handling projects with more than one lockfile. For now it'll just skip them to avoid messing up versions. Future versions might add a better handler.

## [1.3.0] 24-10-2024

### Added

- Added `migrate` moves a project from one package to another.
- Added `manager revive` allows to stop ignoring a project (opposite of `manager ignore`)

### Changed

- **Decided to hide `stats` behind `--experimental-stats` due to instability.**
- Updated help menu.
- Now `--self` can be used anywhere you need to pass a path.
  - Also, now `normalize` from `node:path` is used to avoid issues.

### Fixed

- Now `stats` (`--experimental-stats`) will recursively get the size of DIRs within `node_modules/` for more accuracy.
- Now `stats` (`--experimental-stats`) rounds numbers correctly.

### Known issues

- `stats` (`--experimental-stats`):
  - While recursive fetching improved accuracy, it still provides sizes lower than the real one (like hundreds of MBs lower).
  - It takes a _lot_ of CPU.
  - It does throw an error for many files stating that they "cannot be accessed".

## [1.2.0] 21-10-2024

### Added

- Added `manager cleanup` checks the list of projects and validates them. If some project cannot be cleaned, it will prompt you to remove it.
- Added `--self` flag to `manager` commands, so you can use the CWD instead of manually typing a path.

### Changed

- Now `manager add` validates if you want to add paths that are valid but don't make sense (they don't have `package.json` or `node_modules`).

### Fixed

- Fixed an error where the app would throw an error when the user checked for updates too much (AKA reached GitHub's API rate limit).
- Fixed an error where non-existent paths would break `stats`.
- Fixed `manager add` adding a path even if it doesn't exist.
- Fixed an issue where if the `node_modules` DIR wasn't present but the user chose to add the project anyway, it got added twice.
- Fixed an issue where removing a duplicate project would remove it entirely, instead of keeping one entry.
  - Note: it was fixed by making it remove only _once_, so if you have the same entry four times and remove it, you will still have 3 duplicates.

## [1.1.1] - 19-10-2024

### Added

- Added `self-update` so the user can manually check for updates every time he wants to.

### Changed

- Now `manager add` checks if the path exists before adding it.

### Fixed

- Fixed `manager` being broken by a human mistake on previous updates (sorry, mb) and it didn't recognize one word commands like `list`. It has been fixed.
- Fixed `clean` crashing if one of your project's path didn't exist. Now it will log an error and skip it without interrupting the cleanup.
- When auto-checking for updates, the program would consider there are updates if your version number is greater than the one from GitHub - it's unlikely that the end user ever saw this, but it's now fixed.

## [1.1.0] 19-10-2024

### Added

- Added `stats` command. Shows stats, AKA how much storage your projects are taking up. By default only counts the size of `node_modules/`, but you can pass the `--full` flag to it so it also includes your code.
- Added `manager ignore` command. Creates a `.fknodeignore` file at the root of the project, so F\*ckingNode simply ignores it whenever a cleanup is made.

### Changed

- Replaced the actual f-word with an asterisk-included version (f\*cking) app-wide. Also made an effort to rename variables and all that kind of stuff. ~~I don't want to get banned~~.
- Now "unknown errors" when pruning a project actually show the command's `stderr`.

### Fixed

- Fixed `manager` sometimes not properly handle wrong arguments. Now it should do.

## [1.0.2] 15-10-2024

### Added

- Added `--maxim` flag to the `clean` command. It will _take cleaning to the max_ (AKA removing `node_modules/` entirely).
- Added additional commands to the cleaner, like `dedupe`, for more in-depth cleaning.
- Added the capability to the CLI of checking for updates by itself. Does it only once every 7 days to save up on the user's resources.

### Changed

- Changed some logs to include emojis.

### Fixed

- Fixed an unhandled error where if you just run `fuckingnode` with no args, you got a TypeError instead of "Unknown command...".
- Now the path you provide for add / remove gets a bit of purification (removing trailing spaces & trailing `/`) to avoid issues.

## [1.0.1] 14-10-2024 <!-- two releases in a day, lol -->

### Added

- Added `--version` flag to the main command.
- Added `--verbose` flag to the `clean` command. Some logs are now hidden behind this flag.
- Added `--help` flag to show basic help about the program.

### Fixed

- Fixed the app losing data from one version to another (now it uses `APPDATA/FuckingNode/*` instead of `APPDATA/FuckingNode-VERSION/*` to store data).
- Fixed some arguments being case-sensitive.

## [1.0.0] - 14-10-2024

### Added

Everything, I guess. It's the first release lol.
