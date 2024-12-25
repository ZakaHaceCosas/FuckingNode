# Contributing

## Dev tools

1. Install [Deno (latest version)](https://deno.com) if you haven't. ~~Your welcome for not choosing that one JS runtime that we're trying to fix and that would fill up your disk with `node_modules/`~~.
2. Make a fork of the repo and clone it locally. You'll work from the default `master` branch.
3. Start writing code :smile:.
4. To test, run with `deno -A src/main.ts <args>` (e.g. `deno -A src/main.ts clean -- --verbose`).

## Making good contributions

You already know how this works.

1. Test your code before making a PR so nothing breaks.
2. Update the CHANGELOG to reflect what you did in a meaningful way.
3. If you add new functions, types, whatsoever, don't forget to use JSDoc so we all know what they do.
4. Ensure everything that can be typed is typed.

Additionally, these are some good coding practices we recommend for this (and any project):

### Avoid nesting

Look at this mess (it's an example):

```ts
async function StartUp() {
    if (User.isAuthenticated) {
        if (User.isAdmin) {
            await handle_startup().then(async () => {
                await login("admin");
            });
        } else {
            await handle_startup().then(async () => {
                await login("user");
            });
        }
    } else {
        throw new Error("User ain't authenticated!");
    }
}
```

We could avoid nesting using `if` the smart 🗿 way:

```ts
async function StartUp() {
    if (!User.isAuthenticated) throw new Error("User ain't authenticated!");
    await startup();
    if (User.isAdmin) {
        await login("admin");
    } else {
        await login("user");
    }
}
```

We can avoid even another level by using ternary operators:

```ts
async function StartUp() {
    if (!User.isAuthenticated) throw new Error("User ain't authenticated!");
    await startup();
    await login(User.isAdmin ? "admin" : "user");
}
```

Got the idea? Use any method you can think of to ensure your code can be read like a normal text, with the least nesting possible.

> (TODO: add more instructions. until then, as long as your code doesn't suck, anything works)

Thank you so much for contributing. Happy coding!
