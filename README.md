<!-- markdownlint-disable -->

# F*ckingNode

## Abstract

Tired of Node projects' ~~motherf*cking~~ `node_modules` directory and their space consumption, I once switched to
`pnpm` (my greatest decision in years) and started manually removing all `node_modules` folders and `pnpm` pruning all
of my projects.

This was time consuming, but it felt worth it - just the day I got pnpm and did a `node_modules` cleanup I recovered ~11
GB of space. Anyway, pne day I had the idea of automating the process with a PowerShell script, and it felt good - so
good that I turned that `ps1` code into a desktop app using TypeScript and ~~Node backwards~~ Deno: **F*ckingNode**.

<!-- deno-fmt-ignore -->
> ###### (yes i'm calling it like that and i'm shipping that to production, don't question me)

## Installation

Currently only Windows is supported. I'll look onto Linux, which I'd love to support.

1. Download the `.exe` from the [GitHub releases page](https://github.com/ZakaHaceCosas/FuckingNode/releases/latest).
2. Place that somewhere (e.g. a `C:\Scripts` folder, which is what I recommend).
3. Enter Windows Search and type "Edit environment variables for your account". Open that.
4. You'll see a modal with two lists, both having a "Path" entry. On each one, click edit, then New, and then type the
   path you saved F*ckingNode to (e.g. `C:\Scripts\FuckingNode.exe`).
5. Save both lists and you're done! The `fuckingnode` command will now work from your terminal.

## Usage

### Cleaner

- `fuckingnode clean` - does the obvious.
- `fuckingnode clean --update` - does the obvious + updates your deps.
- `fuckingnode clean --verbose` - does the obvious with some extra logs.
- `fuckingnode clean --maxim` - does a "maxim" cleanup (AKA instead of using npm / pnpm / yarn cleanup commands,
  directly removes the `node_modules` directory).

### Manager

> [!NOTE]
> FuckingNode has a list of all paths to projects it should clean - it's you who has to maintain it:
>
> Keep in mind paths should point to the root, where you have `/package.json`, `/lockfile`[^1], and `/node_modules`.

- `fuckingnode manager list` - lists all projects.
- `fuckingnode manager add <path>` - adds a project.
- `fuckingnode manager remove <path>` - removes a project.

### Others

- `fuckingnode --help` and `fuckingnode --version` - both do the obvious.

And that's it for now.

> [!TIP]
> If for any reason you want to skip a project without removing it from your list (idk, maybe you _temporarily_ don't
> want anyone to update deps for that specific project), create an empty `.fknodeignore` file in the root of the project
> and F*ckingNode will ignore it.

---

Hope those motherf*ckers don't annoy you again! And hey, if you find any issue with the program, just open up an issue
(or make a PR which would be awesome :smile:).

Cya!

[^1]: npm, pnpm, and yarn are supported, each one having it's own lockfile.
