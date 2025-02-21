/**
 * All possible CLI error codes.
 *
 * @export
 */
export type GLOBAL_ERROR_CODES =
    | "Manager__ProjectInteractionInvalidCauseNoPathProvided"
    | "Manager__IgnoreFile__InvalidLevel"
    | "Cleaner__InvalidCleanerIntensity"
    | "Internal__Projects__CantDetermineEnv"
    | "Manager__NonExistingPath"
    | "Internal__NoEnvForConfigPath"
    | "Generic__NonFoundProject"
    | "Env__UnparsableMainFile"
    | "Interop__CannotRunJsLike"
    | "Unknown__CleanerTask__Lint"
    | "Unknown__CleanerTask__Pretty"
    | "Unknown__CleanerTask__Update"
    | "Commit__Fail__CommitCmd";

/**
 * All possible project validation error codes.
 */
export type PROJECT_ERROR_CODES = "IsDuplicate" | "NoPkgJson" | "NotFound" | "NoLockfile" | "CantDetermineEnv";
