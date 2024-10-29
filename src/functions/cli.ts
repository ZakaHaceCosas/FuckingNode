import { LogStuff } from "./io.ts";

/**
 * Output of a CLI command called using Commander.
 *
 * @interface CommanderOutput
 * @typedef {CommanderOutput}
 */
export interface CommanderOutput {
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
 * Also, it _tries_ to log their content so they look "real" - that still has some known issues. But it works for now, so there's no reason to touch it.
 *
 * @export
 * @async
 * @param {string} main Main command.
 * @param {string[]} stuff Additional args for the command.
 * @returns {Promise<CommanderOutput>} An object with a boolean telling if it was successful and its output.
 */
export async function Commander(main: string, stuff: string[]): Promise<CommanderOutput> {
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const command = new Deno.Command(main, {
        args: stuff,
        stdout: "piped",
        stderr: "piped",
    });

    const process = command.spawn();

    for await (const chunk of process.stdout) {
        const output = decoder.decode(chunk);
        Deno.stdout.writeSync(encoder.encode("\x1b[2K\r")); // this should clean the stdout
        Deno.stdout.writeSync(encoder.encode(output));
    }

    for await (const chunk of process.stderr) {
        const errorOutput = decoder.decode(chunk);
        Deno.stderr.writeSync(encoder.encode("\x1b[2K\r")); // this should clean the stderr
        Deno.stderr.writeSync(encoder.encode(errorOutput));
    }

    const output = await process.output();

    if (!output.success) {
        const errorMessage = output.stderr ? decoder.decode(output.stderr) : "(Error is unknown)";

        await LogStuff(`An error happened with ${main} ${stuff.join(" ")}: ${errorMessage}`);
        Deno.exit(1);
    }

    const result: CommanderOutput = {
        success: output.success,
        stdout: output.success ? decoder.decode(output.stdout) : decoder.decode(output.stderr),
    };

    return result;
}

/**
 * Validates if a command exists. Useful to check if the user has some tool installed before running anything.
 *
 * @export
 * @async
 * @param {string} cmd
 * @returns {Promise<boolean>}
 */
export async function CommandExists(cmd: string): Promise<boolean> {
    try {
        const process = new Deno.Command(cmd);

        const status = await process.spawn().status;

        return status.success;
    } catch {
        // error = false
        return false;
    }
}
