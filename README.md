# F\*ckingNode

## Abstract

We as humans have dedicated years of hard work to a goal: fixing Node.

We created NPM, PNPM, YARN, added ES6, async/await, `fs.promises`, even TS with `--experimental-strip-types`, we changed the order and made Deno, then we got hungry and made Bun, then we made Deno 2... Everything has been getting us closer to a better Node, and now we're one step closer to fixing NodeJS.

**F\*ckingNode**, a CLI utility to automate cleanup of a Node user's worst nightmare: `node_modules/`.

> ### (yes i'm calling it like that and i'm shipping that to production, don't question me)

By the way, _while the name implies NodeJS-only support, Deno and Bun are also supported!_

## Features

### Cleaner

Automates cleaning of each NodeJS project you add by using your manager's built in features, so a single command makes everything cleaner. It will detect your lockfile (e.g. "pnpm-lock.yaml", "package-lock.json") to know whether to use **npm**, **pnpm**, or **yarn** (currently supported managers).

- `fuckingnode clean` - does the obvious.
- `fuckingnode clean <intensity>` - does the obvious with the chosen intensity (see below).

Supported flags are the following (before them you have to pass an intensity, or `--` to use the default one).

- `fuckingnode clean --update` - does the obvious + updates your deps.
- `fuckingnode clean --verbose` - does the obvious with some extra logs.
- `fuckingnode clean --pretty` - does the obvious + prettifies your code.
- `fuckingnode clean --lint` - does the obvious + lints your code.
- `fuckingnode clean --destroy` - does the obvious + removes additional directories specified in your config file (e.g. `dist/`, `out/`, `.expo/`, etc...).
- `fuckingnode clean --commit` - does the obvious + if you used an action that changes your files (like updating or prettifying) AND your git tree is clean before using these actions, auto-commits the changes.

Flags can be mixed to use more features at once. The `clean` command can take an intensity level, either "normal", "hard", or "maxim". If not provided, uses the default (`normal` - you can change the default from settings).

The higher the level, the more space you'll recover, but the slower the process will be.

| Level | Actions | Notes |
| :--- | :--: | ---: |
| **Normal** | Runs default prune / autoclean and dedupe commands. | / |
| **Hard** | Does the previous + cleans the entire cache (`pnpm store prune` / `yarn cache clean` / `npm cache clean --force`) | _Note: While pnpm will only purge unused packages, npm will clear the entire cache, making it go slower next time._ |
| **Maxim** | This does not run any cleanup command. It will simply remove the `node_modules/` folder of each project. | Slowest (plus you'll need to reinstall deps), hence it will ask for confirmation before starting. The good thing is that you'll probably get many GB of storage back, so this is actually useful if your drive is almost full. |

You currently cannot set an intensity for each project, if you run `clean maxim` for example, all projects from your list will be maxim pruned.

### Manager

F\*ckingNode keeps a list of all paths to the projects it should clean - it's you who has to maintain it. Keep in mind paths should point to the root, where you have your `/package.json`, your lockfile, and your `/node_modules`.

- `fuckingnode manager list` - lists all projects.
- `fuckingnode manager list --ignored` - lists all ignored projects.
- `fuckingnode manager list --alive` - lists all not ignored projects.
- `fuckingnode manager add <path>` - adds a project to list.
- `fuckingnode manager remove <path>` - removes a project from list.
- `fuckingnode manager ignore <path>` - ignores a project (won't be cleaned or updated).
- `fuckingnode manager revive <path>` - stops ignoring a project.
- `fuckingnode manager cleanup` - shows a list of invalid projects (invalid path, duplicate, etc...) and allows to remove them all at once.

`<path>` refers to a path, either an absolute one (`C:\Users\me\project`), relative one (`../project`), or the `--self` flag which will use the Current Working Directory.

Best practice is to run `fuckingnode manager add --self` after creating a Node project from your CLI.

### Global Settings

Run `fuckingnode settings` with no args to see your current settings. Use `settings <change> <setting> <new value>` to change a setting, or `help settings` to see all commands (there are a few extra commands beside changing settings).

| Command | Type | Description | Notes |
| :--- | ---: | :--: | ---: |
| `change default-int <value>` | `normal`, `hard`, `hard-only`, or `maxim` | Changes the default intensity for the `clean` command. | / |
| `change update-freq <value>` | A fixed number | Changes how frequently (in DAYS) the CLI sends an HTTP request for updates. | We recommend setting it to a high value; we don't release updates too often, so save up those HTTP requests. |
| `flush <file>` | `logs`, `updates`, `projects`, or `all` | Flushes (removes) config files. | `logs` is particularly recommended. `projects` and `all` are particularly discouraged. |

> [!WARNING]
> `settings` will also show info about an "auto-flush" setting. It's given a default value for future versions - we currently don't support scheduled cleanup. `help settings` shows there's an option to schedule the cleaner - it's also unsupported as of now.

### Project settings

We also support adding a `fknode.yaml` file to your projects. Some commands, like `manager ignore` will add it automatically if it doesn't exist. Some other commands, like `clean -- --lint` require it to be present, otherwise continuing execution but skipping tasks that depend on this file.

A full `fknode.yaml` file could look like this. All props are optional. For a more detailed explanation, open `fknode.example.yaml` in the root of this repo.

```yaml
# divineProtection is used to ignore projects, here you specify what to ignore (updating, cleaning, or everything)
divineProtection: "updater"
# if present, this SCRIPT will be used when you clean with the --lint flag
lintCmd: "lint"
# if present, this SCRIPT will be used when you clean with the --pretty flag
prettyCmd: "prettier"
# if present, files / DIRs you add to "targets" will be removed
# (only when you clean with any of the "intensities")
destroy:
  intensities: ["hard", "maxim"] # "normal", "hard", "hard-only", or "maxim", or "*" or "all" for everything. use always an array even if you only add one intensity.
  targets:
    - "node_modules"
    - "dist"
# if true, we will auto run "git commit" with a default message when we change your code
commitActions: true
# if present, overrides the default commit message
commitMessage: "F*ckingNode™️ automated maintenance tasks"
```

Where `(exec)` refers to the execution command (`npx` / `pnpm dlx` / `yarn dlx` / `bunx`), and `(run)` refers to the run command (`npm` / `pnpm` / `yarn` / `bun` + `run`):

| Setting | Default | Notes |
| :--- | ---: | ---: |
| `divineProtection` | `disabled` | / |
| `lintCmd` | `(exec) eslint --fix .`, except for Deno (unsupported). | If provided, `(run) <your script>` is used instead. |
| `prettyCmd` | `(exec) prettier .`, except for Deno (`deno fmt`). | If provided, `(run) <your script>` is used instead. |
| `destroy` | intensities: `maxim`, targets: `node_modules`. | If you pass a list of targets _without_ `node_modules` and do a `maxim` cleanup, `node_modules` will be cleaned anyway. |
| `commitActions` | false | / |
| `commitMessage` | `"Code <TASKS> tasks (Auto-generated by F*ckingNode <VER>)"` | Where `<TASKS>` is a list of the tasks executed ("linting", or "linting and updating" for example) and `<VER>` is the version of the CLI you're using. |

### Others

- `fuckingnode migrate <path> <"pnpm" | "npm" | "yarn">` - migrates a project to the specified package manager (basically removes lockfile, `node_modules`, and reinstalls with the selected package manager). For now it relies on the specified package manager's ability to understand other lockfiles to ensure version compatibility. No issues _should_ occur.
- `fuckingnode kickstart <repo-url> [path] [package-manager]` - automatically clones a Git repo in the specified path (or `<current-path>/<repo-name>` if not provided), installs dependencies with `pnpm` (or provided package manager if any), and OF COURSE automatically runs `fuckingnode manager add --self`.
- `fuckingnode --help`, `fuckingnode --version`, and `fuckingnode upgrade` - all do the obvious (if not obvious, `upgrade` checks for updates).

And that's it for now.

### Cross-runtime support

While we've been talking about Node projects and `package.json` all the time, we actually support the three titans; Node, Deno, and Bun. However not all features are everywhere. Here's a compatibility table, where "NodeJS" includes all major package managers (npm, pnpm, and yarn).

| Feature | Support | Notes |
| :--- | ---: | ---: |
| Automated project-wide cleaning | NodeJS-only | Deno and Bun don't provide the kind of commands (dedupe, clean, etc...) needed for this task. |
| Automated system-wide cache cleaning | NodeJS, Deno, Bun | / |
| Parsing of project file (pkg JSON) | NodeJS, Bun (package.json), Deno (deno.json) | Only supports parsing the props that are needed to the CLI |
| Automated prettify tasks | NodeJS, Bun, Deno | Testing is still needed. Deno doesn't support setting `prettyCmd` it'll always use `deno fmt`. |
| Automated lint tasks | NodeJS, Bun | Testing is still needed. |
| Automated dependency updates | NodeJS, Bun, Deno | Only NodeJS is tested. |

---

## Installation

### Microsoft Windows

1. Download the installer from the [GitHub releases page](https://github.com/ZakaHaceCosas/FuckingNode/releases/latest). You'll see "INSTALLER" on the filename, there's just one.
2. Run it.
3. You're done! It should have automatically installed. The `fuckingnode` CLI command should now work out of the box.

### Other systems (mac & Linux)

1. Download the program from the [GitHub releases page](https://github.com/ZakaHaceCosas/FuckingNode/releases/latest). macOS and Linux have support for both x84_64 and ARM.
2. Place your downloaded file anywhere, like `/scripts` or `/home/USER/my-scripts`.
3. Add the path to the binary to your system's path environment variable.
4. You're done! The `fuckingnode` command will now work from your terminal.

Here's how to add the path to your path env variable, in case you didn't know:

```bash
# open your Bash config file with nano (or your preferred editor)
nano ~/.bashrc         # Linux
nano ~/.bash_profile   # macOS

# paste this
export PATH="$PATH:/home/USER/my-scripts/fuckingnode" # keep '$PATH' and replace the rest (/home...) with the actual path to wherever you saved fuckingnode. It's recommended that you keep the name like that, "fuckingnode" with lowercase.

# save with CTRL + O, ENTER, and CTRL + X
# then, reload your config
source ~/.bashrc          # Linux
source ~/.bash_profile    # macOS
```

### Compiling from source

1. Install [Deno 2](https://docs.deno.com/runtime/).
2. Open this project from the root.
3. Run `deno task compile`.
4. An executable for each platform will be created at `dist/`. Run the executable for your platform (file names are specific to each platform).

---

Hope those motherf\*ckers don't annoy you again! And hey, if you find any issue with the program, just open up an issue (or make a PR which would be awesome :smile:).

Cya!
