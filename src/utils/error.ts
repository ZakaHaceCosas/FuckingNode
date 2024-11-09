import { ColorString, LogStuff } from "../functions/io.ts";

/**
 * Simply logs an error and quits. Save up a few lines of code by using this in the `catch` block.
 *
 * @export
 * @async (async because it uses `await LogStuff()`)
 * @param {unknown} e The error.
 * @returns {Promise<never>} _Below any call to this function nothing can happen. It exits the CLI with code 1._
 */
export default async function GenericErrorHandler(e: unknown): Promise<never> {
    await LogStuff(`${ColorString("An error happened:", "red")} ${e}`, "error");
    Deno.exit(1);
}
