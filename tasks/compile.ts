import { APP_NAME } from "../src/constants.ts";

function CompileApp(): void {
    const TARGETS = {
        win64: ["x86_64-pc-windows-msvc", "win64"],
        darwinArm: ["aarch64-apple-darwin", "macOs_arm"],
        linuxArm: ["aarch64-unknown-linux-gnu", "linux_arm"],
        darwin64: ["x86_64-apple-darwin", "macOs_x86_64"],
        linux64: ["x86_64-unknown-linux-gnu", "linux_x86_64"],
    };

    const ALL_COMMANDS = Object.entries(TARGETS).map(([_key, [target, output]]) => {
        const compiledName = `${APP_NAME.CASED}-${output}${target === "win64" ? ".exe" : ""}`;

        const compilerArguments = [
            "compile",
            "--allow-write", // write files, like project list
            "--allow-read", // read files, like a project's package.json
            "--allow-net", // fetch the network, to update the app
            "--allow-env", // see ENV variables, to access .../AppData/...
            "--allow-run", // run cleanup commands
            "--allow-sys", // used for an easter egg that requires `os.Uptime`
            "--unstable-cron",
            "--target",
            target!,
            "--output",
            `dist/${compiledName}`,
            "src/main.ts",
        ];

        return new Deno.Command("deno", { args: compilerArguments });
    });

    for (const CMD of ALL_COMMANDS) {
        const p = CMD.spawn();
        p.status.then((_status) => {});
    }
}

try {
    await 
    Deno.stat("./dist/");
    await   Deno.remove("./dist/", {
        recursive: true,
    });
}           catch {
    // no dist/
}

    Deno.mkdir("./dist/");

    CompileApp();
