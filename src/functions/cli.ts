/**
 * Output of a CLI command called using Commander.
 *
 * @interface CommanderOutput
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
     * @type {?string}
     */
    stdout?: string;
}

/**
 * Executes commands and automatically handles errors.
 *
 * Also, it logs their content synchronously (unless you hide output) so they look "real". PS. THAT ONE TOOK IT'S TIME
 *
 * @export
 * @async
 * @param {string} main Main command.
 * @param {string[]} stuff Additional args for the command.
 * @param {?boolean} showOutput Defaults to true. If false, the output of the command won't be shown and it'll be returned in the `CommanderOutput` promise instead.
 * @returns {Promise<CommanderOutput>} An object with a boolean telling if it was successful and its output.
 */
export async function Commander(main: string, stuff: string[], showOutput?: boolean): Promise<CommanderOutput> {
    if (showOutput === false) {
        const command = new Deno.Command(main, {
            args: stuff,
            stdout: "piped",
            stderr: "piped",
        });

        const process = await command.output();

        const result: CommanderOutput = {
            success: process.success,
            stdout: process.success ? new TextDecoder().decode(process.stdout) : new TextDecoder().decode(process.stderr),
        };

        return result;
    }

    const command = new Deno.Command(main, {
        args: stuff,
        stdout: "inherit",
        stderr: "inherit",
        stdin: "inherit",
    });

    const process = command.spawn();

    const result: CommanderOutput = {
        success: (await process.status).success,
    };

    return result;
}

/**
 * Validates if a command exists. Useful to check if the user has some tool installed before running anything. Uses `-v` as an arg to whatever command you pass.
 *
 * @export
 * @async
 * @param {string} cmd
 * @returns {Promise<boolean>}
 */
export async function CommandExists(cmd: string): Promise<boolean> {
    try {
        const process = new Deno.Command(cmd, {
            args: ["-v"], // this single line fixed a bug that has been present for at least two months 😭
            stdout: "null",
            stderr: "null",
        });

        return (await process.output()).success;
    } catch {
        // error = false
        return false;
    }
}
