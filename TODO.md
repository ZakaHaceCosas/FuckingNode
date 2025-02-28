# Tasks

> [!TIP]
> These are all things I want to do.

## Known issues

- [x] (V3) Somehow there's now a f\*\*kng loop somewhere causing the entire app to hang infinitely
- [ ] (Impossible to re-reproduce) (V3) In some random moments the CLI uses project's _A_ `fknode.yaml` for project _B_, causing issues because of "non existing scripts".
- [x] (V3) TMP dir not removed never because it's being used (we gotta schedule it somehow)
- [ ] (V3 or later) Audit tags indirect vulnerabilities as direct (not priority)
  - [ ] Because of this, fixed version of the _vulnerable_ package is sometimes set to the fixed version of a _different_ package (for example, a vulnerability in `body-parser` gets the fixed version of `express` set as _it's own_ fixed version). **Not a problem as of now, but for future (v3) plans I have, this needs to get resolved.**
- [ ] (V3 or later) Most `TODO` comments out there.
- [ ] (idk if it's even still an issue, TODO: review) Whatever the hell happened that made me write [this](#docs) (it makes no sense that flagless features skip defaults? idk if they do that i gotta check).

## Chores and trivial tasks

- [ ] Rewrite audit to use JSON instead of raw strings (should've done this before...)
- [ ] Better error handling.
  - [x] Throw all errors and handle them from the main loop (except of course for catch statements that don't crash, AKA allow the CLI to keep doing stuff).
  - [ ] Add error codes for all errors.
  - [x] Make error messages consistent.
- [x] Better help.
  - [x] Make invalid input errors show hints to help the user.
- [ ] Cleanup the codebase (it's getting kinda messy ngl).
- [ ] Finish up CONTRIBUTING.md
  - [ ] Follow my own f\*cking guidelines, there are different ways of coding mixed up in the same project :skull:.
- [ ] ~~Actually write some f\*cking tests.~~ (not happening)

## Docs

self-reminders:

~~1. flagless features require _by design_ specifying a command - e.g., `clean -- --lint` will default to ESLint, but in projects that have `flaglessLint: true` it won't, it'll directly check for `lintCmd` or skip. same applies for other settings. this is because of how `FkNodeYaml` is internally designed.~~
