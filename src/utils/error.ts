import { join } from "@std/path/join";
import { APP_NAME, I_LIKE_JS } from "../constants.ts";
import { ColorString } from "../functions/io.ts";
import type { GLOBAL_ERROR_CODES } from "../types/errors.ts";
import { GetDateNow } from "../functions/date.ts";
import { StringUtils, type UnknownString } from "@zakahacecosas/string-utils";
import { __FKNODE_SHALL_WE_DEBUG } from "../main.ts";

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
                    ColorString(
                        Deno.build.os === "windows" ? "APPDATA env variable" : "XDG_CONFIG_HOME and HOME env variables",
                        "bold",
                    )
                } but failed, meaning config files cannot be created and the CLI can't work. Something seriously went ${I_LIKE_JS.MFLY} wrong. If these aren't the right environment variables for your system's config path (currently using APPDATA on Windows, /home/user/.config on macOS and Linux), please raise an issue on GitHub.`;
                break;
            case "Generic__NonFoundProject":
                this.hint =
                    `Check for typos or a wrong name. Given input (either a project's name / absolute path / relative path) wasn't found. Keep in mind a project must be added to your list (add it via 'manager add <path>') so we can work with it.`;
                break;
            case "Env__UnparsableMainFile":
                this.hint =
                    "Your project's main file (package.json, deno.json, go.mod, etc.) is unparsable. Check for typos or syntax errors. If you're sure the file is correct, please open an issue on GitHub (if everything's right, it might be a bug with our interop layer).";
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
     * @param {string} debuggableContent The content to be dumped.
     * @returns {Promise<void>}
     */
    public debug(debuggableContent: UnknownString): void {
        const base = Deno.build.os === "windows"
            ? Deno.env.get("APPDATA")
            : (Deno.env.get("XDG_CONFIG_HOME") || `${Deno.env.get("HOME") ?? ""}.config/`);
        // base! because if we're already debugging stuff we assume the CLI got to run
        // meaning that path does exist
        const debugPath = join(base!, APP_NAME.CLI, `${APP_NAME.CLI}-errors.log`);
        const debuggableError = `\n
---
# BEGIN FknERROR ${this.code} @ ${new Date().toISOString()}
---
- INFO (so you know where you at)
Timestamp      :  ${GetDateNow()},
FknError code  :  ${this.code},
Thrown message :  ${this.message},
Thrown hint    :  ${this.hint},
- STACK (so the dev knows where he at)
${this.stack}
-
below goes the debugged content dump. this could be, for example, an entire project main file, dumped here for reviewal. it could be a sh*t ton of stuff to read
- DEBUGGABLE CONTENT (in most cases, what the CLI command that was executed returned, in case we were able to gather it)
${StringUtils.stripCliColors(debuggableContent ?? "UNKNOWN OUTPUT - No debuggableContent was provided, or it was empty.")}
---
# END   FknERROR ${this.code} # GOOD LUCK FIXING THIS
---\n
        `.trim();
        console.warn(ColorString(`For details about what happened, see last entry @ ${debugPath}`, "orange"));
        Deno.writeTextFileSync(
            debugPath,
            debuggableError,
            {
                append: true,
            },
        );
    }

    /**
     * handles and exits the CLI. you should always call this immediately after throwing.
     */
    public exit(currentErr?: string, continueFlow: boolean = true): void | never {
        this.handleMessage(currentErr);
        if (continueFlow === false) Deno.exit(1);
    }
}

/**
 * Handles an error and quits. Save up a few lines of code by using this in the `catch` block.
 *
 * @export
 * @param {unknown} e The error.
 * @param {boolean} continueExecution If true, return changes up from never to void.
 * @returns {never | void} _Below any call to this function nothing can happen. It exits the CLI with code 1._
 */
export function GenericErrorHandler(e: unknown, continueExecution: true): void;
export function GenericErrorHandler(e: unknown, continueExecution: false): never;
export function GenericErrorHandler(e: unknown, continueExecution: boolean): void | never {
    if (e instanceof FknError) {
        e.exit(e.message, continueExecution);
    } else {
        console.error(`${ColorString(I_LIKE_JS.FK, "red", "bold")}! An unknown error happened: ${e}`);
        if (continueExecution === false) Deno.exit(1);
    }
}

// constant case instead of pascal case so i can better recognize this
export function DEBUG_LOG(...a: unknown[]): void {
    if (__FKNODE_SHALL_WE_DEBUG) console.debug(a);
}
