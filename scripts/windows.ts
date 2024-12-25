import { ensureDir } from "@std/fs";
import { APP_NAME } from "../src/constants.ts";
import { FetchGitHub } from "../src/utils/fetch.ts";
import type { GITHUB_RELEASE, tURL } from "../src/types/misc.ts";
import { JoinPaths, ParsePath } from "../src/functions/filesystem.ts";
import GenericErrorHandler from "../src/utils/error.ts";

const repo = `ZakaHaceCosas/${APP_NAME.CASED}`;
const installDir = await ParsePath(`C:\\${APP_NAME.CASED}`);
const installPath = await JoinPaths(installDir, `${APP_NAME.CLI}.exe`);

// get latest ver
async function GetLatestReleaseUrl(): Promise<tURL> {
    try {
        console.log("Fetching latest release from GitHub...");
        const response = await FetchGitHub(`https://api.github.com/repos/${repo}/releases/latest`);
        if (!response.ok) {
            throw new Error(`GitHub API returned a ${response.status} error: ${response.statusText}`);
        }
        const data: GITHUB_RELEASE = await response.json();
        if (!data || !data.assets) {
            throw new Error("Unexpected API response: Missing 'assets' field.");
        }

        const asset = data.assets.find(
            (a: { name: string }) => {
                return a.name.endsWith(".exe") && !a.name.includes("INSTALLER"); // should return the windows exe file
            },
        );
        if (!asset) {
            throw new Error("No suitable .exe file found in the latest release.");
        }

        console.log("Fetched successfully.");
        return asset.browser_download_url as tURL;
    } catch (e) {
        throw new Error(`Error fetching the latest release URL: ${e}`);
    }
}

// get .exe file
async function DownloadApp(url: string): Promise<void> {
    try {
        console.log("Downloading...");
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Downloading returned a ${response.status} error: ${response.statusText}`);
        }
        const fileData = new Uint8Array(await response.arrayBuffer());
        await ensureDir(installDir);
        await Deno.writeFile(installPath, fileData);
        console.log("Downloaded successfully!");
    } catch (e) {
        throw new Error(`Error downloading: ${e}`);
    }
}

// add app to PATH
async function AddAppToPath(): Promise<void> {
    try {
        console.log("Adding shorthand to PATH...");
        // get current path
        const currentPath = Deno.env.get("PATH");
        if (!currentPath || currentPath == undefined || currentPath == "") {
            throw new Error("No path / Path is undefined."); // could you imagine accidentally deleting a user's PATH variable? idk if that's even possible but damn, that would be crazy LMAO. this Error avoids it.
        }

        const newPath = `${currentPath};${installDir}`;

        // adds the file to path
        const command = new Deno.Command("cmd", {
            args: ["/c", "setx", "PATH", newPath],
        });
        await command.spawn().output();
        console.log(`Added ${installDir} to PATH.`);
        console.warn("Note: Restart your terminal or PC for PATH changes to take effect.");
    } catch (e) {
        throw new Error(`Error adding app to PATH: ${e}`);
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
        await GenericErrorHandler(e);
    }
}

Installer();
