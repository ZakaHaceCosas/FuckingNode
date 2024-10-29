import { ensureDir } from "@std/fs";
import { join } from "@std/path";
import { APP_NAME } from "../src/constants.ts";
import { FetchGitHub } from "../utils/fetch.ts";
import type { GITHUB_RELEASE } from "../src/types.ts";

const repo = `ZakaHaceCosas/${APP_NAME.CASED}`;
const installDir = `C:\\${APP_NAME.CASED}`;
const exePath = join(installDir, `${APP_NAME.CASED}.exe`);

// get latest ver
async function getLatestReleaseUrl(): Promise<string> {
    const response = await FetchGitHub(`https://api.github.com/repos/${repo}/releases/latest`);
    const data: GITHUB_RELEASE = await response.json();
    const asset = data.assets.find((a: { name: string }) => a.name.endsWith(".exe") && !a.name.includes("INSTALLER")); // should return the windows exe file
    if (!asset) throw new Error("No .exe file found in the latest release.");
    return asset.browser_download_url;
}

// get .exe file
async function downloadExe(url: string) {
    const response = await fetch(url);
    const fileData = new Uint8Array(await response.arrayBuffer());

    await ensureDir(installDir);
    await Deno.writeFile(exePath, fileData); // saves the exe
}

async function addToPath() {
    // get current path
    const currentPath = Deno.env.get("PATH") || "";
    const newPath = `${currentPath};${installDir}`;

    // adds the file to path
    const command = new Deno.Command("cmd", {
        args: ["/c", "setx", "PATH", newPath],
    });
    const c = command.spawn();
    await c.output();
    console.log(`Added ${installDir} to PATH.`);
}

// install
async function runInstaller() {
    try {
        const url = await getLatestReleaseUrl();
        await downloadExe(url);
        await addToPath();
        console.log("Installed successfully. Restart terminal for it to work.");
    } catch (error) {
        console.error("Error:", error);
    }
}

runInstaller();
