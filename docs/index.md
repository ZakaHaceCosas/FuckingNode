<!-- markdownlint-disable md030 -->

# The f*cking chaos of maintaining JavaScript ends here

**Because dev life is messy enough.**

!!! warning "Real men test in production"
    **THIS IS NOT VALID DOCUMENTATION FOR CURRENTLY AVAILABLE VERSION.**
    Latest version is 2.2.1, however version 3.0 is ALMOST done, so this website is live for testing purposes. Changes are yet to be made.

<!-- markdownlint-disable md033 -->

<div class="grid cards" markdown>

-   :simple-googlecloudstorage:{ .lg .middle } **Save up storage**

    ---

    Automate cleanup of all your projects & runtime caches with a single command.

    [:octicons-arrow-right-24: Getting started](manual/usage.md#the-clean-command)

-   :material-connection:{ .lg .middle } **Use it everywhere**

    ---

    Works with any NodeJS, Deno, or BunJS project. Even Go and Rust are partially supported![^1]

    [:octicons-arrow-right-24: Cross-platform support](learn/cross-runtime-support.md)

-   :material-speedometer:{ .lg .middle } **Speed up your workflow**

    ---

    Automate linting, prettifying, updating, and even releasing your projects.

    [:octicons-arrow-right-24: Advanced features](manual/index.md#fckingnode-full-manual)

-   :fontawesome-solid-helmet-safety:{ .lg .middle } **Keep it safe**

    ---

    Never again make a commit without running your test-suite test.

    [:octicons-arrow-right-24: Safe commits](https://zakahacecosas.github.io/FuckingNode/manual/commit/)

-   :fontawesome-solid-skull:{ .lg .middle } **Be prepared for anything**

    ---

    With the world’s only chad-enough JavaScript CLI to auto-deprecate projects at will.

    [:octicons-arrow-right-24: Automated deprecations](https://zakahacecosas.github.io/FuckingNode/manual/surrender/)

-   :material-arm-flex:{ .lg .middle } **Flex about it**

    ---

    Your friends waste lots of their time manually maintaining never-releasing JS projects. Show 'em the F\*ckingNode way.

    [:octicons-arrow-right-24: Download now](https://github.com/ZakaHaceCosas/FuckingNode/releases/latest)

</div>

**F\*ckingNode is a CLI tool that automates tasks and gives you tools to make JavaScript development less of a f\*cking headache.** We can't fix your bugs, but we can automate most headache-giving tasks across all of your NodeJS/Deno/Bun projects and give you a set of tools to make JS development great again.

Note: For whatever reason, _very few_ features can also be used with Golang and Rust. Don't question it, just enjoy it.

## Features

- [x] automated cleanup of JS projects
- [x] automated cleanup of global caches (especially useful for pnpm or Bun, where a single global cache exists)
- [x] automated updates of JS projects' dependencies
- [x] automated linting of JS projects
- [x] automated prettying of JS projects
- [x] automated removal of unneeded files (e.g. dist/, out/...)
- [x] automated commit of lint / prettify / update changes in your code
- [x] automated release / update process of npm / jsr packages
- [x] automated cloning of a repo, installation of dependencies, and opening of your favorite editor for a project
- [x] automated cross-manager (e.g. npm -> pnpm) or cross-runtime (e.g. NodeJS/npm -> Bun) migration

— **from a single command.** It's not magic, it's _F\*ckingNode_-and that name is shipping to production.

Plus other features like:

- [x] a security audit assistant that analyzes vulnerabilities and tells you if they _do_ affect your project or can be safely ignored, from a single command
- [x] addition of a pre-configured `tsconfig.json` or `.gitignore` file for your project, from a single command
- [x] automated removal of entire `node_modules` across all of your projects for _storage emergencies_, from, you guessed it, single command

And that's it for now.

## Learn to use this beauty

This website offers well-made documentation for every utility that we offer.

[Get started now!](manual/index.md#tldr-for-getting-started-as-soon-as-possible){ .md-button .md-button--primary }
[Full usage manual](manual/install.md){ .md-button }

[^1]:
    Platform support may be limited outside of the NodeJS ecosystem. Run `fuckingnode compat` once installed or head to [the compatibility page](learn/cross-runtime-support.md) to learn more.
