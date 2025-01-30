<!-- ---
hide:
  - navigation
--- -->

# The f*cking chaos ends here

**Because dev life is messy enough.**

<!-- markdownlint-disable md033 -->

<div class="grid cards" markdown>

- :simple-googlecloudstorage:{ .lg .middle } **Save up storage**

    ---

    Automate cleanup of all your projects & runtime caches with a single command.

    [:octicons-arrow-right-24: Getting started](manual/usage.md#the-clean-command)

- :material-connection:{ .lg .middle } **Use it everywhere**

    ---

    Works with any NodeJS package manager. DenoJS and BunJS are partially supported too.

    [:octicons-arrow-right-24: Cross-platform support](manual/cross-runtime.md)

- :material-speedometer:{ .lg .middle } **Speed up your workflow**

    ---

    Automate linting, prettifying, updating, and even releasing your projects.

    [:octicons-arrow-right-24: Advanced features](manual/index.md#fckingnode-full-manual)

- :material-arm-flex:{ .lg .middle } **Flex about it**

    ---

    Your friends spend a lot of time manually maintaining JS projects they ain't even releasing. Show 'em the way of the _f*cking_ Gods.

    [:octicons-arrow-right-24: Download now](https://github.com/ZakaHaceCosas/FuckingNode/releases/latest)

</div>

**On this website you'll find all you need to know about how to use this CLI.**

## Features

- [x] automated cleanup of JS projects
- [x] automated cleanup of global caches (especially useful for pnpm or Bun, where a single global cache exists)
- [x] automated updates of JS projects
- [x] automated linting of JS projects
- [x] automated prettying of JS projects
- [x] automated removal of unneeded files (e.g. dist/, out/...)
- [x] automated commit of lint / prettify / update changes in your code
- [x] automated release of npm / jsr packages

\- **from a single command.** It's not magic, it's _F\*ckingNode_—and that name is shipping to production.

Plus other features like:

- [x] automated npm / jsr package release process, by running all code maintenance tasks, creating a git tag, committing all changes, bumping version from package file, and publishing to npm / jsr; from a single command
- [x] automated kickstart of a project, by cloning a repo, installing dependencies, and opening of your favorite editor; from a single command
- [x] automated migration from one package manager to another (e.g. npm -> pnpm) and dependency installation, from a single command
- [x] for "storage emergencies", automated removal of entire `node_modules` across all of your projects (you guessed it, from a single command)

And that's it for now.

## Learn to use this beauty

[Usage manual](manual/index.md){ .md-button .md-button--primary }

This website is work in progress, some pages are missing and will be done later on.
