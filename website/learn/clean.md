# Clean

The core of F\*ckingNode, a CLI that automates not just cleaning but overall maintenance of a NodeJS project.

## Abstract

As we said, the `clean` command is an automation feature. It doesn't really do anything _on it's own_, it simply gets all of your projects and recursively executes a bunch of CLI commands that are already installed on your system (`npm prune`, `npm dedupe`, `npx eslint --fix .`, etc...).

It might seem simple, but when you do the math, it becomes clearly visible how useful it is to have a tool that automates a process otherwise too messy.

```mermaid
graph TD
    subgraph Projects
        A["my-electron-app"]
        B["school-project"]
        C["another-app"]
    end

    A --> npmUpdate1["npm update"]
    npmUpdate1 --> gitCommit1["git commit -m '(chore) Update deps'"]
    gitCommit1 --> npmPrune1["npm prune"]
    npmPrune1 --> npmDedupe1["npm dedupe"]
    npmDedupe1 --> eslintFix1["npx eslint --fix ."]
    eslintFix1 --> prettierFix1["npx prettier --w ."]
    prettierFix1 --> rmdirDist1["rmdir dist/"]

    B --> npmUpdate2["pnpm update"]
    npmUpdate2 --> gitCommit2["git commit -m 'fix deps'"]
    gitCommit2 --> pnpmPrune2["pnpm prune"]
    pnpmPrune2 --> pnpmDedupe2["pnpm dedupe"]
    pnpmDedupe2 --> eslintFix2["pnpm dlx eslint --fix ."]
    eslintFix2 --> prettierFix2["pnpm prettier --w ."]
    prettierFix2 --> rmdirOut2["rmdir out/"]

    C --> npmUpdate3["deno outdated --update"]
    npmUpdate3 --> gitCommit3["git commit -m 'Update dependencies'"]
    gitCommit3 --> denoCheck3["deno check main.ts"]
    denoCheck3 --> denoFmt3["deno fmt --exclude README.md --line-width 144"]
```

This workflow can be simplified into the following:

```mermaid
graph TD
    CLI["fuckingnode clean -- --update --lint --pretty --destroy"]

    subgraph Projects
        A["my-electron-app"]
        B["school-project"]
        C["another-app"]
    end

    CLI --> A
    CLI --> B
    CLI --> C

    A --> updateA["Update dependencies"]
    updateA --> lintA["Lint code (ESLint)"]
    lintA --> prettyA["Format code (Prettier)"]
    prettyA --> destroyA["Clean build artifacts"]

    B --> updateB["Update dependencies"]
    updateB --> lintB["Lint code (ESLint)"]
    lintB --> prettyB["Format code (Prettier)"]
    prettyB --> destroyB["Clean build artifacts"]

    C --> updateC["Update dependencies"]
    updateC --> lintC["Lint code (Deno)"]
    lintC --> prettyC["Format code (Deno fmt)"]
    prettyC --> destroyC["Clean build artifacts"]
```

We reduce your workflow to a one-time bunch of commands for initial setup, and then a single CLI command for each time you need to take care of any of these tasks, **recursively running each CLI command required per-project.**

### TL;DR

`fuckingnode clean` gets into each project's root directory and executes all the maintenance commands you need, automatically.

## How it works

-- TODO
