# TODO

> [!TIP]
> These are all things I want to do.

## Chores (should do)

- Better error handling.
  - Throw all errors and handle them from the main loop (except of course for catch statements that don't crash AKA allow the CLI to keep doing stuff).
  - Add error codes for all errors.
  - Make error messages consistent.
- Better help.
  - Make invalid input errors show hints to help the user.

## Ideas (want to do)

- macOS and Linux install scripts.
- Remove all `Deno.exit(0)`/`Deno.exit(1)` (make the main loop take care of that).
- Actually write some f\*cking tests.

## Trivia (might do)

- Add more `ColorString()` options and use them in more places.
- Add an about command.
