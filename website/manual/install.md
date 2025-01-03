# Getting started

First thing first, install the CLI:

## Standard installation

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

> PS. I never touched BASH, but I'll try to make a decent install script for you guys too.

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

Thanks to [@dimkauzh](https://github.com/dimkauzh) for maintaining the NixOS install.

## Compiling from source

For contributors and nerds who clone the entire source just to change one line they don't like, compiling is extremely easy:

1. Install [Deno 2](https://docs.deno.com/runtime/).
2. Open this project from the root.
3. Run `deno task compile`.
4. Wait.
5. An executable for each platform will be created at `dist/`. Run the executable for your platform (file names are specific to each platform).

Since you have Deno installed, you can also just `deno -A src/main.ts [...commands]` from the root of the project and it'll work out of the box.

---

[Next step: Setup](setup.md)
