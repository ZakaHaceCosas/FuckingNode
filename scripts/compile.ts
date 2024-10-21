// TODO: refactor this piece of garbage so this code isn't trash
import { APP_NAME, VERSION } from "../src/constants.ts";

const PERMISSIONS_NEEDED = ["--allow-read", "--allow-write", "--allow-net", "--allow-env", "--allow-run"];
const TARGETS = {
    win64: ["x86_64-pc-windows-msvc", "win64"],
    darwinArm: ["aarch64-apple-darwin", "macOs_arm"],
    linuxArm: ["aarch64-unknown-linux-gnu", "linux_arm"],
    darwin64: ["x86_64-apple-darwin", "macOs_x86_64"],
    linux64: ["x86_64-unknown-linux-gnu", "linux_x86_64"],
};

const ALL_COMMANDS = Object.entries(TARGETS).map(([_key, [target, output]]) => {
    const v = VERSION.replaceAll(".", "_");
    const compiledName = target![1] === "win64" ? `${APP_NAME.CASED}-${v}-${output}.exe` : `${APP_NAME.CASED}-${v}-${output}`;

    const args = [
        "compile",
        PERMISSIONS_NEEDED[0]!,
        PERMISSIONS_NEEDED[1]!,
        PERMISSIONS_NEEDED[2]!,
        PERMISSIONS_NEEDED[3]!,
        PERMISSIONS_NEEDED[4]!,
        "--target",
        target!,
        "--output",
        `dist/${compiledName}`,
        "src/main.ts",
    ];

    return new Deno.Command("deno", { args });
});

for (const CMD of ALL_COMMANDS) {
    const p = CMD.spawn();
    p.status.then((_status) => {});
}
