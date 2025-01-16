# Tasks

> [!TIP]
> These are all things I want to do.

## Cross-runtime support tasks

- [ ] Project-wide cleanup
  - [x] NODE
  - [ ] DENO
  - [ ] BUN
- [x] System-wide cache cleanup
  - [x] NODE
  - [x] DENO
  - [x] BUN
- [x] Project naming
  - [x] NODE
  - [x] DENO
  - [x] BUN
- [x] Project updating
  - [x] NODE
  - [x] DENO
  - [x] BUN
- [ ] Migration
  - [ ] Node pkg manager
    - [x] Basic (remove lockfile -> install with new manager)
    - [ ] Well done (transform lockfile to diff format -> install)
  - [ ] Runtimes
- [x] Project prettifying
  - [x] NODE
  - [x] DENO
  - [x] BUN
- [x] Project linting
  - [x] NODE
  - [x] DENO
  - [x] BUN
- [ ] Other tasks
  - [x] Partially remove `bunfig.toml` support (in reality bun projects use the NodeJS pkg JSON, bunfig is only useful for identifying projects in the end) (& rename `NodePkgJson` to `NodeAndBunPkgJson` i guess).

## Cleaner tasks

- [x] Basic stuff that's already done
- [x] Auto-running ESLint or Prettier if they're installed (maybe with `--lint` and `--pretty` flags).
- [x] Customizing (via `fknode.yaml`):
  - [x] Commands used for stuff:
    - [x] Lint
    - [x] Prettify
    - [x] Update
  - [x] Directories to remove when cleaning (e.g. `/dist`)
  - [x] Enabling auto-commits, so for example a user that runs both `--update` and `--pretty` gets his changes auto-committed and pushed (only if the Git tree is clean, of course).

## Chores and trivial tasks

- [ ] Better error handling.
  - [x] Throw all errors and handle them from the main loop (except of course for catch statements that don't crash, AKA allow the CLI to keep doing stuff).
  - [ ] Add error codes for all errors.
  - [x] Make error messages consistent.
- [x] Better help.
  - [x] Make invalid input errors show hints to help the user.
- [ ] Cleanup the codebase (it's getting kinda messy ngl).
- [ ] Finish up CONTRIBUTING.md
  - [ ] Follow my own f\*cking guidelines, there are different ways of coding mixed up in the same project :skull:.
- [ ] Add more `ColorString()` options and use them in more places.
- [x] Add an about command.
- [x] More verbose logging maybe?
- [x] Allow to use a project's name instead of it's path, and have the app to recognize it.

## Random ideas

- [ ] macOS and Linux install scripts.
- [ ] A shorthand for the CLI, like "`fknode`", that automatically runs `clean` with the default intensity.
- [ ] ~~Actually write some f\*cking tests.~~ (not happening)

## Docs

self-reminders:

1. flagless features require _by design_ specifying a command - e.g., `clean -- --lint` will default to ESLint, but in projects that have `flaglessLint: true` it won't, it'll directly check for `lintCmd` or skip. same applies for other settings. this is because of how `FkNodeYaml` is internally designed.
