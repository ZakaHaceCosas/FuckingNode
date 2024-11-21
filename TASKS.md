# TODO

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

## Cross-runtime support tasks

- [ ] Project-wide cleanup
  - [x] NODE
  - [ ] DENO
  - [ ] BUN
- [ ] System-wide cache cleanup
  - [x] NODE
  - [x] DENO
  - [x] BUN
- [ ] Project naming
  - [x] NODE
  - [x] DENO
  - [x] BUN

## Settings-related tasks

- [ ] Allowing the user to automate flushing of files
  - [ ] Make it work like the updater, on startup it checks a file (settings.yaml i guess) with the date the last change was, and compares with current day.
- [ ] Allowing to change the default intensity of the cleaner.
- [ ] Make the scheduler work better (if it works, it doesn't work on my machine and Deno keeps it as "unstable").
