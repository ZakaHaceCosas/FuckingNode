# Using FuckingNode: Automate a release

> `fuckingnode release <project> <version> [--push] [--dry]`, or `fkrelease <project> <version> [--push] [--dry]`

The `release` command in F\*ckingNode allows you to run maintenance tasks and any task of your liking before making a release, and then having the package release made ONLY if these task succeed. This way you ensure you didn't forget to update dependencies or bump version number before releasing, and avoid pushing a change that made a certain test not pass (if you chose, for example, your test runner to be the pre-release task).

## Usage

To release changes to your project, use the following command:

```bash
fuckingnode release <project> <version> [--push] [--dry]
```

`<project>` is the project's path or name, `version` is a SemVer compliant version - as we **automatically bump version code on your package file for you** - and it is mandatory (if you already bumped the version by yourself, no changes are made). `--push` is optional and if passed, commits will be pushed to the remote repository. `--dry` is optional too, and if passed, changes will be committed (and pushed if specified), but not published to npm / jsr.

### Configuring the task to be executed

As said, you can add a task (for example your test suite) and have it run before releasing. The release will only be made if this task succeeds (exits with code 0). Specify the task by setting the `releaseCmd` key in your `fknode.yaml` to a script to be executed (see [fknode.yaml docs](fknode-yaml.md)).

```yaml
releaseCmd: "publish" # "npm run publish" / "deno task publish" / ...
```

If absent, no custom task will be executed.

### What to expect

You'll see a confirmation like this one, showing what will be made:

```txt
🚨 Heads up! We're about to take the following actions:
Commit 1.69.0-test to Git
Create a Git tag 1.69.0-test
Update your deno.json's "version" field
Create a deno.json.bak file, and add it to .gitignore
Publish your changes to JSR

- all of this at @zakahacecosas/fuckingnode@3.0.0-alpha.3 C:\Users\Zaka\FuckingNode
Confirm? [y/N]
```

If you input `y`, all tasks will run, and unless they fail, a commit will be made (so version bump to your package file is included), and it will be pushed. Then, the package will be published to npm or jsr (autodetected based on your project's environment).

Only the package file is added to Git, to avoid committing files you did not intend to commit. Add them manually before if you wanted them to be included in the "Release `<VERSION>` commit".

---

You've now learnt how to speed up package releases.

Next: Launch - How to speed up launching a project.
