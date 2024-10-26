# F*ckingNode

## Abstract

We as humans have dedicated years of hard work to a goal: fixing Node.

We created NPM, PNPM, YARN, added ES6, async/await, `fs.promises`, even TS with `--experimental-strip-types`, we changed the order and made Deno, then we got hungry and made Bun, then we made Deno 2... Everything has been getting us closer to a better Node, and now we're one step closer to fixing NodeJS.

**F\*ckingNode**, a CLI utility to automate cleanup of a Node user's worst nightmare: `node_modules/`.

> ### (yes i'm calling it like that and i'm shipping that to production, don't question me)

## Features

### Cleaner

- `fuckingnode clean` - does the obvious.
- `fuckingnode clean --update` - does the obvious + updates your deps.
- `fuckingnode clean --verbose` - does the obvious with some extra logs.
- `fuckingnode clean --maxim` - does a "maxim" cleanup (forcedly removes the `node_modules` directory).

`--flags` can be mixed to use more features at once.

### Manager

> [!NOTE]
> F\*ckingNode has a list of all paths to projects it should clean - it's you who has to maintain it:
>
> Keep in mind paths should point to the root, where you have `/package.json`, `/lockfile`[^1], and `/node_modules`.

- `fuckingnode manager list` - lists all projects.
- `fuckingnode manager list --ignored` - lists all ignored projects.
- `fuckingnode manager add <path>` - adds a project to list.
- `fuckingnode manager remove <path>` - removes a project from list.
- `fuckingnode manager ignore <path>` - ignores a project (won't be cleaned or updated).
- `fuckingnode manager revive <path>` - stops ignoring a project.

`<path>` refers to a path, either an absolute one (`C:\Users\me\project`), relative one (`../project`), or the `--self` flag which will use the Current Working Directory.

### Others

- `fuckingnode migrate <path> <"pnpm" | "npm" | "yarn">` - migrates a project to the specified package manager (basically removes lockfile, `node_modules`, and reinstalls with the selected package manager).
- `fuckingnode --help`, `fuckingnode --version`, and `fuckingnode self-update` - all do the obvious.

And that's it for now.

> [!TIP]
> If for any reason you want to skip a project without removing it from your list (idk, maybe you _temporarily_ don't want anyone to update deps for that specific project), create an empty `.fknodeignore` file in the root of the project and F*ckingNode will ignore it.

---

## Installation

1. Download the program from the [GitHub releases page](https://github.com/ZakaHaceCosas/FuckingNode/releases/latest). Windows (64), macOS and Linux (64 & ARM) are supported.
2. Place your downloaded file somewhere (e.g. a `C:\Scripts` folder, which is what I recommend).
3. Add the path to the binary to your system's path environment variable.
4. You're done! The `fuckingnode` command will now work from your terminal.

### Compiling from source

1. Install [Deno 2](https://docs.deno.com/runtime/).
2. Open this project from the root.
3. Run `deno task compile`.
4. An executable for each platform will be created at `dist/`. Run the executable for your platform (file names are specific to each platform).

---

Hope those motherf*ckers don't annoy you again! And hey, if you find any issue with the program, just open up an issue (or make a PR which would be awesome :smile:).

Cya!

[^1]: npm, pnpm, and yarn are supported, each one having it's own lockfile.
