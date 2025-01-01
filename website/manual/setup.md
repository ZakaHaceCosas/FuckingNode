# Setup F\*ckingNode

!!! tip
    If you just want to learn how to quickly add a project so you can use the CLI, skip [here](#adding-a-project).

F\*ckingNode groups commands in 3 categories, two of them related to setup: `clean`, `manager`, and `settings`.

Inside of the `manager` category you have command to manage F\*ckingNode's list - because it keeps a list so it knows where your _revolutionary JS libraries_ are located.

Inside of the `settings` category we have the obvious - settings.

## Manager

### Adding a project

_We care about user experience, and that's why we're constantly working to ensure peak performance..._ blah blah blah TL;DR: you need to setup projects yourself so we don't consume your time and CPU looking in your entire C: drive for NodeJS projects (which trust me, would've been easier for me - kind off).

There are 3 ways to add a project:

**1 /** You can add a relative or absolute path:

```bash
fuckingnode manager add "../projects/something/"
# or
fuckingnode manager add "C:\Users\sigma_boy\projects\something"
#                        ^^^^^^ (or /home/whatever in linux / mac)
```

**2 /** You can get in the root of the project and add `--self`

```bash
cd generic-js-project-name-here
fuckingnode manager add --self
```

This is our recommended way, as you can run it right after running `init` and you don't have to type a long folder name.

**3 /** You also can waste your time opening the config file. It's a plain text file that stores absolute paths separated by line breaks. On Windows it lives at your local `%APPDATA%`, and on Linux & mac it lives on `HOME` (or `XDG_CONFIG_HOME`). It looks kinda like this:

```txt
C:\Users\JohnDoe\projects\Sokora
C:\Users\JohnDoe\projects\electronJS-clone
```

**Keep in mind paths must always point to the root**. Paths that point to the `package.json` itself, or to anything else that isn't the root of the project (the DIR that holds `package.json`), else you're cooked (the entire CLI won't work).

Anyway, your basic setup is done and you're now ready to f*ck the nodes!

### Removing a project

As easy as using one of the previously mentioned methods, but instead of using `add`, using `remove`.

```bash
fuckingnode manager remove "../projects/something/"
fuckingnode manager remove "C:\Users\me\projects\something"
```

However, there's one more thing. Starting from v2.0.0, thanks to our innovative expertise, you can use a project's _name_ (as in `package.json > "name"`).

```bash
fuckingnode manager remove flamethrower
```

the above would work as long as you have one added project with this package.json:

```json
{
    "name": "flamethrower",
    "version": "6.9.0",
    // etc...
}
```

### Cleaning up projects

As time passes, you might one day just remove a project entirely - like remove the folder from your PC. That's the main use case for the `fuckingnode manager cleanup` command - it validates all your projects, and offers you to remove those that aren't valid.

A project is not valid basically if it cannot be found - however other conditions do exist, like having a `package.json`, not being duplicate, or having a lockfile. If for whatever reason you want to keep a project that is considered "invalid", just hit `N` in your keyboard when prompted to delete unneeded entries. _Keep in mind we know our validation criteria; if `cleanup` shows you anything and you keep it, F\*ckingNode is likely to error at some point of the usage process._

### Listing projects

Just run `fuckingnode manager list`. It'll beautifully show you all of your projects in a `name@version path` format, kinda like this:

```bash
@zakahacecosas/fuckingnode@2.0.2 C:\Users\Zaka\FuckingNode
personaplus@0.0.6-preapp.27 C:\Users\Zaka\personaplus
personaplus-website@0.1.0 C:\Users\Zaka\personaplus-web
zakahacecosas-portfolio@0.0.1 C:\Users\Zaka\zakaportfolio
```

> (btw that's _part of_ my real F*ckingNode list, heh~)

Later on we'll see how to "ignore" projects, but here we'll tell you that you can pass `--ignored` to only list ignored projects, or `--alive` to only list non-ignored projects. If you try to mix both flags to create a loophole and break the matrix, you won't break anything; the flag you write first will overrule the second one.

## Settings

As most apps, we offer settings you can tweak. We use default values that should work for most people, to save you even more time - however you _might_ want to change them, **especially if you don't use Visual Studio Code**, as it's your "favorite editor" by default.

Currently supported settings are:

| Command | Type | Description | Notes |
| :--- | ---: | :--: | ---: |
| `change default-int <value>` | `normal`, `hard`, `hard-only`, or `maxim` | Changes the default intensity for the `clean` command. | / |
| `change update-freq <value>` | A fixed number | Changes how frequently (in DAYS) the CLI sends an HTTP request for updates. | We recommend setting it to a high value; we don't frequently update, so save up those HTTP requests. |
| `change fav-editor <value>` | `vscode`, `sublime` | Your favorite code editor. Used by `kickstart`. | You can't set it to a different editor as of now, sorry. |

### View current settings

To view your current settings, run `fuckingnode settings` with no args. You should see something like this:

```bash
💡 Your current settings are:
---
Update frequency: Each 9 days.
Default cleaner intensity: normal
Favorite editor: vscode
```

### Change settings

To change them, execute `fuckingnode settings change (SETTING) (VALUE)`, for example:

```bash
fuckingnode settings change default-int "hard"
fuckingnode settings change update-freq 15
```

---

You're now fully setup and ready to put those f*cking NodeJS projects in place!

---

[Next step: Using it!](basic-usage.md)
