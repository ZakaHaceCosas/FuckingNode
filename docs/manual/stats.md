# Using F*ckingNode: `stats`

> `fuckingnode stats <project>`

This is the simplest thing ever. Just run `fuckingnode stats *`, replacing `*` with the name of a project (from the `package.json`'s `"name"` field) or the path to the project's root, and you will see two things.

## Project outline

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

And that's it. We're thinking of what else we could show here that may interest you.

## Recommended Community Standards

Here's where the command gets a bit useful. This is currently only supported for NodeJS.

Similarly to the Recommended Community Standards tab of a GitHub repository, this will check if all the recommended fields of a `package.json` file are fulfilled.

For example, a project with the following package.json:

```json
{
    "name": "some-astro-website",
    "type": "module",
    "version": "0.1.0",
    "scripts": {
        "dev": "astro dev",
        "start": "astro dev",
        "build": "astro check && astro build",
        "preview": "astro preview",
        "astro": "astro"
    },
    "dependencies": {
        "@astrojs/check": "^0.9.4",
        "@astrojs/mdx": "^4.0.8",
        "@astrojs/vercel": "^8.0.7",
        "@vercel/speed-insights": "^1.2.0",
        "astro": "^5.3.0",
        "sharp": "^0.33.5",
        "typescript": "^5.7.3"
    },
}
```

will return this:

```txt
❌ No license found. You should specify it!
❌ No author found. Who made this 'great' code?
😐 No contributors found. If none, that's fine, but if someone helps, mention them.
❌ No description found. What does your code even do?
❌ You didn't specify a repository, why?
❌ You didn't specify where to report bugs. Don't be lazy and accept feedback!
✅ This is an ESM project, lovely.
```

For everything to turn `✅ correct`, we would need to either:

Add:

- `license`
- `author`
- `contributors`
- `description`
- `repository`
- `bugs`

Or:

Set `private` to true, so the project is considered _not_ an npm package and thus package-related checks like `repository` are omitted.

_This feature is still very basic to be honest. We'll improve it over time._

Next: Surrender - how to speed up a JavaScript's projects natural cycle.

---

[Extra - Surrender](surrender.md)
