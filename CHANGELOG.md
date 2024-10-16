<!-- markdownlint-disable -->

# F*ckingNode Changelog

All notable changes will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] 15-10-2024

### Added

- Added `--maxim` flag to the `clean` command. It will _take cleaning to the max_ (AKA removing `node_modules/`
  entirely).
- Now the cleaner uses additional commands, like `dedupe`, for more in-depth cleaning.
- Now it's capable of checking for updates by itself. Does it only once every 7 days to save up on the user's resources.

### Changed

- Changed some logs to include emojis.

### Fixed

- If you just run `fuckingnode` with no args, you got a TypeError instead of "Unknown command...". This was fixed.
- Now the path you provide for add / remove gets a bit of purification (removing trailing spaces & trailing `/`) to
  avoid issues.

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
