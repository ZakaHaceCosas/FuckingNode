import { APP_NAME, I_LIKE_JS, VERSION } from "../constants.ts";
import { ColorString } from "../functions/io.ts";
import { LogStuff } from "../functions/io.ts";
import type { tValidColors } from "../types/misc.ts";
import { phrases } from "../utils/phrases.ts";

function getRandomPhrase(phrases: string[]): string {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex] ?? "Make JS light again!";
}

function getRandomColor(colors: tValidColors[]): tValidColors {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return (colors[randomIndex]) ?? "white";
}

const colors: tValidColors[] = [
    "bright-blue",
    "cyan",
    "blue",
];

function colorizeText(text: string): string {
    const lines = text.split("\n");
    return lines.map((line) => {
        return ColorString(line, getRandomColor(colors));
    }).join("\n");
}

export default async function TheAbouter() {
    const ascii = `
███████ ██    ██  ██████ ██   ██ ██ ███    ██  ██████      ███    ██  ██████  ██████  ███████
██      ██    ██ ██      ██  ██  ██ ████   ██ ██           ████   ██ ██    ██ ██   ██ ██
█████   ██    ██ ██      █████   ██ ██ ██  ██ ██   ███     ██ ██  ██ ██    ██ ██   ██ █████
██      ██    ██ ██      ██  ██  ██ ██  ██ ██ ██    ██     ██  ██ ██ ██    ██ ██   ██ ██
██       ██████   ██████ ██   ██ ██ ██   ████  ██████      ██   ████  ██████  ██████  ███████ `;
    const ascii2 = `
███████╗        ██████╗██╗  ██╗██╗███╗   ██╗ ██████╗     ███╗   ██╗ ██████╗ ██████╗ ███████╗
██╔════╝▄ ██╗▄ ██╔════╝██║ ██╔╝██║████╗  ██║██╔════╝     ████╗  ██║██╔═══██╗██╔══██╗██╔════╝
█████╗   ████╗ ██║     █████╔╝ ██║██╔██╗ ██║██║  ███╗    ██╔██╗ ██║██║   ██║██║  ██║█████╗
██╔══╝  ▀╚██╔▀ ██║     ██╔═██╗ ██║██║╚██╗██║██║   ██║    ██║╚██╗██║██║   ██║██║  ██║██╔══╝
██║       ╚═╝  ╚██████╗██║  ██╗██║██║ ╚████║╚██████╔╝    ██║ ╚████║╚██████╔╝██████╔╝███████╗
╚═╝             ╚═════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚══════╝`;

    await LogStuff(colorizeText(Math.random() > 0.5 ? ascii2 : ascii));
    await LogStuff(getRandomPhrase(phrases), undefined, ["bright-green", "italic"]);
    await LogStuff(`Version ${ColorString(VERSION, "bright-yellow")}\n`, "package");
    await LogStuff(
        `Written in ${ColorString("TypeScript", "bright-blue")}.\n` +
            `Running in ${ColorString("Deno", "bright-yellow")}.\n` +
            `Developed in ${ColorString("Spain", "red")} by ${ColorString("ZakaHaceCosas", "bright-green")}.\n`,
    );
    await LogStuff(
        `${I_LIKE_JS.FK} communism, love freedom. this one's open-source: ${
            ColorString(`https://github.com/ZakaHaceCosas/${APP_NAME.CASED}`, "pink")
        }`,
    );
    await LogStuff(
        `${ColorString("Another side project", "italic")}, this one born ${
            ColorString("September 28, 2024", "cyan")
        } (a bit earlier but 'Initial commit' in the 1st repo was then)`,
    );
}
