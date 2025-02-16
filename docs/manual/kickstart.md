# Kickstart a project

> `fuckingnode kickstart <repo-url> [file-path] [package manager]`

The `kickstart` command is an extra command that increases even more your productivity. It does the following, from a single command:

- Clones a Git repo wherever you want
- Installs dependencies automatically using the project's default package manager (or at your choice, another one).
- Launches your favorite code editor (defaults to VSCode, as seen on settings).
- Adds the project to F\*ckingNode.

Of course, it only works with NodeJS (or Deno or Bun) projects.

## Usage

Just run the following:

```bash
fuckingnode kickstart < REPO-URL > [PATH] [PKG MANAGER]
```

`REPO-URL` is obvious and mandatory. `PATH` is optional and defines the path where you want us to clone the project. If not provided, we'll create a directory in the CWD with the name of the repository (just as Git would do by default).

`PKG MANAGER` only works with NodeJS projects and lets you override the project's package manager, so a project that's using `npm` gets cloned with, for example, `pnpm` instead. In Bun or Deno this is ignored, and their default install commands are used.

---

Okay, now that we know how to get stuff from Git the FkNode way, lets commit stuff back the FkNode way.

---

[Next: Extra - commit](commit.md)
