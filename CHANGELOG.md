<!-- markdownlint-disable -->

# F*ckingNode Changelog

All notable changes will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- Added `--maxim` flag to the `clean` command. It will _take cleaning to the max_ (AKA removing `node_modules/`
  entirely).
- Now the cleaner uses additional commands, like `dedupe`, for more in-depth cleaning.

### Changed

- Changed some logs to include emojis.

### Fixed

- If you didn't enter any argument (just running `fuckingnode`), you got a TypeError instead of "Unknown command...".
  This was fixed.

## [1.0.1] 14-10-2024 <!-- two releases in a day, lol -->

### Added

- Added `--version` flag to the main command.
- Added `--verbose` flag to the `clean` command. Some logs are now hidden behind this flag.
- Added `--help` flag to show basic help about the program.

### Fixed

- Fixed the app losing data from one version to another (now it uses `APPDATA/FuckingNode/*` instead of
  `APPDATA/FuckingNode-VERSION/*` to store data).
- Remove case sensitivity from some arguments.

## [1.0.0] - 14-10-2024

### Added

Everything, I guess. It's the first release lol.
