<!-- markdownlint-disable md046 md033 -->
# Professional-tier F\*ckingNode usage tutorial

Here comes the fun part, we'll learn how to _configure_ a F\*ckingNode project with advanced settings and how to automate complex tasks like keeping your codebase linted and formatted.

**Outline**: We'll see everything in the following order:

- Additional cleaner (_main feature as you should know_) features.
- Config file for your projects (`fknode.yaml`), to tweak behavior of additional features (+ extra settings).
- CLI-wide `settings` command.
- Additional CLI features.

!!! note
    This tutorial assumes basic knowledge of the CLI (what the clean command is, what the project list is, etc...).

## Using additional features

By default, `fuckingnode clean (intensity)` only performs a cleanup of the desired level. Features we promised (automated updating, linting, prettifying, destroying, and committing) are opt-in features.

Simply pass them as a flag to use them. No args are required for any of them.

```bash
fuckingnode clean -- --update --lint --pretty --destroy --commit
```

Notice how I used `--` instead of an intensity level. It's optional, you can either specify an intensity level or pass `--` to use the default, which is `normal` (you can change that from [settings](#changing-settings)).

Available flags are:

- `--lint` - does the obvious (lints)
- `--pretty` - does the obvious (prettifies)
- `--destroy` - does the obvious (destroys). if not obvious enough, removes files and directories you specify, such as `.react`, `out/`, `dist/`, or anything you'd like to do away with.
- `--commit` - does the obvious (commits)
- `--update` - does the obvious (updates)
- `--verbose` - does the obvious (makes logging more verbose) (in practice, only difference is that begin and end timestamps are shown, and a "Report" is shown at the end of the cleanup process showing elapsed time for each of your projects)

!!! abstract "Cross-runtime support notice"

    Advanced features might not work everywhere. See [cross-runtime support](../manual/cross-runtime.md) for more info.

### Linting your code: `--lint`

When linting, we will automatically run your linter. By default, we use ESLint - which in most cases should just work out of the box. Still, for convenience, you're able to choose a different linter from the `fknode.yaml` (we'll cover `fknode.yaml` later on).

More precisely, `--lint` runs `eslint --fix .` on each of your projects, unless overridden.

!!! info "About errors"

    Any error from ESLint _itself_ will fail silently, and no logs will be made. The same applies for the rest of features (however, since the CLI shows command output live, errors will likely be shown in there).

### Prettifying your code: `--pretty`

When prettying, we will automatically run your prettifier. By default, we use Prettier - which just as ESLint should work, and just as ESLint can be changed anyway.

More precisely, `--pretty` runs `prettier --w .` on each of your projects, unless overridden.

### Destroying your <s>code</s> files: `--destroy`

When destroying, we will automatically remove files and directories you specified.

Unless overridden, you already know what command this will run (your operating system's default file removal command). Any error (missing files, permissions, etc...) will show a log on screen but fail silently (without interrupting the flow).

!!! abstract "Pro tip"

    As later explained, `fknode.yaml` _allows_ you to specify on which intensities you'd like this to run (so for example, one project will always `destroy` upon cleanup, and other one only does it upon a `hard` cleanup). It's not just allowed; it's required. Other commands currently do not support per intensity level usage.

### Committing your code: `--commit`

When committing, we will automatically commit our changes (updating, linting, prettifying) to Git, using a default commit message unless overridden.

`commit` will be executed directly, without changing branches whatsoever.

For your own safety, we will commit ONLY IF ALL of the following conditions are TRUE:

- There were no uncommitted changes _BEFORE_ we touched your projects.
- There are no changes from upstream that haven't been pulled.
- You EXPLICITLY allowed committing for that project in the `fknode.yaml` file.

!!! success "Safety first."
    By default (and as outlined [here](#avoiding-features-you-dont-want)), features you opt-in when cleaning are automatically used on **all** projects, however, for your safety, an exception was made for committing.

### Updating your code: `--update`

When updating, we will automatically update your prettifier using your project's package manager. By default, the standard update command is used. Unlike prettifying or linting, where it's worth noting they can be overridden, here it might sound stupid, but you can actually override this command too. I didn't think that was useful until I found out the bad way why `expo` "reinvented the wheel" with `expo install --check` - in some cases you do need to use a specific command for dependencies, and we got you covered.

Unless overridden, you already know what command this will run.

## Avoiding features you don't want

Ironically, we have a feature for you not to use our features. The next point of this page is `fknode.yaml`, however we want to outline one thing: F\*ckingNode _cannot_ be used on a _per project_ basis. In other words, you might have realized we've been all the time using `fuckingnode clean` with a bunch of arguments, but no path or project name. This is because **all your projects are cleaned at the same time**. We do that to save you time, and in most cases it should be fine.

However, in some cases you might want _that specific project_ not to get it's dependencies updated, for whatever reason. That's where **divine protection** comes in: the only way to prevent a specific project from being affected by `fuckingnode clean -- --update` is to add `updater` to it's `divineProtection` list. Again, this is explained on the next point, we simply made an entire section to outline that commands are executed on all projects unless explicitly disabled, as that _might_ be inconvenient.

## Pro configuration: `fknode.yaml`

If you're familiar with config files like `.eslintrc.js` or `.prettierrc`, you'll easily get what the **`fknode.yaml`** file is supposed to do.

```yaml title="fknode.yaml" linenums="1"
divineProtection: ["updater"]
lintCmd: "lint"
# if present, this SCRIPT will be used when you clean with the --pretty flag
# again, must be a script. we default to "prettier ." if absent
# doesn't work on Deno (deno fmt will be used always, you can't override it)
prettyCmd: "prettier"
# if present, files / DIRs you add to "targets" will be removed
# (only when you clean with any of the "intensities")
destroy:
    intensities: [
        "hard",
        "maxim",
    ]
    targets:
        - "dist"
commitActions: true
```

This file will help us tweak and enable some stuff.

See this table for what you need to configure.

| Thing to toggle | What for and why | Required? |
| --- | --- | --- |
| `lintCmd` | To specify a script from your `package.json` to be used as the **linting** command. | No. When not provided, ESLint is used as a default. |
| `prettyCmd` | To specify a script from your `package.json` to be used as the **prettification** command. | No. When not provided, Prettier is used as a default. |
| `destroy` | To specify files & directories that'll be **destroyed** | Yes. If not provided, we'll skip destroying. |
| `commitActions` | To specify whether to commit your actions or not. | Yes. As explained, we need explicit permission to commit stuff. |

"Required?" means required _for the specific feature to work_, nothing is really mandatory for F\*ckingNode to function (`fknode.yaml` itself is an optional file).

Besides configuring our additional features, there's **divine protection** (explained [here](#avoiding-features-you-dont-want)). It's an array that takes feature names, and avoids running them on the project, regardless of whether you passed that feature's flag or not. No `--force` flag exists to override this protection, in fact there's no other way than removing it from the file. It's unbreakable, hence the name "_divine_ protection".

It must be an array of one or more strings, to disable one or more features. Supported values are `"updater" | "cleaner" | "linter" | "prettifier" | "destroyer"` for the array.

```yaml title="fknode.yaml" linenums="1"
divineProtection: ["updater"] # disable updates
divineProtection: ["updater", "linter", "destroyer"] # disable updates, linting, and destroying
```

For convenience, if you want to temporarily just skip one project but are lazy to remove it from the list then re-add it again, you can conveniently pass an asterisk to avoid everything.

```yaml title="fknode.yaml" linenums="1"
divineProtection: "*" # equivalent to removing your project from the list
```

Keep in mind additional options exist. An exhaustively documented version of this file is available at [the repo's root](https://github.com/ZakaHaceCosas/FuckingNode/blob/master/fknode.example.yaml), which I recommend for an easily understandable `fknode.yaml` walkthrough.

## Changing settings

You can view the CLI's settings by running `fuckingnode settings`.

```cmd
PS C:\Users\sigma_male> fuckingnode settings help
💡 Your current settings are:
---
Update frequency: Each 9 days.
Default cleaner intensity: normal
Favorite editor: vscode
```

You can change them with the `settings change <setting> value`. These are all settings that can be changed, how, and what they do.

| Command | Type | Description | Notes |
| :--- | ---: | :--: | ---: |
| `change default-int <value>` | `normal`, `hard`, `hard-only`, or `maxim` | Changes the default intensity for the `clean` command. | / |
| `change update-freq <value>` | A fixed number | Changes how frequently (in DAYS) the CLI sends an HTTP request for updates. | We recommend setting it to a high value; we don't frequently update, so save up those HTTP requests. |
| `change fav-editor <value>` | `vscode`, `sublime` | Your favorite code editor. Used by `kickstart`. | You can't set it to a different editor as of now, sorry. |

Settings includes an additional `flush` command, that takes a `<file>` (`logs`, `updates`, `projects`, or `all`) as an argument, removing that from F\*ckingNode's configuration. Removing `logs` is particularly recommended. Removals of `projects` and `all` are discouraged - by the way, yes, we store all logs in a `.log` file, it lives in `%APPDATA%/FuckingNode` on Windows and `/home/USER/.config/FuckingNode` on Linux & macOS.

There's another settings command, `settings repair`. It simply resets settings to defaults.

---

This is all you need to know about the clean mode (main feature). You've now mastered NodeJS-project-f\*cking. There are still some more features besides the cleaner to help you even more, like the [kickstart](../manual/kickstart.md) command. If you want to learn about them, remember everything is documented in the [manual](../manual/index.md) tab.

Thanks for reading until the end. Hope this helped you suffer less from JavaScript. Farewell, comrade.

---

[Basic tutorial again?](index.md)
