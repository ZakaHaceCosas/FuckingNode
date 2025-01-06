<!-- markdownlint-disable md010 md046 md033 -->
# Using F\*ckingNode: cleanup

The core idea of F\*ckingNode is to automate cleanup of your NodeJS projects. On top of that base, additional maintenance features and [cross-runtime support](cross-runtime.md) exist as well.

## The `clean` command

The `fuckingnode clean` command is the base utility of the app. It accepts the following (all optional) arguments:

```bash
fuckingnode clean < INTENSITY > [--update] [--lint] [--pretty] [--destroy] [--verbose] [--commit]
```

When executed with no arguments, it'll do a cleanup using the default intensity (which is `normal` and can be changed from the [settings](settings.md)).

## Cleaner intensities, explained

There are four (well, three in reality) intensities available:

- `normal`
- `hard`
- `maxim`

and an additional `hard-only` level.

This graph demonstrates what does each level do.

```mermaid
graph LR
    A[NORMAL]
    B[HARD]
    C[HARD-ONLY]
    D[MAXIM]

	E[Per-project cleanup]
	F[Global cleanup]
	G[Removal of node_modules]

	A-->E
	B-->E
	B-->F
	C-->F
	D-->G
```

The `normal` level recursively "cleans" each of your project. We define "cleaning" by automatically running all the features your package manager provides for this task (you might not even know about commands like `npm dedupe`, right?).

The `hard` level does the previous (unless using `hard-only`), plus cleans global caches. This will make the most sense for `pnpm` user, which is known for it's global module cache, however cleaning is made for all package managers.

!!! warning
    As `npm` itself warns you when cache cleaning manually, it will make `npm` even slower than what it already is next time you use it.
    Our recommendation is simple: to use `pnpm` as your default package manager. Don't remove `npm`, though, as compatibility issues may appear.

We recommend running `normal` cleanups in a mid-frequent basis, and `hard` cleanups two or three times a month. That's our recommendation, of course. Do whatever you please with your PC.

The `maxim` level does not execute any of the above, it simply removes `node_modules` from every single project you've added (forcing you to reinstall dependencies next time you use them). For average use, it is discouraged.

However, in some cases, it can be useful, as our registered record is of **11 recovered gigabytes storage after using this cleanup** (yes, eleven). So, for example, if you needed to download a particularly big file and completely forgot your drive is almost full, this command will free up a particularly big chunk of your hard drive.

---

Now that we know this, we can choose whatever fits our needs each time we run a cleanup

```bash
fuckingnode clean normal
fuckingnode clean hard
fuckingnode clean hard-only
fuckingnode clean maxim
```

Running without an intensity will use the **default intensity**. On a fresh install, it's always `normal`, however [that can be changed to your linking from the settings command](settings.md).

## Using additional features

By default, `fuckingnode clean (intensity)` only performs a cleanup of the desired level. Features we promised you (automated updating, linting, prettifying, destroying, and committing) are opt-in features.

Simply pass them as a flag to use them. No args are required for any of them.

```bash
fuckingnode clean -- --update --lint --pretty --destroy --commit
```

Available flags are:

| Flag | Why does this exist |
| :--- | ---: |
| `--lint` | does the obvious (lints)|
| `--pretty` | does the obvious (prettifies)|
| `--destroy`| does the obvious (destroys). if not obvious enough, removes files and directories you specify, such as `.react`, `out/`, `dist/`, or anything you'd like to do away with. |
| `--commit`| does the obvious (commits)|
| `--update` | does the obvious (updates)|

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
    By default, features you opt-in when cleaning are automatically used on **all** projects, however, for your safety, an exception was made for committing, requiring explicit allowance.

    To allow a project's code to be committed, add `commitActions: true` to the `fknode.yaml`.

### Updating your code: `--update`

When updating, we will automatically update your prettifier using your project's package manager. By default, the standard update command is used. Unlike prettifying or linting, where it's worth noting they can be overridden, here it might sound stupid, but you can actually override this command too. I didn't think that was useful until I found out the bad way why `expo` "reinvented the wheel" with `expo install --check` - in some cases you do need to use a specific command for dependencies, and we got you covered.

Unless overridden, you already know what command this will run.
