import { type SUPPORTED_EMOJIS } from "../types.ts";
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
 * @returns {Promise<boolean>} Boolean value if it's a question depending on user input. If it's not a question, to avoid a type error for being `void`, it always returns false.
 */
export async function LogStuff(
    message: string,
    emoji?: SUPPORTED_EMOJIS,
    silent?: boolean,
    question?: boolean,
): Promise<boolean> {
    const finalMessage = emoji ? Emojify(message, emoji) : message;
    console.log(finalMessage);

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
 * @param {boolean} min Optional. When true, using just the 1st letter of the provided string (e.g. "--h") is also counted as valid.
 * @returns {string[]}
 */
export function ParseFlag(flag: string, min: boolean): string[] {
    const target: string = flag.trim().toLowerCase();

    const response: string[] = [`--${target}`, `-${target}`];

    if (min) response.push(`--${target.charAt(0)}`, `-${target.charAt(0)}`);

    return response;
}
