import { ensureDir } from "@std/fs";
import { join } from "@std/path";
import { APP_NAME } from "../src/constants.ts";
import { FetchGitHub } from "../src/utils/fetch.ts";
import type { GITHUB_RELEASE, tURL } from "../src/types.ts";
import { ParsePath } from "../src/functions/filesystem.ts";

const repo = `ZakaHaceCosas/${APP_NAME.CASED}`;
const installDir = await ParsePath(`C:\\${APP_NAME.CASED}`);
const exePath = join(installDir, `${APP_NAME.CLI}.exe`);

// get latest ver
async function GetLatestReleaseUrl(): Promise<tURL> {
    try {
        console.log("Fetching latest release from GitHub...");
        const response = await FetchGitHub(`https://api.github.com/repos/${repo}/releases/latest`);
        const data: GITHUB_RELEASE = await response.json();

        const asset = data.assets.find((a: { name: string }) => a.name.endsWith(".exe") && !a.name.includes("INSTALLER")); // should return the windows exe file
        if (!asset) throw new Error("No .exe file found in the latest release.");

        console.log("Fetched.");
        return asset.browser_download_url as tURL;
    } catch (e) {
        throw e;
    }
}

// get .exe file
async function DownloadApp(url: string): Promise<void> {
    try {
        console.log("Downloading...");
        const response = await fetch(url);
        const fileData = new Uint8Array(await response.arrayBuffer());

        await ensureDir(installDir);
        await Deno.writeFile(exePath, fileData); // saves the exe
        console.log("Downloaded successfully");
        return;
    } catch (e) {
        throw e;
    }
}

async function AddAppToPath(): Promise<void> {
    try {
        console.log("Adding shorthand to PATH");
        // get current path
        const currentPath = Deno.env.get("PATH");
        if (!currentPath || currentPath === undefined) {
            throw new Error("No path / Path is undefined."); // could you imagine accidentally deleting a user's PATH variable? idk if that's even possible but damn, that would be crazy LMAO. this Error avoids it.
        }
        const newPath = `${currentPath};${installDir}`;

        // adds the file to path
        const command = new Deno.Command("cmd", {
            args: ["/c", "setx", "PATH", newPath],
        });
        await command.spawn().output();
        console.log(`Added ${installDir} to PATH.`);
        return;
    } catch (e) {
        throw e;
    }
}

// install
async function Installer() {
    try {
        console.log(`hi! we'll install ${APP_NAME.STYLED} for you. just a sec!`);
        const url = await GetLatestReleaseUrl();
        await DownloadApp(url);
        await AddAppToPath();
        console.log("Installed successfully! Restart your terminal for it to work.");
    } catch (e) {
        console.error("Error:", e);
    }
}

Installer();
