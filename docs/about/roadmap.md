<!-- markdownlint-disable md007 -->
# Roadmap

What we're planning to do. Only includes minor and major releases, patch releases only fix bugs, thus they aren't planned (as our plan and hope is to write errorless code (which we'll never do, but we'll try our best to get as close as possible to that)).

We'll expand (and rarely, but not impossibly, shrink) this roadmap as we make progress and/or change our plans.

## 3.X

### Upcoming Version 3.0

- [ ] Make a proper logo for the project.
- [ ] New features
    - [ ] `fuckingnode commit "message"` to `REDACTED`.
    - [X] `fuckingnode release "version"` to automatically run commands before releasing, then bumping the version number from `package.json` (or equivalent), and then running the manager's specified publish command (unless overridden).
    - [ ] `fuckingnode give-up <project>` to `REDACTED`.
    - [ ] `fuckingnode setup <project>` to `REDACTED`.
    - [x] `fuckingnode compat` to show cross-runtime compatibility without the need to open the browser.
    - [x] `fuckingnode export <project>` to export a project's FnCPF.
- [ ] Better installer
    - [X] Revamped `.ps1` based installer for Windows.
    - [X] New `.sh` based installed for mac and Linux.
- [ ] Better migration feature.
    - [ ] Manually migrate projects, copying exact versions from one lockfile and creating (by us) a new one where everything'll be added. (Sounds difficult, but some package managers AFAIK are capable of this, so we should try at least too.)
    - [ ] Cross-runtime migration.
        - [ ] Bun. Implies generating `bun.lock` in `bun.lockb` projects.
        - [ ] Deno.
- [ ] Stabilize `audit` feature and support it everywhere NodeJS.
    - [ ] pnpm
    - [ ] yarn
- [ ] Shorter commands.
    - [X] Shorter core command, `fknode (args)`.
        - [X] :fontawesome-brands-windows: Windows support
        - [X] :simple-apple: macOS and :simple-linux: Linux support
    - [X] Shorter flags, for example, `fknode clean -- -l -p` instead of `fuckingnode clean -- --lint --pretty`.
    - [X] Shorthands, for example, `fkclean` instead of `fuckingnode clean`, which together with `defaultCleanerIntensity` setting and flagless features should handle everything.
        - [X] :fontawesome-brands-windows: Windows support
        - [X] :simple-apple: macOS and :simple-linux: Linux support
- [ ] Make `fuckingnode stats` actually useful
    - [ ] Similar to GitHub's community standards (any repo -> insights -> community standards), compare a project to a set of quality standards.
- [X] Make `maxim` intensity behave like `hard` intensity, doing first what lower levels do. `maxim-only` would be added too, to keep the current behavior available.
- [x] Better error handling.

**Cross-platform support!**

- [ ] Cross-Platform Support
    - [x] FnCPF (FuckingNode CommonPackageFile)
        - [x] Internal generation
        - [x] Ability to export it
    - [ ] Platforms
        - [ ] Golang
            - [x] Base
                - [x] Recon
                - [x] Interaction
            - [ ] Operations
                - [x] Base op
                - [ ] Advanced op
            - [ ] Extras
        - [ ] Cargo (Rust)
            - [x] Base
                - [x] Recon
                - [x] Interaction
            - [ ] Operations
                - [ ] Base op
                - [ ] Advanced op
            - [ ] Extras
- [ ] FkNode Interop Layer
    - [x] Linter
    - [x] Prettifier
    - [ ] Auditer (this is a bit special, you'll see later on)

----

## 2.X

### Version 2.1 (Released)

- [X] Release the `audit` feature as an `npm` only experiment. Learn more [here](../learn/audit.md).
- [X] Support more editors for the `kickstart` command (PS. doing this is as simple as ensuring we know the command to launch that editor in all platforms).
    - [X] Emacs
    - [X] Notepad ++
    - [X] VSCodium
    - [X] Atom (_it's unmaintained, but anyways..._)
- [X] Get this documentation finished.

### Version 2.2 (Released)

- [X] Per-project cleanup.
- [X] Flagless features via `fknode.yaml`.
- [X] Auto-flush for log files.
