# real life tests

The `tests/environment` path contains "real" (not realistic lol) projects for testing purposes.

They're used to test all features directly with real files, so it's easier to write tests.

## creating a test

### mocking

if you need to mock a function, you should do it like this:

first, create a "mocker" (or "mocking" idk) function in the mocks constant:

```ts
export const mocks = {
    // bla bla bla...
    readTextFile: () => { // mock name should be the name of what you're mocking
        return async (path: string | URL): Promise<string> => { // same return type as the mock func
            // here goes the specific logic
            const resolvedPath = typeof path === "string" ? path : path.toString();
            switch (resolvedPath) {
                case await GetAppPath("MOTHERFKRS"):
                    return `${CONSTANTS.ENV_PATH}/test-one`;
                default:
                    return await Deno.readTextFile(path); // (path: string | URL): Promise<string>
            }
        };
    },
    // bla bla bla...
};
```

then, whenever you need to use it inside of a test, proceed like this:

```ts
Deno.test("cool test!!", async () => {
    // save the original implementation
    const originalReadTextFile = Deno.readTextFile;
    // now mock the function by assigning the original function to a call to the "mocker" function
    Deno.readTextFile = mocks.readTextFile();

    // do your stuff
    const projects = await GetAllProjects();
    assertEquals(projects, [TEST_PROJECTS.ONE.ROOT]);

    // restore the original implementation at the end
    Deno.readTextFile = originalReadTextFile;
});
```
