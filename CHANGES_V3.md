# Changelog for V3

Some changes for V3 were made in RCs, so to avoid messing up / missing things, this is the _full_ V3 changelog:

## Unreleased (upcoming major release)

V3 has not received yet a stable release. However, an unstable release candidate including all of these changes (and some known issues) exists. See the Releases tab at this repository for more info.

### Breaking changes for v3

- **Order of `clean` arguments swapped:** It's now `clean <project | "--"> <intensity | "--"> [...flags]` instead of `clean <intensity | "--"> <project | "--"> [...flags]`. This was made so the command makes more sense. E.g., `clean my-project hard`.
- **User settings, schedules, and update timestamps will reset once:** Some internal breaking changes force us to do this. This'll only happen once and won't reset your project list.

### Added

- Added a new logo.
- Added **cross-platform support** - Golang and Rust projects can now benefit from FuckingNode (just as with Deno/Bun, unbridgeable features won't work but won't interrupt the flow either). While compatibility is more limited, it's better than nothing.
  - Added a new `export <project>` command to export a project's FnCPF (an internal "file" used for interoperability purposes). If something's not working, it _might_ help out, as it'll show whether we're correctly reading your project's info or not.
- Added a **new command** `release`. Automatically runs a task of your choice, bumps SemVer version from your package file, commits your changes, creates a Git tag, pushes to mainstream, and **automatically publishes to `npm` or `jsr`**, from a single command.
  - `dry-run` and other options are available to prevent Git commit and npm/jsr publish tasks from running, if desired.
  - While the process is fully automated you'll still have to move your hands in these cases (we still save you time with this addition :wink:):
    - Always when publishing to JSR, as you're required to click once in their web UI to authorize the publishing.
    - When publishing to npm having 2FA enabled and required for publishing.
  - `publish` is allowed as an alias to the command.
- Added a **new command** `commit (message) [branch] [--push]` to run any task of your choice before committing, and making the Got commit only if that tasks succeeds.
- Added a **new command** `surrender (project) [message] [alternative] [learn-more-url] [--github]` to deprecate a project (automatically add a deprecation notice, update dependencies one last time, commit and push all changes, and once the project's pushed, remove locally).
- Added a **new command** `setup (project) (template)` to automatically add a template `tsconfig.json` or `.gitignore` file, with more templates to be added. `fknode.yaml` templates exist as well, of course.
- Added a **new command** `something-fucked-up` to completely reset all internal settings except for your project list.
- Added a **new command** `compat (feature)` to show overall compatibility, or compatibility of a specific feature if provided, of the CLI across environments (NodeJS, Bun, Go...).
- Added Bun and Deno support for `migrate` feature.
- Added a new `maxim-only` intensity level. Plus, now `maxim` cleanup should work on per-project cleanup as well.
- Added new shell-based installers (`.ps1` for Windows and `.sh` for macOS and Linux).
- Added an `fknode` CLI shortcut. Equivalent to `fuckingnode`.
- Added `fkclean`, `fkcommit`, `fkadd`, and `fkrem` aliases for `clean`, `commit`, `manager add`, and `manager remove` respectively. They take the same arguments the normal command would do. They're standard `.ps1` / `.sh` scripts, auto-added on installation, and live on the same path as the `fuckingnode` executable.
- Added support for quick flags (or however you call those) for the `clean` command, so `-l` instead of `--lint` for example will work.
- Added recognition of new `bun.lock` file to identify Bun projects.
- Added a new `errors.log` file, stored with all of our config files. Some errors will now dump more detailed info in there.
- Added support for `pnpm` and `yarn` for the audit experiment.
- Added the ability for the CLI to auto-clean invalid entries from your project list, removing the need to do it for yourself.
- Added a "recommended community standards" sort of thing for NodeJS projects in `fuckingnode stats`.

### Changed

- Now error messages for not found / not added projects are consistent.
- Now any generated YAML files by the CLI follow common formatting.
- Now many commands (not all though) are strictly normalized, meaning even stupid things like `fuckingnode mÀnaGëR lÌSt` will work perfectly.
- Now the CLI more reliably tells whether a runtime is installed or not (at the expense of some extra milliseconds).
- Now `audit` experiment's parsing rules are more reliable. _They still have known issues (direct/indirect deps + patched version), but they're internal-only and don't affect usage as of now_.
- Now updating dependencies will always run with `--save-text-lockfile` in Bun.
- Now `migrate` will always update dependencies before running.
- Now `migrate` will back up your project's package file and lockfile.
- Now error handling is more consistent (and also uses less `try-catch` code). (I just learnt that JS errors propagate up to the caller, that's why there we so many damn `catch (e) { throw e }` lines, sorry mb).
- Now when the cleaner's done it says "cleaned all your **JavaScript** projects" instead of "Node" projects. I admit it looks nice as an "easter egg" or something referencing where we come from, but it was not intended to be that, I just forgot to change it.
- Now `settings change <key>` uses the same keys as the config file itself, so everything makes more sense.
  - Saw [breaking changes](#breaking-changes-for-v3) above? One of the reasons for the config reset is that some keys were renamed so you don't type a lot in the CLI because of this change.
- Now you can pass the `--fkn-dbg` flag to enable debug mode. It will output (in some places only) debug logs meant for developers.
- Now internal ENV-related checks (what your system is and whether if internal files are present or not) are more reliable.
- Now error message for non specified project is more clear and up to date.
- Now some base path-related methods (path existence checking, path parsing, internal path getting, project lockfile resolving...) are synchronous. This should not affect performance as the CLI works in a linear way anyways, and makes code shorter and less boilerplate-ish.
- Now error messages when adding a project & when spotting a project are much more detailed.
- Now when bulk adding workspaces from `manager add`, only one call to `writeTextFile` will be made.
- Now `settings` will show, besides your current settings, their key name so you know what to change.

### Fixed

- Fixed `manager add` allowing to add _one_ duplicate of each entry.
- Fixed `manager add` project-env errors being ambiguous. Now they're more specific (missing lockfile, missing path, etc...).
- Fixed `manager list` showing a "no projects exist" message when they do exist but are all ignored.
- Fixed project paths not being correctly handled in some cases.
- Fixed the CLI running init task (check for updates & config files) twice.
- Fixed cleaner intensity being hypothetically case sensitive.
- Fixed cleaner showing elapsed time since the _entire process_ had begun instead of since _that specific project's cleanup_ begun.
- Fixed the CLI adding an odd-looking linebreak before "Cleaning..." when using per-project cleanup.
- Fixed the confirmation for using maxim cleanup.
- Fixed projects not being alphabetically sorted when listing them.
- Fixed Bun projects' config files not being properly read.
- Fixed the app randomly showing "That worked out!" before any other CLI output.
- Fixed schedules running each time you run the CLI after they reach their scheduled run time once (they didn't reset the timer).
- Fixed Report not being shown when using verbose flag & per-project cleanup.
- Fixed `kickstart` not always running the correct install command.
- Fixed `kickstart` throwing `Internal__CantDetermineEnv` with reason "Path _x_ doesn't exist" even though it does exist.
- Fixed `kickstart` throwing `Internal__CantDetermineEnv` with reason "No lockfile present" for lockfile-less projects even if a package manager is specified when running.
- Fixed a bunch of issues with how `kickstart` determined a project's environment and the runtime to work with.
- Fixed how workspaces are shown to the user when found while adding a project.
- Fixed some minor issues with `clean`.
- Fixed FknError `Generic__NonFoundProject` not showing the name inputted (showing instead `trim function`-whatever).
- Fixed FknError `Generic__NonFoundProject` showing up when you pass an empty string as the project (now `Manager__ProjectInteractionInvalidCauseNoPathProvided` shows up instead).
- Fixed `audit` experiment not properly handling vulnerability-less projects (showing `0.00% risk factor` instead of a "no vulns found" message as it should).
- Fixed `audit` showing an empty report table when no projects are vulnerable.
- Fixed `audit` using workspace flags in all npm projects, making workspace-less projects fail.
- Fixed input validation not being precise enough and showing wrong (duplicate) error messages in `migrate`.
- Fixed the CLI sometimes not finding your projects because of string manipulation issues.
- Fixed Git-related commands sometimes not working because of output handling.
  - As as side effect, you now don't get to see Git's output live.
- Fixed the CLI not being able to handle projects that were missing the `name` or `version` field in a `package.json`/`deno.json` file.
- Fixed an edge case where the CLI wouldn't work because it fetched configuration _right before_ having it setup.
- Fixed hard cleanup not respecting verbose logging setting.
- Fixed useless path-related and settings-related function calls, minimally increasing performance.
- Fixed the CLI adding "NOTE: Invalid fknode.yaml" to files that _already_ have the note.
- Fixed the `fknode.yaml` validator having a wrong value set (for whatever unknown reason) for intensities, marking valid config files as invalid and ignoring them.
- Fixed Git not properly adding files for commit, thus failing.
- Fixed `commit` allowing to be used without anything to commit, thus failing.
- Fixed goddamn project validation. You'll find a slightly stricter CLI from now own (requiring you, for example, to add a `"name"` field to a project just to add it).
- Fixed an error being thrown when trying to gitignore stuff in projects without a .gitignore file, it'll now be automatically created.
- Fixed verbose logging making EVERYTHING hidden when running hard cleanup, instead of hiding just what should be considered verbose.
- Fixed paths being lowercased (Linux File System is case-sensitive, so this behavior breaks the app).
- Fixed temp DIR used for hard cleanup not being removed.

### Removed

- Removed `manager cleanup`, running it will now show a message telling you we now automate project list cleanup for you.
