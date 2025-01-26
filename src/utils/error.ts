import { I_LIKE_JS } from "../constants.ts";
import { GetAppPath } from "../functions/config.ts";
import { ColorString, MultiColorString } from "../functions/io.ts";
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
    hint: string | undefined;

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
        switch (this.code) {
            case "Manager__ProjectInteractionInvalidCauseNoPathProvided":
                this.hint =
                    'Provide the path to the project.\n    It can be relative (../node-project),\n    absolute (C:\\Users\\coolDev\\node-project),\n    or you can type "--self" to use the current working DIR.';
                break;
            case "Manager__IgnoreFile__InvalidLevel":
                this.hint =
                    "Valid ignore file levels are '*' for everything, 'cleaner' for project cleanup, and 'updater' for project updating.";
                break;
            case "Cleaner__InvalidCleanerIntensity":
                this.hint =
                    "Valid intensity levels are 'normal', 'hard', 'hard-only', and 'maxim'. If you want to use flags without providing an intensity (e.g. 'clean --verbose'), add -- before ('clean -- -verbose'). Run 'help clean' for more info onto what does each level do.";
                break;
            case "Internal__Projects__CantDetermineEnv":
                this.hint =
                    "This is an internal error regarding determination of a project's environment, there's not much that you can do. 'Thrown message' might help out, otherwise you might want to simply try again, or open up an issue on GitHub if it doesn't work.";
                break;
            case "Manager__NonExistingPath":
                this.hint =
                    "Check for typos - the path you provided wasn't found in the filesystem. If you're sure the path is right, maybe it's a permission issue. If not, open an issue on GitHub so we can fix our tool that fixes NodeJS ;).";
                break;
            case "Internal__NoEnvForConfigPath":
                this.hint = `We tried to find ${
                    ColorString(Deno.build.os === "windows" ? "APPDATA env variable" : "XDG_CONFIG_HOME and HOME env variables", "bold")
                } but failed, meaning config files cannot be created and the CLI can't work. Something seriously went ${I_LIKE_JS.MFLY} wrong. If these aren't the right environment variables for your system's config path (currently using APPDATA on Windows, /home/user/.config on macOS and Linux), please raise an issue on GitHub.`;
                break;
            case "Generic__NonFoundProject":
                this.hint =
                    `Check for typos or a wrong name. Given input (either a project's name / absolute path / relative path) wasn't found. Keep in mind a project must be added to your list (add it via 'manager add <path>') so we can work with it.`;
                break;
            case "Env__UnparsableMainFile":
                this.hint =
                    "Your project's main file (package.json, deno.json, go.mod, etc.) is unparsable. Check for typos or syntax errors. This is an internal error, so if you're sure the file is correct, please open an issue on GitHub.";
                break;
        }
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, FknError);
        }
    }

    /**
     * @param {string} [currentErr] Additional error details (optional).
     */
    private handleMessage(currentErr?: string): void {
        const messageParts: string[] = [
            ColorString(`A FknError happened! CODE: ${ColorString(this.code, "bold")}`, "red"),
        ];
        if (this.message) {
            messageParts.push(
                `Thrown message:            ${ColorString(this.message, "bright-yellow")}`,
            );
        }
        // i completely forgot what currentErr is for, but keep it in there i guess...
        if (currentErr !== undefined && currentErr !== this.message) {
            messageParts.push(
                "----------",
                "CurrentErr: " + ColorString(currentErr, "italic"),
                "----------",
            );
        }
        if (this.hint !== undefined) {
            messageParts.push(
                "----------",
                `${ColorString("Hint:", "bright-blue")} ${ColorString(this.hint, "italic")}`,
                "----------",
            );
        }

        console.error(messageParts.join("\n")); // don't risk it, maybe LogStuff() won't work
        return;
    }

    /**
     * Dumps a debug log into the `ERRORS` file. Write anything here, such as an entire main file string.
     *
     * @public
     * @async
     * @param {string} debuggableContent The content to be dumped.
     * @returns {Promise<void>}
     */
    public async debug(debuggableContent: string): Promise<void> {
        const debugPath = await GetAppPath("ERRORS");
        const debuggableError = {
            "timestamp": new Date().toISOString(),
            "FknError code": this.code,
            "thrown message": this.message,
            "thrown hint": this.hint,
            "---":
                " below goes the debugged content dump. this could be, for example, an entire project main file, dumped here for reviewal. it could be a sh*t ton of stuff to read ---",
            "debugged content": debuggableContent,
        };
        console.warn(ColorString(`For details about what happened, see last entry @ ${debugPath}.`, "orange"));
        await Deno.writeTextFile(
            debugPath,
            JSON.stringify(debuggableError, undefined, 4),
            {
                append: true,
            },
        );
    }

    /**
     * handles and exits the CLI. you should always call this immediately after throwing.
     */
    public exit(currentErr?: string): Promise<never> {
        this.handleMessage(currentErr);
        Deno.exit(1);
    }
}

/**
 * Handles an error and quits. Save up a few lines of code by using this in the `catch` block.
 *
 * @export
 * @param {unknown} e The error.
 * @returns {Promise<never>} _Below any call to this function nothing can happen. It exits the CLI with code 1._
 */
export function GenericErrorHandler(e: unknown): Promise<never> {
    if (e instanceof FknError) {
        e.exit(e.message);
    } else {
        console.error(`${MultiColorString(I_LIKE_JS.FK, "red", "bold")}! An unknown error happened: ${e}`);
    }
    Deno.exit(1); // <- doesn't do anything if the error is a FknError because e.exit() already exits, but without this VSCode rises an error (it doesn't know e.exit() is a <never>)
}
