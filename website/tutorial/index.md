# Basic F\*ckingNode Tutorial

A quick guide on how to get started ASAP.

## Installation

Very easy, just follow these steps, depending on your platform:

### Microsoft Windows

1. Download the installer from the [GitHub releases page](https://github.com/ZakaHaceCosas/FuckingNode/releases/latest). You'll see "INSTALLER" on the filename, there's just one.
2. Run it.
3. You're done! It should have automatically installed. The `fuckingnode` CLI command should now work out of the box.

### Linux and macOS

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

### NixOS

Add the repo to your `flake.nix`.

```nix title="flake.nix"
inputs = {
    fuckingnode.url = "github:ZakaHaceCosas/FuckingNode";
}
```

Then, add this to your system packages:

```nix
inputs.fuckingnode.packages."${system}".default
```

### Compiling from source

1. Install [Deno 2](https://docs.deno.com/runtime/).
2. Open this project from the root.
3. Run `deno task compile`.
4. An executable for each platform will be created at `dist/`. Run the executable for your platform (file names are specific to each platform).

If you have Deno installed, you can also just `deno -A src/main.ts [...commands]` from the root.

## Basic usage

### Before starting: Add your projects

To avoid going thru all your disc seeking NodeJS projects, it's you who has to tell the CLI where they are, with the `fuckingnode manager add <path>` command. Paths must point to the root of the project, AKA the folder where `package.json` exists. Add either absolute paths, like `add "C:\Users\JohnDoe\project1`, relative paths, like `../project2`, or if you're right now inside of the root, just do `add --self` to add the Current Working Directory.

For monorepos, you shouldn't need to add all projects, F\*ckingNode will detect them as long as they're properly defined in your `package.json` and prompt to add them.

You can run `manager list` at any time to see all of your projects.

### Get stared: Basic cleanup

The moment has arrived, run `fuckingnode clean` and see how the magic happens! It'll go project by project and run `prune` and `dedupe` commands, automatically. Nothing else you need to do!

### Increase the level

Now, that's not that much of a storage saving. Here is when the concept of intensity levels arrives. `fuckingnode clean` defaults to `normal`, however you can pass an intensity as the 2nd argument, like `hard` (or `hard-only`).

If you run `clean hard-only` you'll notice higher storage savings, **especially if it's the first time you clean global caches in a while** - which is the purpose of the hard level. For clearance, `hard-only` cleans global caches, and `hard` performs a `normal` cleanup _then_ cleans global caches.

---

This is the basic you need to know for cleaning your projects. Next up, the pro tutorial, for ALL the pro features we told you about (automate linting, prettifying, destroying, etc...).

---

[Pro tutorial!](pro.md)
