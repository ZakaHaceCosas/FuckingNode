# Stats command

> `fuckingnode stats <project>`

This is the simplest thing ever. Just run `fuckingnode stats *`, replacing `*` with the name of a project (from the `package.json`'s `"name"` field) or the path to the project's root, and something like this will be shown to you (using CLI colors and stuff):

```txt
@zakahacecosas/fuckingnode@3.0.0-alpha.3 C:\Users\Zaka\FuckingNode
deno runtime & deno pkg manager

Depends on 8 m*therf*ckers:
@std/datetime@^0.225.3 > jsr # Dependency
@std/fs@^1.0.13 > jsr # Dependency
@std/jsonc@^1.0.1 > jsr # Dependency
@std/path@^1.0.8 > jsr # Dependency
@std/toml@^1.0.2 > jsr # Dependency
...and 3 more.
```

`> jsr # Dependency` exists because

a) A Deno project can have `> jsr` or `> npm` dependencies
b) Any JavaScript project can have `# Dependencies`, `# Dev Dependencies`, or `# Build Dependencies`

We are thinking of a valid use case that we can give to this command. Most likely, an "audit" similar to GitHub's "_This is how your repo compares to the recommended community standards..._". Until then this is honestly useless, unless you need to count your project's dependencies.

---

You've reached the end of the manual. Congratulations.

We hope F\*ckingNode made your JavaScript developer journey a bit less of a f\*cking headache. Note "we" should actually be "I", this is maintained by a single developer (open to contributions, as always). Any suggestion and/or feedback is appreciated.

---

Here you got, a bunch of links you might find interesting or useful.

[Go to the beginning?](index.md)

[Our low-budget action trailer on YouTube (less than two minutes and _kinda_ worth watching)](https://youtube.com/watch?v=_lppvGYUXNk)

[Roadmap and future plans](../about/roadmap.md)

[Learn how does F*ckingNode work from the inside](../learn/index.md)

[Branding guidelines? (yes we have them)](../about/branding.md)

[GitHub](https://github.com/ZakaHaceCosas/FuckingNode)
