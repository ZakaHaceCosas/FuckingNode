# Why is FuckingNode even a thing?

## What we wanted to fix

FuckingNode exists because of the many problems that exist and a JavaScript developer may encounter, including but not limited to:

- How tiring it is to go through all of your projects to update dependencies.
- How boring it is to manually make "Lint code" or "Format code" commits periodically.
- How annoying it is to run `npm publish` just to get a weird error filling all your terminal without even telling you that the issue is you forgetting to bump the version number in `package.json`.
- How boring (again) it is to manually write a README notice for a project that you're deprecating because you don't care anymore.
- How painful it is to make a commit, push it, open a Pull Request, and realize there's an error you didn't spot because you forgot to run the test suite.
- How boring (yes again) it is to manually clone a repository, install dependencies, and launch your IDE by clicking it or typing `code .` or whatever.
- How boring (...) it is to copy-paste (even worse if you write it by yourself) some generic content for your `tsconfig.json` because you don't want your code to suck.

_And the list goes on..._

## What we fixed, and how

I initially created FuckingNode as a `.ps1` script to automate `npm prune` and `pnpm store prune` across a fixed list of personal projects, and as you can see, it has grown into three major releases, seven separate utilities (`clean`, `kickstart`, `release`, `commit`, `surrender`, `setup`, `stats`) with more to come (like the work in progress `audit`), DenoJS & BunJS support, and even a small amount of features bridged to Go and Cargo (Rust).

FuckingNode is a thing because it fixes all of the issues mentioned above.

> Bored of manually updating dependencies, linting code, prettifying code, committing all of these, or removing built output / artifacts?

- [X] `fuckingnode clean -- -- -l -p -c -d -u`
  - Shorthand: `fkclean -- -- -l -p -c -d -u`
  - Assuming [flagless features](../manual/fknode-yaml.md#flagless) are enabled, it can simply be `fkclean`

> Bored of finding and pasting or writing your own `tsconfig.json`?

- [X] `fuckingnode setup <path> ts-strictest`
  - `<path>` is the path to the project, or `--self` to use the CWD.
  - `ts-strictest` is an example, there are more setups available. Run `fuckingnode setup` with no args to see them all.

> Bored of manually cloning, installing, and launching?

- [X] `fuckingnode kickstart <git-url> [path] [manager]`
  - Shorthand: `fkstart <git-url> [path] [manager]`
  - `[path]` is optional and specifies a custom path to clone to.
  - `[manager]` is optional and specifies the package manager to use for the installation. If none, the one from the cloned repo is used (if any).

> Bored of manually writing a deprecation notice?

- [X] `fuckingnode surrender <path> [message] [alternatives] [learn-more]`
  - `<path>` is the path to the project, or `--self` to use the CWD.
  - `[message]` is optional and adds a custom message.
  - `[alternatives]` is optional and lets you write about alternatives to what is going to be deprecated.
  - `[learn-more]` is optional and lets you write a text or link about where the user can learn more about this deprecation.

> Don't want the pain of making a commit forgetting your tests?

- [X] `fuckingnode commit <message> [branch] [--push]`
  - Shorthand: `fkcommit <message> [branch] [--push]`
  - `<message>` is your commit message.
  - `[branch]` is optional and specifies the branch to commit to. If unspecified, current branch is used.
  - `--push` is optional and if passed the commit (and any previous local commit) will be pushed.

> Don't want the annoyance of npm or jsr package releases?

- [X] `fuckingnode release <path> <version> [--push] [--dry]`
  - `<path>` is the path to the project, or `--self` to use the CWD.
  - `<version>` is the version to be released, we'll auto bump your package file's version field and create a Git tag with this version code. Must be SemVer parsable.
  - `--push` is optional and if passed, changes will be pushed to Git.
  - `--dry` is optional and if passed, changes will be done (and pushed if specified), but not published to npm / jsr.

---

That is why FuckingNode is a thing; because it's a single tool to fix everything. And if there's something we didn't fix yet, just [join our Discord server](https://discord.gg/AA2jYAFNmq), mention us on [Twitter](https://x.com/FuckingNode) or [Bluesky](https://bsky.app/FuckingNode), or [raise an issue on GitHub](https://github.com/ZakaHaceCosas/FuckingNode/issues) telling us what else you'd like to see within our tooling, and we'll add it (if possible).

*[CWD]: Current Working Directory
