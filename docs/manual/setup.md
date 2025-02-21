# Using F*ckingNode: Setup a project

!!! question Don't mess terms up
    It's not the same to _setup FuckingNode_ ([configure the CLI first time](configuration.md)) than to use _fuckingnode setup_ (here)

> `fuckingnode setup <project-path> [setup]`

The `setup` command in F\*ckingNode basically adds a pre-made text-config file (like a preset `tsconfig.json` or a preset `fknode.yaml`). There's currently few _setups_ (we refer to each "preset" / "template" / ... as a _setup_); however they're easy to add, so soon we'll likely have a setup for every use case. _You could contribute your own, too :wink:._

## Usage

To list available setups, run:

```bash
fuckingnode setup
```

Then, to apply a setup, run:

```bash
fuckingnode setup <project-path> [setup]
```

`project-path` is obvious and mandatory, `setup` is also mandatory and is the name of the setup. When listing setups you'll see their names (and a brief description).

---

You've now learnt how to quickly get your text-config files ready.

Next: Stats (can't think of a description for this one).

---

[Next: Extra - stats](stats.md)
