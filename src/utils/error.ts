import TheHelper from "../commands/help.ts";
import { ColorString, LogStuff } from "../functions/io.ts";
import type { ERROR_CODES } from "../types.ts";

export class FknError extends Error {
    code: ERROR_CODES;

    constructor(code: ERROR_CODES, message?: string) {
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
        let message: string;

        switch (this.code) {
            case "Manager__ProjectInteractionInvalidCauseNoPathProvided":
                message =
                    'Provide the path to the project.\n    It can be relative (../node-project),\n    absolute (C:\\Users\\coolDev\\node-project),\n    or you can type "--self" to use the current working DIR.';
                break;
            case "Manager__InvalidArgumentPassed":
                await TheHelper({ query: "manager" });
                return;
            default:
                message = "Unknown error.";
                break;
        }

        const fullMessage = currentErr ? `${message} Exception: ${currentErr}` : message;
        await LogStuff(ColorString("Error: ", "red") + fullMessage, "error");
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
        const errorMessage = `${ColorString("An unknown error happened:", "red")} ${e}`;
        await LogStuff(errorMessage, "error");
    }
    Deno.exit(1); // <- doesn't do anything if the error is a FknError because e.exit() already exits, but without this VSCode rises an error (it doesn't know e.exit() is a <never>)
}
