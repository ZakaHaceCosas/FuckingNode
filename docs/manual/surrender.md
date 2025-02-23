# Using FuckingNode: Automate giving up

> `fuckingnode surrender <project> [message] [alternative] [learn-more] [--github]`

The `surrender` command in F\*ckingNode is a _one of its kind_ command - it automates the process of deprecating a project. It updates dependencies of your project one last time, then updates your README file, makes a final commit, and pushes your changes to GitHub. Once changes are on the cloud, it removes the code from your local machine, too.

## Usage

To deprecate your project, use the following command:

```bash
fuckingnode surrender <project> [message] [alternative] [learn-more] [--github]
```

`<project>` is the project's path or name, `message` is an optional message to leave in the README, `alternative` is an optional URL (or any text) to leave as an alternative to your project, and `learn-more` is an optional URL (or any text) to leave as a link to a page where a user can learn more about your deprecation. If `--github` or `--gh` are passed, GitHub flavored MarkDown will be used.

### The process

Upon running, you'll be prompted to confirm (twice) that you want to do it. Second confirmation will show a preview of the MarkDown code that will be added right before your current README's content and outline what will be done. A preceding header and small text will be chosen at random, for example "⚠ Project Sunset" or "❌ Deprecated Project". Most headings contain emojis for no specific reason.

Below, in case you provided additional params, like `learn-more` or `alternative`, additional text will be added to show these messages.

At the end, there will always be a small disclaimer looking like this:

!!! quote "Disclaimer shown"
    This project was _automatically deprecated_ using the FuckingNode _**VERSION HERE**_ CLI utility (found at [this repo](https://github.com/ZakaHaceCosas/FuckingNode/)), and this message was auto-generated based on their input - so if something feels off, it might be because of that. Below proceeds the old README from this project, unedited

Below is an example of how a full deprecation README, assuming example values for all optional arguments, could look like.

```bash
fkn surrender ../some-package "Next version of ECMAScript adds this as a native JavaScript feature, thus this package is no longer needed." "For browsers that do not support it yet, you can get '@someone/random-feature-polyfill' from npm" "Learn more at https://bsky.app/FuckingNode"
```

```md title="README.md" linenums="1"
# This project is no longer maintained

This repository is archived and will not receive updates or bug fixes.

This note was left by the maintainer of this repository: next version of ecmascript adds this as a native javascript feature, thus this package is no longer needed.

The maintainer of this repository has provided the following alternative: for browsers that do not support it yet, you can get '@someone/random-feature-polyfill' from npm

You may find here additional information regarding this project's deprecation: learn more at https://bsky.app/fuckingnode

###### This project was _automatically deprecated_ using the FuckingNode v3.0.0-rc.3 CLI utility (found at [this repo](https://github.com/ZakaHaceCosas/FuckingNode/)), and this message was auto-generated based on their input - so if something feels off, it might be because of that. Below proceeds the old README from this project, unedited
-------------

# Some package
Original readme would go here, bla bla bla...
```

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
