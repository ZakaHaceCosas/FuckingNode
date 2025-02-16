# Getting started

First thing first, install the CLI:

## Standard installation

### Microsoft Windows

Copy and paste the following code in a terminal session.

```powershell
powershell -c "irm zakahacecosas.github.io/FuckingNode/install.ps1 | iex"
```

### Linux and macOS

Copy and paste the following code in a terminal session.

```bash
curl -fsSL zakahacecosas.github.io/FuckingNode/install.sh | bash
```

### NixOS

Add the repo to your `flake.nix`.

```nix
inputs = {
    fuckingnode.url = "github:ZakaHaceCosas/FuckingNode";
}
```

Then, add this to your system packages:

```nix
inputs.fuckingnode.packages."${system}".default
```

### Compile from source

For contributors and nerds who clone the entire source just to change one line they don't like, compiling is extremely easy:

1. Install [Deno 2](https://docs.deno.com/runtime/).
2. Open this project from the root.

You can now either:

- Run `deno task compile` and get the output executable from `dist/`.
- Run `deno -A src/main.ts [...commands]` from the root.

---

[Next step: Setup](configuration.md)
