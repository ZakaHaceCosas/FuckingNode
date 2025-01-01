# Setup F\*ckingNode

_We care about user experience, and that's why we're constantly working to ensure peak performance..._ blah blah blah TL;DR: you need to setup projects yourself so we don't consume your time and CPU looking in your entire C: drive for NodeJS projects (which trust me, would've been easier for me - kind off).

F\*ckingNode groups commands in 3 categories, `clean`, `manager`, and `settings`. Inside of the manager category you have the `add` command, which will add projects to F\*ckingNode's list so it knows where your _revolutionary JS libraries_ are located.

## Adding a project

There are 3 ways to add a project:

You can add a relative or absolute path:

```bash
fuckingnode manager add "../projects/something/"
# or
fuckingnode manager add "C:\\Users\\sigma_boy\\projects\\something" # (or /home/whatever in linux / mac)
```

You can get in the root of the project and add `--self`

```bash
cd generic-js-project-name-here
fuckingnode manager add --self
```

This is our recommended way, as you can run it right after running `init` and you don't have to type a long folder name.

You also can waste your time opening the config file, it's a plain text file that stores absolute paths separated by line breaks:

```txt
C:\Users\JohnDoe\projects\Sokora
C:\Users\JohnDoe\projects\electronJS-clone
```

/// caption | <
Windows: C:\Users\YOUR_USER\AppData\Roaming\FuckingNode\fuckingnode-motherfuckers.txt
Linux & mac: /home/YOUR_USER/.config/(the same file name lol)
///

**Keep in mind you must always point to the root**. Paths that point to the `package.json` itself, or to anything else that isn't the root of the project (DIR that holds `package.json`), you're cooked (it won't work).

Anyway, you're now ready to f*ck the nodes!

<!-- ## Optional setup

For minimal over -->
