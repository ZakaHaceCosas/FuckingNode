# Make a commit

> `fuckingnode commit <message> [branch] [--push]`, or `fkcommit <message>`

The `commit` command in F\*ckingNode allows you to run maintenance tasks and any task of your liking before making a commit, and then having the commit made ONLY if these task succeed. This way you ensure you didn't forget to update dependencies before committing and avoid pushing a change that made a certain test not pass (if you chose, for example, your test runner to be the pre-commit task).

## Usage

To commit changes to your project, use the following command:

```bash
fuckingnode commit <MESSAGE> [BRANCH] [--push]
```

`MESSAGE` is obvious and mandatory, `BRANCH` is optional is the branch to commit to. If not given, the branch you were currently on will be used. `--push` is optional too, and if passed, the commit will be pushed to the remote repository.

### Configuring the task to be executed

As said, you can add a task (for example your test suite) and have it run before committing. The commit will only be made if this task succeeds (exits with code 0). Specify the task by using the `commitCmd` key in your `fknode.yaml` and specifying a SCRIPT to be executed (we explained this [when speaking of cleaner features](usage.md#linting-your-code---lint)).

```yaml
commitCmd: "test" # "npm run test" / "deno task test" / ...
```

If not specified, we simply run the default `clean` task (which also runs when you _do_ specify this key).

---

You've now learnt how to speed up commits.

Next: Setup - How to speed up text-config files?

---

[Next: Extra - setup](setup.md)
