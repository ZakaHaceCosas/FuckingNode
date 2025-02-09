# Cross-runtime support

**F\*ckingNode works outside NodeJS**, because JS has more than one way to mess around with you. DenoJS and BunJS are also supported, **albeit partially.** There are some caveats that disallow us from making the experience 100% seamless that don't depend on us.

That said, here's our cross-runtime compatibility, explained:

## Compatibility table

<!-- | Feature | Support | Notes |
| :--- | ---: | ---: |
| Automated project-wide cleaning | NodeJS-only | See below. |
| Automated system-wide cache cleaning | NodeJS, Bun | See below. |
| Automated prettifying task | NodeJS, Bun, Deno | See below. |
| Automated lint task | NodeJS, Bun | See below. |
| Automated updating task | NodeJS, Bun, Deno | / |
| Automated destroying task | Everywhere | It's OS and not runtime dependant. |
| Parsing of project file | NodeJS and Bun (`package.json`), Deno (`deno.json`) | Only looks for specific files (e.g. it won't look for `package.json` in a Deno project, even though Deno allows `package.json`). | -->

### Platform

| Feature     | NodeJS npm          | NodeJS pnpm      | NodeJS yarn | Deno                                 | Bun                       |
| :---------- | ------------------- | ---------------- | ----------- | ------------------------------------ | ------------------------- |
| Recognition | `package-lock.json` | `pnpm-lock.yaml` | `yarn.lock` | `deno.lock / deno.json / deno.jsonc` | `bun.lockb / bunfig.toml` |
| Workspaces  | YES                 | YES              | YES         | YES                                  | YES                       |

### Cleanup

| Feature      | NodeJS npm | NodeJS pnpm | NodeJS yarn | Deno   | Bun |
| :----------- | ---------- | ----------- | ----------- | ------ | --- |
| Project-wide | YES        | YES         | YES         | YES    | YES |
| Cache-wide   | YES        | YES         | YES         | NO     | YES |
| Update       | YES        | YES         | YES         | YES    | YES |
| Pretty       | YES        | YES         | YES         | CAVEAT | YES |
| Lint         | YES        | YES         | YES         | NO     | YES |
| Destroy      | YES        | YES         | YES         | YES    | YES |

## Reasons why something doesn't work somewhere at all, or works with caveats

### Project-wide cleaning

| Unsupported on    | Caveats on |
| ----------------- | ---------- |
| **Deno and Bun.** | None.      |

Deno and Bun don't provide the kind of commands (`dedupe`, `clean`, etc...) needed for this task. If you open a PR in their repos adding these and mention F\*ckingNode I'll make sure your name is visible in here (I wholeheartedly believe this CLI can potentially explode in popularity, just give it some time).

### System-wide cache cleaning

| Unsupported on | Caveats on |
| -------------- | ---------- |
| **Deno.**      | None.      |

> TLDR: **F\*ckingNode itself was created using DenoJS, hence we can't just clean it.**

This limitation comes from two misaligned design choices. In short, we cannot clean the cache of DenoJS because _we_ are _part of_ the cache of DenoJS.

Our design "mistake" is that we used Deno to build the CLI. We chose if for the simplicity of creating cross-platform binaries and because "fixing Node with Node backwards" (FYI, "de-no" / "no-de", plus both runtimes are from the same creator anyway) sounded good enough.

And Deno's design "mistake" is that each executable they compile is, in reality, a "mini-Deno" runtime itself with our source code built-in. While not explicitly outlined in their documentation, we're sure that this is the root cause: as the user is theoretically running our code just as a developer would do, dependencies we rely on (such as `@std/assert`) are installed on the user's drive, and that's why Deno doesn't allow us to remove it's own cache.

None of these ideas is really a "mistake", it's just that these evens aligned _perfectly_ causing this issue.

### Linting and prettifying commands

| Unsupported on          | Caveats on |
| ----------------------- | ---------- |
| None, works everywhere. | **Deno.**  |

These work everywhere, however on Deno you cannot customize them. This is for the simplest of the reasons: Deno has it's own `deno fmt` command, so it'll be automatically used in Deno projects regardless of the `prettyCmd` value.

**Linting does not work on Deno at all.** I'm unsure of why I designed it like that back then (I forgot) and I might add the ability to do it, though.
