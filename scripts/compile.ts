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
            "--allow-read",
            "--allow-write",
            "--allow-net",
            "--allow-env",
            "--allow-run",
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

function CompileWindowsInstaller(): void {
    const compiledName = `${APP_NAME.CASED}-win64.exe`;

    const compilerArguments = [
        "compile",
        "--allow-write",
        "--allow-read",
        "--allow-net",
        "--allow-env",
        "--allow-run",
        "--target",
        "x86_64-pc-windows-msvc",
        "--output",
        `dist/INSTALLER-${compiledName}`,
        "src/main.ts",
    ];

    const CMD = new Deno.Command("deno", { args: compilerArguments });

    const p = CMD.spawn();
    p.status.then((_status) => {});
}

await Deno.remove("./dist/", {
    recursive: true,
});

Deno.mkdir("dist/");

CompileApp();
CompileWindowsInstaller();
