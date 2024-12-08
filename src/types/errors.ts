/**
 * All possible error codes.
 *
 * @export
 * @typedef {ERROR_CODES}
 */
export type ERROR_CODES =
    | "Manager__ProjectInteractionInvalidCauseNoPathProvided"
    | "Manager__InvalidArgumentPassed"
    | "Manager__IgnoreFile__InvalidLevel"
    | "Cleaner__InvalidCleanerIntensity"
    | "Internal__Projects__CantDetermineEnv"
    | "Project__FkNodeYaml__MissingLintCmd"
    | "Project__Cleaner__LintingWithNoLinter"
    | "Project__Cleaner__PrettifyingWithNoPrettifier"
    | "Project__FkNodeYaml__MissingPrettyCmd";
