import TheHelper from "../commands/help.ts";
import { type ERROR_CODES, type SUPPORTED_EMOJIS, validColors } from "../types.ts";
import { GetAppPath } from "./config.ts";

/**
 * Appends an emoji at the beginning of a message.
 *
 * @export
 * @param {string} message Your message, e.g. `"hi chat"`.
 * @param {SUPPORTED_EMOJIS} emoji What emoji you'd like to append, e.g. `"bruh"`.
 * @returns {string} The message with your emoji, e.g. `"😐 hi chat"`.
 */
export function Emojify(message: string, emoji: SUPPORTED_EMOJIS): string {
    switch (emoji) {
        case "danger":
            return `🛑 ${message}`;
        case "prohibited":
            return `⛔ ${message}`;
        case "wip":
            return `🚧 ${message}`;
        case "what":
            return `❓ ${message}`;
        case "bulb":
            return `💡 ${message}`;
        case "tick":
            return `✅ ${message}`;
        case "tick-clear":
            return `✔ ${message}`;
        case "error":
            return `❌ ${message}`;
        case "warn":
            return `⚠️ ${message}`;
        case "heads-up":
            return `🚨 ${message}`;
        case "working":
            return `🔄 ${message}`;
        case "moon-face":
            return `🌚 ${message}`;
        case "bruh":
            return `😐 ${message}`;
        case "package":
            return `📦 ${message}`;
        case "trash":
            return `🗑 ${message}`;
        case "chart":
            return `📊 ${message}`;
        default:
            return message;
    }
}

/**
 * Logs a message to the standard output and saves it to a `.log` file.
 *
 * @export
 * @async
 * @param {string} message The message to be logged.
 * @param {?SUPPORTED_EMOJIS} [emoji] Additionally, add an emoji before the log.
 * @param {?boolean} silent Optional. If true, log will be made without saving to the `.log` file.
 * @param {?boolean} question If true, the log will act as a y/N confirm. Will return true if the user confirms, false otherwise.
 * @param {?boolean} verbose If false, stuff will be saved to `.log` file but not written to the `stdout`. Pass here the variable you use to handle verbose logs.
 * @returns {Promise<boolean>} Boolean value if it's a question depending on user input. If it's not a question, to avoid a type error for being `void`, it always returns false.
 */
export async function LogStuff(
    message: string,
    emoji?: SUPPORTED_EMOJIS,
    silent?: boolean,
    question?: boolean,
    verbose?: boolean,
): Promise<boolean> {
    const finalMessage = emoji ? Emojify(message, emoji) : message;
    if (verbose === undefined) {
        console.log(finalMessage);
    } else if (verbose === true) {
        console.log(finalMessage);
    }

    try {
        const logged = `${finalMessage} ... @ ${new Date().toLocaleString()}` + "\n";

        if (!silent) {
            await Deno.writeTextFile(await GetAppPath("LOGS"), logged, {
                append: true,
            });
        }

        if (question) {
            const c = confirm("Confirm?");
            return c;
        } else {
            return false;
        }
    } catch (e) {
        console.error(`Error logging stuff: ${e}`);
        throw e;
    }
}

/**
 * Shorthand function to show errors in here.
 *
 * @async
 * @param {ERROR_CODES} errorCode The code of the error. They're pretty specific / verbose.
 * @param {string} currentErr If you can't provide a code, because of an unknown error, pass the `e` here so the exception is handled.
 * @returns {Promise<void>}
 */
export async function ErrorMessage(
    errorCode: ERROR_CODES,
    currentErr?: string,
): Promise<void> {
    let message: string;

    switch (errorCode) {
        case "Manager__ProjectInteractionInvalidCauseNoPathProvided":
            message =
                'Provide the path to the project.\n    It can be relative (../node-project),\n    absolute (C:\\Users\\coolDev\\node-project),\n    or you can type "--self" to use the current working DIR.';
            break;
        case "Manager__InvalidArgumentPassed":
            await TheHelper({ query: "manager" });
            return;
        default:
            message = "Unknown error. Exception: ";
            break;
    }

    await LogStuff(
        ColorString("Error: ", "red") + currentErr ? message : message + currentErr,
        "warn",
        undefined,
        false,
    );
}

/**
 * Adds whitespace before a string.
 *
 * @export
 * @param {string} prev String itself.
 * @param {number} n Amount of whitespace to add before.
 * @returns {string} The spaced string.
 */
export function SpaceString(prev: string, n: number): string {
    return `${" ".repeat(n)}${prev}`;
}

/**
 * Given a string, e.g. "help", returns an array of all strings that could be considered a `--flag`, so you can test a string against that flag.
 *
 * @export
 * @param {string} flag String you want to test.
 * @param {boolean} min When true, using just the 1st letter of the provided string (e.g. "--h") is also counted as valid.
 * @returns {string[]}
 */
export function ParseFlag(flag: string, min: boolean): string[] {
    const target: string = flag.trim().toLowerCase();

    const response: string[] = [`--${target}`, `-${target}`];

    if (min) response.push(`--${target.charAt(0)}`, `-${target.charAt(0)}`);

    return response;
}

/**
 * Given a string, returns a colored version of it. Does take care of end-of-string resetting.
 *
 * @export
 * @param {string} string The string.
 * @param {validColors} color The color you wish to give it. Some styles that aren't "colors" are also allowed, e.g. `bold`.
 * @returns {string}
 */
export function ColorString(string: string, color: validColors): string {
    // 1) \033 2) \x1b
    const RESET = "\x1b[0m";
    let colorCode = RESET;

    switch (color) {
        case "red":
            colorCode = "\x1b[31m";
            break;
        case "white":
            colorCode = "\x1b[37m";
            break;
        case "bold":
            colorCode = "\x1b[1m";
            break;
        case "blue":
            colorCode = "\x1b[34m";
            break;
        case "green":
            colorCode = "\x1b[32m";
            break;
        case "cyan":
            colorCode = "\x1b[36m";
            break;
        case "purple":
            colorCode = "\x1b[35m";
            break;
        case "pink":
            colorCode = "\x1b[38;5;213m"; // idk if this will work...
            break;
        case "half-opaque":
            colorCode = "\x1b[2m";
            break;
        case "bright-green":
            colorCode = "\x1b[92m";
            break;
        case "bright-blue":
            colorCode = "\x1b[94m";
            break;
        case "bright-yellow":
            colorCode = "\x1b[94m";
            break;
        case "italic":
            colorCode = "\x1b[3m";
            break;
        default:
            break;
    }

    return `${colorCode}${string}${RESET}`;
}
