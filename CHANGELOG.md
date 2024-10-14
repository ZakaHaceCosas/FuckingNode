<!-- markdownlint-disable -->

# F*ckingNode Changelog

All notable changes will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] <!-- 1.0.1 -->

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
