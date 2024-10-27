import { APP_NAME } from "../src/constants.ts";

const TARGETS = {
    win64: ["x86_64-pc-windows-msvc", "win64"],
    darwinArm: ["aarch64-apple-darwin", "macOs_arm"],
    linuxArm: ["aarch64-unknown-linux-gnu", "linux_arm"],
    darwin64: ["x86_64-apple-darwin", "macOs_x86_64"],
    linux64: ["x86_64-unknown-linux-gnu", "linux_x86_64"],
};

const ALL_COMMANDS = Object.entries(TARGETS).map(([_key, [target, output]]) => {
    const compiledName = `${APP_NAME.CASED}-${output}${target === "win64" ? ".exe" : ""}`;

    const args = [
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

    return new Deno.Command("deno", { args });
});

await Deno.remove("./dist/", {
    recursive: true,
});

Deno.mkdir("dist/");

for (const CMD of ALL_COMMANDS) {
    const p = CMD.spawn();
    p.status.then((_status) => {});
}
