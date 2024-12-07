// i spent my time writing all of this instead of studying
// bruh
import { APP_NAME, I_LIKE_JS } from "../constants.ts";

// some of these are jokes only me and some people (mostly friends) will get
// others are just really random (but real) phrases
const internalJokes = [
    "Dima approves",
    "Dima definitely approves", // indeed he does
    "Sokora Seal of Approval", // and i'm proud of it
    "verified, just as sokora", // indeed
    "(not) powered by Vuelto <https://vuelto.me>", // rewrite to Vuelto coming 2026
    "Proudly running on anything but a FireBlitz server", // those who know :skull:
    "not made in germany", // those who know :skull:
    `(it's called like this because node is ${I_LIKE_JS.FKN} annoying, not because i ${I_LIKE_JS.FK} it)`, // (someone really told me the 2nd one)
    "Proudly made by ZakaHaceCosas (translates to 'ZakaMakesStuff')", // YOO
    "Proudly developed in Spain (the S is silent)", // elections here don't work, i swear
    "i should be studying chemistry and i'm writing random phrases for this thing", // real btw
    "weeb > furry", // indeed
    "i'm grounded", // this is real btw
    "haccing skill #3: download a CLI tool", // the 3rd one in a series
    "brick",
];

const internalQuotes = [
    "'You are supposed to cool it, not heat it up' - Herpes of Balkan", // i mean, he's right
    "THE DAY OF Ws - serge", // that was a good day
    "lmfao - serge", // such a quote is worth a book
    "am jok - serge", // hes jok
    "pelase dont kil - serge",
    "shork thinking its smol fish crushes goose!!!! - serge",
    "it's sokover", // from the creators of it's joever (not)
];

const coolJokes = [
    "that's what she said",
    "runs faster than a Roblox server on a saturday",
    "stay safe",
    "i don't get paid for writing phrases... here's another one",
    `This PC has been running for ${Deno.osUptime() / 60} minutes.`,
    "Freedom for Venezuela!",
];

const devJokes = [
    "git commit -m 'rewrite to Lua'",
    "git commit -m 'send help'",
    "git commit -m 'fix previous fix again'",
    "curl parrot.live",
    "midudev would approve",
    "#RewriteToBrainF\*ck",
    "No AI was used to generate these random phrases.\n\nI hope these random phrases look good enough. Happy coding!", // it's a joke lmao, i did not use AI for these
    "not powered by OpenAI",
    "an ecosystem where 'npm install is-odd' is a thing, is a broken ecosystem",
    "Proudly made from mom's basement",
    "try { study() } catch { study_harder() } finally { workAt('aliExpress') }",
    "REACT_DO_NOT_USE_THIS_OR_YOU_WILL_BE_FIRED",
    "Proudly running from a CLI capable of running Doom",
    "rm -rf .git/",
    "CTRL+C & CTRL+V, winners of the Most Used Key award",
];

const appRelatedJokes = [
    "funnily enough, it could be an(other) npm package",
    "using javascript to fix javascript (again)",
    "made in Deno, made for Node, made eating a Bun",
    "don't tell mommy i said the f-word",
    `question: how do you end up downloading a CLI tool literally called '${APP_NAME.STYLED}'?`,
    "fun fact: this started as a .ps1 script i used to automate cleaning of my own node_modules",
    "fun fact: it's not made in node",
    "(we need a logo)",
];

const brandingJokes = [
    "Make JS light again!",
    `${I_LIKE_JS.FKN} awesome`,
    `${APP_NAME.CASED}/Deno/Bun, actually`,
    `${I_LIKE_JS.FKN}JSRuntimesInGeneral, actually`,
];

const quotes = [
    "'Anything that can be written in JavaScript, will be eventually written in JavaScript' - Jeff Atwood",
    "'It just works' - Steve Jobs",
];

export const phrases = [
    ...devJokes,
    ...coolJokes,
    ...internalJokes,
    ...brandingJokes,
    ...appRelatedJokes,
    ...quotes,
    ...internalQuotes,
];
