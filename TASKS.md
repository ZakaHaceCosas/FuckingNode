# Tasks

> [!TIP]
> These are all things I want to do.

## Chores (should do)

- [ ] Better error handling.
  - [x] Throw all errors and handle them from the main loop (except of course for catch statements that don't crash AKA allow the CLI to keep doing stuff).
  - [ ] Add error codes for all errors.
  - [x] Make error messages consistent.
- [x] Better help.
  - [x] Make invalid input errors show hints to help the user.
- [ ] Cleanup the codebase (it's getting kinda messy ngl).
- [ ] Finish CONTRIBUTING.md
  - [ ] Follow my own f\*cking guidelines, there are different ways of coding mixed up in the same project :skull:.

## Ideas (want to do)

- [ ] macOS and Linux install scripts.
- [ ] ~~Actually write some f\*cking tests.~~ (not happening)
- [ ] A shorthand for the CLI, like "`fknode`", that automatically runs `clean` with the default intensity.

## Trivial tasks (might do)

- [ ] Add more `ColorString()` options and use them in more places.
- [x] Add an about command.
- [ ] More verbose logging maybe?
- [ ] Allow to use a project's name instead of it's path, and have the app to recognize it.

## Cross-runtime support tasks

- [ ] Project-wide basic cleanup
  - [x] NODE
    - [x] NPM
    - [x] PNPM
    - [x] YARN
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
- [ ] Migration
  - [ ] Node pkg manager
    - [x] Basic (remove lockfile -> install with new manager)
    - [ ] Well done (transform lockfile to diff format -> install)
  - [ ] Runtimes

## Cleaner

- [x] Basic stuff that's already done
- [ ] Auto-running ESLint or Prettier if they're installed (maybe with `--lint` and `--prettify` flags).
- [ ] Customizing (via `fknode.yaml`):
  - [ ] Commands used for cleaning / update
  - [ ] Directories to remove when cleaning (e.g. `/dist`)
  - [ ] Enabling auto-commits, so for example a user that runs both `--update` and `--prettify` gets his changes auto-committed and pushed (only if the Git tree is clean, of course).

## Settings-related tasks

- [x] Allowing the user to automate flushing of files
  - [ ] Instead of Deno.Cron(), make it work like the updater, on startup it checks a file (settings.yaml i guess) with the date the last change was, and compares with current day.
- [x] Allowing to change the default intensity of the cleaner.
- [ ] Make the scheduler work better (if it works, it doesn't work on my machine and Deno keeps it as "unstable").

## Known issues

- Scheduled tasks don't work for whatever reason. It's Deno.cron() and not us, so there isn't a "fix" for this.
