# Using FuckingNode: Automate giving up

> `fuckingnode surrender <project> [message] [alternative] [learnMoreUrl] [--github]`

The `surrender` command in F\*ckingNode is a _one of its kind_ command - it automates the process of deprecating a project. It runs a last maintenance task (`clean`), then updates your README file, makes a final commit, and pushes your changes to GitHub.

## Usage

To deprecate your project, use the following command:

```bash
fuckingnode surrender <project> [message] [alternative] [learnMoreUrl] [--github]
```

`<project>` is the project's path or name, `message` is an optional message to leave in the README, `alternative` is an optional URL (or any text) to leave as an alternative to your project, and `learnMoreUrl` is an optional URL (or any text) to leave as a link to a page where a user can learn more about your deprecation. If `--github` or `--gh` are passed, GitHub flavored MarkDown will be used.

### The process

Upon running, you'll be prompted to confirm (twice) that you want to do it. Second confirmation will show a preview of the MarkDown code that will be added right before your current README's content and outline what will be done. A preceding header and small text will be chosen at random, for example "⚠ Project Sunset" or "❌ Deprecated Project". Most headings contain emojis for no specific reason.

Below, in case you provided additional params, additional text will be added. At the end, there will always be a small disclaimer looking like this:

!!! quote "Disclaimer shown"
    This project was _automatically deprecated_ using the FuckingNode _**VERSION HERE**_ CLI utility (found at [this repo](https://github.com/ZakaHaceCosas/FuckingNode/)), and this message was auto-generated based on their input - so if something feels off, it might be because of that. Below proceeds the old README from this project, unedited

If you do hit `y` twice, the process will begin, with no way to stop it (in reality you could immediately hit `CTRL` + `C` to end the CLI process, however by this point you are theoretically sure you _don't_ want to stop it).

**Something important to note is that, after pushing all your changes to remote**, since they are not (supposedly) on the cloud and you theoretically don't plan to keep maintaining the code anyway, we will remove the entire folder from your hard drive to save up space (as there is no reason to keep big `.git/` and `node_nodules/` directories for a project that is not even alive).

### Aliases

There are different _aliases_ that invoke the exact same command, for you to choose from depending on your mood. They do not affect the process or parameters taken at all.

- `fuckingnode surrender <project> (other params...)`
- `fuckingnode give-up <project> (other params...)`
- `fuckingnode i-give-up <project> (other params...)`
- `fuckingnode its-over <project> (other params...)`
- `fuckingnode i-really-hate <project> (other params...)`
- `fuckingnode im-done-with <project> (other params...)`

---

This feature might seem a joke, but in reality, regardless of it being a project you just made to learn JavaScript and didn't want to grow large, or a real and well-paid job taking most of your time, you will very likely encounter yourself deprecating a project, so this command will actually serve you a purpose.

> Any allegations of FuckingNode being deprecated have 97.77% chances of being false.

---

You've now learnt everything about F\*ckingNode.

---

[What's next?](whats-next.md)
