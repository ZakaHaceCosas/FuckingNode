# F\*ckingNode full manual

Everything, from the basic to the complex, is documented here step by step.

## Outline

These are links to individual pages. For the full manual, click the first one, then keep reading. For a faster, one page guide to quickly get started, [skip here](#tldr-for-getting-started-as-soon-as-possible).

- [Install the CLI](install.md)
- [Setup and configuration](setup.md)
- [Main usage guide](usage.md)
- [Extra - Kickstart](kickstart.md)
- [Extra - Stats](stats.md)

For further learning:

- [Cross-runtime support](cross-runtime.md)

## TL;DR for getting started as soon as possible

### Step 1

Add all of your projects. This is done manually with the `fuckingnode manager add <path>` command. Path can be relative, absolute, or the `--self` flag to use the CWD.

```bash
# relative
fuckingnode manager add "../projects/project1"
# absolute
fuckingnode manager add "/home/engin/projects/project2"
# self path
cd project3
fuckingnode manager add --self
```

It's recommended that from now on you run `manager add --self` immediately after running `npm init` (or `pnpm init` or whatever) each time you create a project.

### Step 2

A basic cleanup is invoked by running this command, with no arguments.

```bash
fuckingnode clean
```

It's simple, and while it doesn't recover gigabytes, it's fast and it gets the job done. Additional flags can be passed for using more advanced features.

Keep in mind it's a global command; it'll do the same cleanup, with the same flags if passed, across all the projects you've added. A config file `fknode.yaml` can be created at the root of an added project to override this behavior.

### Step 3

For increased intensity, use this.

```bash
fuckingnode clean hard
```

Immediately after cleaning all of your projects, it'll now clear global caches of all your installed package managers.

If you only wish to clear global caches without waiting for individual cleanup of all projects, use `fuckingnode clean hard-only`, or a shortcut (`fuckingnode global-clean` or `fuckingnode hard-clean`).

### Step 4

For the best experience, you can pass `--`flags to the clean command for using additional features. Detailed explanations are available at the [usage manual](../manual/usage.md), here we'll just TL;DR them:

- `--lint` runs ESLint (or desired linter)
- `--pretty` runs Prettier (or desired prettifier)
- `--destroy` removes unneeded files (e.g. `dist/`)
- `--update` updates dependencies
- `--commit` commits changes made by us (e.g. changes to your lockfile because of updating)

As outlined [before](#step-2) cleaning is global. When running with `--lint` all your projects will be automatically linted (unless overridden, as said), greatly increasing your productivity.

Behavior itself can also be overridden, in case you use a different linter than ESLint, or a different prettifier than Prettier. All flags support their custom configuration.

There are two exceptions to the "global cleaning" rule mentioned earlier:

- `--destroy` requires per-project configuration via `fknode.yaml` (you shall specify what you want to be removed). We don't have "default" directories to auto-remove like `dist/`, to avoid removing something you _might_ need.
- `--commit` requires per-project configuration via `fknode.yaml`. Making a commit is a sensible action, as we could potentially commit something you did _not_ intend to commit yet. Committing requires explicit allowance from you, and additional safety checks are performed as outlined [here](../manual/usage.md#committing-your-code-commit).

---

That's the basic manual. For further learning about `fknode.yaml` or advanced features, [refer to the desired manual section](#outline).

---

*[CWD]: Current Working Directory
