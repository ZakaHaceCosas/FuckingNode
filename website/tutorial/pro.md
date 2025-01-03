# Professional-tier F\*ckingNode usage tutorial

Here comes the fun part, we'll learn how to _configure_ a F\*ckingNode project with advanced settings and how to automate complex tasks like keeping your codebase linted and formatted.

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

### Destroying your ~~code~~ files: `--destroy`

When destroying, we will automatically remove files and directories you specified.

Unless overridden, you already know what command this will run (your operating system's default file removal command). Any error (missing files, permissions, etc...) will show a log on screen but fail silently (without interrupting the flow).

!!! abstract "Pro tip"

    As later explained, `fknode.yaml` _allows_ you to specify on which intensities you'd like this to run (so for example, one project will always `destroy` upon cleanup, and other one only does it upon a `hard` cleanup). It's not just allowed; it's required. Other commands currently do not support per intensity level usage.

### Committing your code: `--commit`

When committing, we will automatically commit our changes (updating, linting, prettifying) to Git, using a default commit message unless overridden.

`commit` will be executed directly, without changing branches whatsoever.

For your own safety, we will commit ONLY if ALL of the following conditions are TRUE:

- There were no uncommitted changes _BEFORE_ we touched your projects.
- There are no changes from upstream that haven't been pulled.
- You EXPLICITLY allowed committing for that project.

!!! success "Safety first."
    By default (and as outlined [here](#avoiding-features-you-dont-want)), features you opt-in when cleaning are automatically used on **all** projects, however, for your safety, an exception was made for committing.

### Updating your code: `--update`

When updating, we will automatically update your prettifier using your project's package manager. By default, the standard update command is used. Unlike prettifying or linting, where it's worth noting they can be overridden, here it might sound stupid, but you can actually override this command too. I didn't think that was useful until I found out the bad way why `expo` "reinvented the wheel" with `expo install --check` - in some cases you do need to use a specific command for dependencies, and we got you covered.

Unless overridden, you already know what command this will run.

## Avoiding features you don't want

Ironically, we have a feature for you not to use our features. The next point of this page is `fknode.yaml`, however we want to outline one thing: F\*ckingNode _cannot_ be used on a _per project_ basis. In other words, you might have realized we've been all the time using `fuckingnode clean` with a bunch of arguments, but no path or project name. This is because **all your projects are cleaned at the same time**. We do that to save you time, and in most cases it should be fine.

However, in some cases you might want _that specific project_ not to get it's dependencies updated, for whatever reason. That's where **divine protection** comes in: the only way to prevent a specific project from being affected by `fuckingnode clean -- --update` is to add `updater` to it's `divineProtection` list. Again, this is explained on the next point, we simply made an entire section to outline that commands are executed on all projects unless explicitly disabled, as that _might_ be inconvenient.

## Pro configuration: `fknode.yaml`

Familiar with config files like `.eslintrc.js` or `.prettierrc`? Well, you now have a new config file in your project! The `fknode.yaml` file.

```yaml
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

An exhaustively documented version of this file is available at [the repo's root](https://github.com/ZakaHaceCosas/FuckingNode/blob/master/fknode.example.yaml). This file will help us tweak and enable some stuff. See this table to see what you need (PS. "required" means required _for the specific feature to work_, nothing is really mandatory for F\*ckingNode to function (`fknode.yaml` itself is an optional file)).

| Thing to toggle | What for and why | Required? |
| --- | --- | --- |
| `lintCmd` | To specify a script from your `package.json` to be used as the **linting** command. | No. When not provided, ESLint is used as a default. |
| `prettyCmd` | To specify a script from your `package.json` to be used as the **prettification** command. | No. When not provided, Prettier is used as a default. |
| `destroy` | To specify files & directories that'll be **destroyed**

# TODO finish docs

## Changing settings

---

This is all you need to know about the clean mode (main feature). You've now mastered NodeJS-project-f\*cking. There are still some more features, like the [kickstart](../manual/kickstart.md) command, you might want to learn about. Everything is documented in the manual tab.

Thanks for reading until the end. Hope this helped you suffer less from JavaScript. Farewell, comrade.

---

[Basic tutorial again?](index.md)
