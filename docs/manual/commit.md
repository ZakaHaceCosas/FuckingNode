# Using FuckingNode: Make a commit

> `fuckingnode commit <message> [branch] [--push]`, or `fkcommit <message>`

The `commit` command in F\*ckingNode allows you to run maintenance tasks and any task of your liking before making a commit, and then having the commit made ONLY if these task succeed. This way you ensure you didn't forget to update dependencies before committing and avoid pushing a change that made a certain test not pass (if you chose, for example, your test runner to be the pre-commit task).

## Usage

To commit changes to your project, use the following command:

```bash
fuckingnode commit <message> [branch] [--push]
```

`message` is obvious and mandatory, `branch` is optional is the branch to commit to. If not given, the branch you were currently on will be used. `--push` is optional too, and if passed, the commit will be pushed to the remote repository.

### Configuring the task to be executed

As said, you can add a task (for example your test suite) and have it run before committing. The commit will only be made if this task succeeds (exits with code 0). Specify the task by setting the `commitCmd` key in your `fknode.yaml` to a script to be executed (see [fknode.yaml docs](fknode-yaml.md)).

```yaml
commitCmd: "test" # "npm run test" / "deno task test" / ...
```

If absent, no custom task will be executed.

### What to expect

You'll see a confirmation like this one, showing what will be made:

```txt
🚨 Heads up! We're about to take the following actions:
Run deno task test
If everything above went alright, commit 0 file(s) to branch v3 with message "test"

- all of this at @zakahacecosas/fuckingnode@3.0.0-alpha.3 C:\Users\Zaka\FuckingNode
Confirm? [y/N]
```

If you input `y`, all tasks will run, and unless they fail, a commit will be made (and pushed if enabled, which would have shown up in the shown above list).

No files are added to Git, so just as you would normally do, run `git add (whatever)` before running our commit command.

---

You've now learnt how to speed up commits.

Next: Release - How to speed up npm / jsr package releases?
