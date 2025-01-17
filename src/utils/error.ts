import TheHelper from "../commands/help.ts";
import { I_LIKE_JS } from "../constants.ts";
import { ColorString, LogStuff } from "../functions/io.ts";
import type { GLOBAL_ERROR_CODES } from "../types/errors.ts";

/**
 * Errors that we know about, or that are caused by the user.
 *
 * @export
 * @class FknError
 * @extends {Error}
 */
export class FknError extends Error {
    code: GLOBAL_ERROR_CODES;

    /**
     * Creates an instance of FknError.
     *
     * @constructor
     * @param {GLOBAL_ERROR_CODES} code
     * @param {?string} [message]
     */
    constructor(code: GLOBAL_ERROR_CODES, message?: string) {
        super(message);
        this.name = "FknError";
        this.code = code;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, FknError);
        }
    }

    /**
     * @param {string} [currentErr] Additional error details (optional).
     */
    public async handleMessage(currentErr?: string): Promise<void> {
        let hint: string | null;

        switch (this.code) {
            case "Manager__ProjectInteractionInvalidCauseNoPathProvided":
                hint =
                    'Provide the path to the project.\n    It can be relative (../node-project),\n    absolute (C:\\Users\\coolDev\\node-project),\n    or you can type "--self" to use the current working DIR.';
                break;
            case "Manager__InvalidArgumentPassed":
                await TheHelper({ query: "manager" });
                return;
            case "Manager__IgnoreFile__InvalidLevel":
                hint = "Valid ignore file levels are '*' for everything, 'cleaner' for project cleanup, and 'updater' for project updating.";
                break;
            case "Cleaner__InvalidCleanerIntensity":
                hint =
                    "Valid intensity levels are 'normal', 'hard', 'hard-only', and 'maxim'. If you want to use flags without providing an intensity (e.g. 'clean --verbose'), add -- before ('clean -- -verbose'). Run 'help clean' for more info onto what does each level do.";
                break;
            case "Internal__Projects__CantDetermineEnv":
                hint =
                    "This is an internal error regarding determination of a project's environment, there's not much that you can do. You might want to try again, or open an issue on GitHub.";
                break;
            case "Manager__NonExistingPath":
                hint =
                    "Check for typos - the path you provided wasn't found in the filesystem. If you're sure the path is right, maybe it's a permission issue. If not, open an issue on GitHub so we can fix our tool that fixes NodeJS ;).";
                break;
            case "Internal__NoEnvForConfigPath":
                hint = `We tried to find ${
                    ColorString(Deno.build.os === "windows" ? "APPDATA env variable" : "XDG_CONFIG_HOME and HOME env variables", "bold")
                } but failed, meaning config files cannot be created and the CLI can't work. Something seriously went ${I_LIKE_JS.MFLY} wrong. If these aren't the right environment variables for your system's config path (currently using APPDATA on Windows, /home/user/.config on macOS and Linux), please raise an issue on GitHub.`;
                break;
            case "Generic__NonFoundProject":
                hint =
                    `Check for typos or a wrong name. Given input (either a project's name / absolute path / relative path) wasn't found. Keep in mind a project must be added to your list (add it via 'manager add <path>') so we can work with it.`;
                break;
            default:
                hint = null;
                break;
        }

        const messageParts: string[] = [
            ColorString(`A FknError happened! CODE: ${ColorString(this.code, "bold")}`, "red"),
        ];
        if (this.message) {
            messageParts.push(
                `Thrown message:               ${ColorString(this.message, "bright-yellow")}`,
            );
        }
        if (currentErr !== undefined && currentErr !== this.message) {
            messageParts.push(
                "----------",
                "CurrentErr: " + ColorString(currentErr, "italic"),
                "----------",
            );
        }
        if (hint !== null) {
            messageParts.push(
                "----------",
                `${ColorString("Hint:", "bright-blue")} ${ColorString(hint, "italic")}`,
                "----------",
            );
        }

        this.code === "Internal__NoEnvForConfigPath"
            ? console.error(messageParts.join("\n")) // if no env, LogStuff() won't work
            : await LogStuff(messageParts.join("\n"), "error");
        return;
    }

    /**
     * handles and exits the CLI. you should always call this immediately after throwing.
     */
    public async exit(currentErr?: string): Promise<never> {
        await this.handleMessage(currentErr);
        Deno.exit(1);
    }
}

/**
 * Handles an error and quits. Save up a few lines of code by using this in the `catch` block.
 *
 * @export
 * @async (async because it uses `await LogStuff()`)
 * @param {unknown} e The error.
 * @returns {Promise<never>} _Below any call to this function nothing can happen. It exits the CLI with code 1._
 */
export default async function GenericErrorHandler(e: unknown): Promise<never> {
    if (e instanceof FknError) {
        await e.exit(e.message);
    } else {
        await LogStuff(`${I_LIKE_JS.FK}! An unknown error happened: ${e}`, "error", "red");
    }
    Deno.exit(1); // <- doesn't do anything if the error is a FknError because e.exit() already exits, but without this VSCode rises an error (it doesn't know e.exit() is a <never>)
}
