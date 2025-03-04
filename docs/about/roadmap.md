<!-- markdownlint-disable md007 -->

# Roadmap

What we're planning to do. Only includes minor and major releases, patch releases only fix bugs, thus they aren't planned (as our plan and hope is to write errorless code (which we'll never do, but we'll try our best to get as close as possible to that)).

We'll expand (and rarely, but not impossibly, shrink) this roadmap as we make progress and/or change our plans.

## 3.X

### Version 3.0 (released)

- [x] Make a proper logo for the project.
- [x] New features
    - [x] `fuckingnode commit "message"` to automatically run our maintenance task and custom commands before making a Git commit and only committing if they all succeed. With the "Shorter commands" goal, it could be something like `fkcommit "message"`.
    - [x] `fuckingnode release "version"` to automatically run commands before releasing, then bumping the version number from `package.json` (or equivalent), and then running the manager's specified publish command (unless overridden).
    - [x] `fuckingnode surrender <project>` to automatically add a generic deprecation message to the README.md file from the project's root (if any), give the project a last maintenance, commit everything, push it, and once pushed, removing the entire project's folder from the filesystem and the project list.
    - [x] `fuckingnode setup <project> <setup>` to automatically add preset `tsconfig.json`, `.gitignore`, and `fknode.yaml` files to a project.
    - [x] `fuckingnode compat` to show cross-runtime compatibility without the need to open the browser.
- [x] Better installer
    - [x] Revamped `.ps1` based installer for Windows.
    - [x] New `.sh` based installed for mac and Linux.
- [x] Cross-runtime migration.
    - [x] Bun. Implies generating `bun.lock` in `bun.lockb` projects.
    - [x] Deno.
- [x] Shorter commands.
    - [x] Shorter core command, `fknode (args)`.
      - [x] :fontawesome-brands-windows: Windows support
      - [x] :simple-apple: macOS and :simple-linux: Linux support
    - [x] Shorter flags, for example, `fknode clean -- -l -p` instead of `fuckingnode clean -- --lint --pretty`.
    - [x] Shorthands, for example, `fkclean` instead of `fuckingnode clean`, which together with `defaultIntensity` setting and flagless features should handle everything.
        - [x] :fontawesome-brands-windows: Windows support
        - [x] :simple-apple: macOS and :simple-linux: Linux support
- [x] Make `fuckingnode stats` actually useful
    - [x] Similar to GitHub's community standards (any repo -> insights -> community standards), compare a project to a set of quality standards.
- [x] Make `maxim` intensity behave like `hard` intensity, doing first what lower levels do. `maxim-only` would be added too, to keep the current behavior available.
- [x] Better error handling.
- [x] **Cross-platform support!**
    - [x] FnCPF (FuckingNode CommonPackageFile)
        - [x] Internal generation
        - [x] Ability to export it
    - [x] Platforms
        - [x] Golang
            - [x] Base support (Recognition, package file parsing...)
            - [x] Operations (Cleanup, lint, pretty...) (_May be limited_)
            - [x] Extras (Kickstart, stats...) (_May be limited_)
        - [x] Cargo (Rust)
            - [x] Base support (Recognition, package file parsing...)
            - [x] Operations (Cleanup, lint, pretty...) (_May be limited_)
            - [x] Extras (Kickstart, stats...) (_May be limited_)
- [x] Create a FuckingNode Interop Layer
    - [x] Linter
    - [x] Prettifier
    - [x] Updater

### Version 3.1 (Released)

- [X] New features
    - [X] `fuckingnode launch <project>` to immediatly launch user's favorite IDE with the given project and update its dependencies.

### Version 3.2 (Upcoming)

- [ ] Better `migrate` feature.
    - [ ] Manually migrate projects, copying exact versions from one lockfile and creating (by us) a new one where everything'll be added. (Sounds difficult, but some package managers AFAIK are capable of this, so we should try at least too.)
- [ ] Support `stats`' Recommended Community Standards across:
    - [ ] Deno
    - [ ] Cargo

### Version 3.3

- [ ] Stabilize `audit` feature and support it everywhere NodeJS.
  - [ ] Stabilize it
      - [ ] Fix known issues (see TODO.md at the repository).
      - [ ] Expand vector string lists.
  - [x] Support it
      - [x] pnpm
      - [x] yarn
- [ ] Extend the FuckingNode Interop Layer
    - [ ] Auditer (this is a bit special, you'll see what we mean soon).

---

## 2.X

### Version 2.1 (Released)

- [x] Release the `audit` feature as an `npm` only experiment. Learn more [here](../learn/audit.md).
- [x] Support more editors for the `kickstart` command (PS. doing this is as simple as ensuring we know the command to launch that editor in all platforms).
    - [x] Emacs
    - [x] Notepad ++
    - [x] VSCodium
    - [x] Atom (_it's unmaintained, but anyways..._)
- [x] Get this documentation finished.

### Version 2.2 (Released)

- [x] Per-project cleanup.
- [x] Flagless features via `fknode.yaml`.
- [x] Auto-flush for log files.
