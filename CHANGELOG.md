<!-- markdownlint-disable MD024 -->

# F*ckingNode Changelog

All notable changes will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased <!-- 1.4.0 -->

### Added

- Added support for monorepos / Node workspaces. When adding a project, now F\*ckingNode will look through the `package.json`. If `workspaces` are found, it will prompt to add them as separate projects so they get their own cleanup as well.
- Added clean levels, adding a new `hard` level and replacing the `--maxim` flag. Now `clean` takes a level, either `clean normal`, `clean hard`, or `clean maxim` (if no level, "normal" will be used as default).
  - `normal` will do the easy: recursively run cleaning commands.
  - `hard` will do what default used to do (clean + dedupe) + it will also clean cache.
  - `maxim` will do what maxim does: forcedly remove `node_modules/` for everyone.

### Changed

- **⚠ Renamed some paths used to store program info.**
- Now flag commands like --help or --version are now case unsensitive and all support single dash calls (-help) and 1st letter calls (-h, -v).

### Removed

- Removed the `--full` arg from `stats`. Now the project itself is always counted.

### Fixed

- Fix `stats` adding it's self size twice, incorrectly increasing the MB size.
- Fix paths being always joined as `some/location`, now Deno's `join` function is used to avoid issues.
- Fix `manager cleanup` not detecting some projects (an error with duplicate handling).

## [1.3.0] 24-10-2024

### Added

- `migrate` moves a project from one package to another.
- `manager revive` allows to stop ignoring a project (opposite of `manager ignore`)

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

- `manager cleanup` checks the list of projects and validates them. If some project cannot be cleaned, it will prompt you to remove it.
- `--self` flag to `manager` commands, so you can use the CWD instead of manually typing a path.

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

- `self-update` so the user can manually check for updates every time he wants to.

### Changed

- `manager add` now checks if the path exists before adding it.

### Fixed

- `manager` was broken by a human mistake on previous updates (sorry, mb) and it didn't recognize one word commands like `list`. It has been fixed.
- `clean` would crash if one of your project's path didn't exist. Now it will log an error and skip it without interrupting the cleanup.
- When auto-checking for updates, the program would consider there are updates if your version number is greater than the one from GitHub - it's unlikely that the end user ever saw this, but it's now fixed.

## [1.1.0] 19-10-2024

### Added

- Added `stats` command. Shows stats, AKA how much storage your projects are taking up. By default only counts the size of `node_modules/`, but you can pass the `--full` flag to it so it also includes your code.
- Added `manager ignore` command. Creates a `.fknodeignore` file at the root of the project, so F*ckingNode simply ignores it whenever a cleanup is made.

### Changed

- Replaced the actual f-word with an asterisk-included version (f*cking) app-wide. Also made an effort to rename variables and all that kind of stuff. ~~I don't want to get banned~~.
- Now "unknown errors" when pruning a project actually show the command's `stderr`.

### Fixed

- Sometimes `manager` didn't properly handle wrong arguments. Now it should do.

## [1.0.2] 15-10-2024

### Added

- Added `--maxim` flag to the `clean` command. It will _take cleaning to the max_ (AKA removing `node_modules/` entirely).
- Now the cleaner uses additional commands, like `dedupe`, for more in-depth cleaning.
- Now it's capable of checking for updates by itself. Does it only once every 7 days to save up on the user's resources.

### Changed

- Changed some logs to include emojis.

### Fixed

- If you just run `fuckingnode` with no args, you got a TypeError instead of "Unknown command...". This was fixed.
- Now the path you provide for add / remove gets a bit of purification (removing trailing spaces & trailing `/`) to avoid issues.

## [1.0.1] 14-10-2024 <!-- two releases in a day, lol -->

### Added

- Added `--version` flag to the main command.
- Added `--verbose` flag to the `clean` command. Some logs are now hidden behind this flag.
- Added `--help` flag to show basic help about the program.

### Fixed

- Fixed the app losing data from one version to another (now it uses `APPDATA/FuckingNode/*` instead of `APPDATA/FuckingNode-VERSION/*` to store data).
- Remove case sensitivity from some arguments.

## [1.0.0] - 14-10-2024

### Added

Everything, I guess. It's the first release lol.
