# F*ckingNode

## Abstract

Tired of the amount of disk space that Node projects and their ~~motherf*cking~~ `node_modules` directories were taking on my PC, I once switched to `pnpm` (greatest decision I've taken in years). I started manually remove all `node_modules` folders and `pnpm prune` all of my projects.

This was time consuming, but it - just the day I got pnpm and did a `node_modules` cleanup I recovered ~11 GB of space.

One day I had the good idea of making a PowerShell script to automate the process - that has helped me so much I turned that `ps1` code into a desktop app using TypeScript and ~~Node backwards~~ Deno: **F*ckingNode**.
<!-- markdownlint-disable-next-line -->
> ###### (yes i'm calling it like that and i'm shipping that to production, don't question me)

## Installation

Currently only Windows is supported. I'll look onto Linux, which I'd love to support (it actually seems easy, it's just that I can't test it cause' I don't have currently a Linux machine).

1. Download the `.exe` from the GitHub releases page.
2. Add it somewhere (e.g. a `C:\Scripts` folder, which is what I recommend).
3. Enter Windows search and write "Edit environment variables for your account". A modal will open.
4. You'll see two lists, both having a "Path" entry. Click on each one, then click edit, then New, and then write the path you saved F*ckingNode to (e.g. `C:\Scripts\FuckingNode.exe`).
5. Restart your terminal if it was open.
6. Done! `fuckingnode` command will now work from your terminal.

## Usage

### Cleaner

- `fuckingnode clean` - does the obvious.
- `fuckingnode clean --update` - does the obvious + updates your deps.

### Manager

> [!NOTE]
> FuckingNode has a list of all paths to projects it should clean - it's you who has to maintain it:

- `fuckingnode manager list` - lists all projects.
- `fuckingnode manager add <path>` - adds a project.
- `fuckingnode manager remove <path>` - removes a project.

> [!NOTE]
> Keep in mind paths should point to the root, where you have `/package.json`, `/lockfile`[^1], and `/node_modules`.

And that's it for now.

> [!TIP]
> If for whatever reason you want to exclude a project but not remove it from your list (idk, maybe you _temporarily_ don't want anyone to update deps for that specific project), create an empty `.fknodeignore` file in the root of the project and F*ckingNode will ignore it.

---

Hope those motherfuckers don't annoy you again! And hey, if you find any issue with the program, just open up an issue (or make a PR which would be awesome :smile:).

Cya!

[^1]: npm, pnpm, and yarn are supported, each one having it's own lockfile.
