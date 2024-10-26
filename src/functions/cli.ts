import { LogStuff } from "./io.ts";

/**
 * Output of a CLI command called using Commander.
 *
 * @interface CommanderOutput
 * @typedef {CommanderOutput}
 */
interface CommanderOutput {
    /**
     * True if success, false if failure.
     *
     * @type {boolean}
     */
    success: boolean;
    /**
     * Output of the command. Uses `stdout` or `stderr` depending on whether the command was successful.
     *
     * @type {string}
     */
    stdout: string;
}

/**
 * Executes commands and automatically handles errors.
 *
 * @export
 * @async
 * @param {string} main Main command.
 * @param {string[]} stuff Additional args for the command.
 * @param {boolean} log Whether to `LogStuff` the `stdout` or the `stderr`.
 * @returns {CommanderOutput} An object with a boolean telling if it was successful and it's stdout (or stderr).
 */
export async function Commander(main: string, stuff: string[], log: boolean): Promise<CommanderOutput> {
    const decoder = new TextDecoder();
    const command = new Deno.Command(main, {
        args: stuff,
    });
    const output = await command.output();

    if (!output.success) {
        if (!log) Deno.exit(1);
        await LogStuff(
            `An error happened with ${main} ${stuff.toString()}: ` + output.stderr ? decoder.decode(output.stderr) : "(Error is unknown)",
        );
        Deno.exit(1);
    }

    const result: CommanderOutput = {
        success: output.success,
        stdout: output.success ? decoder.decode(output.stdout) : decoder.decode(output.stderr),
    };

    return result;
}
