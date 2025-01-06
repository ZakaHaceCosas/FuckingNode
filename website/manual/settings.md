# F*ckingNode settings

As any successful app, we allow you to change settings so you can customize F\*ckingNode's behavior to your liking.

You can view the CLI's settings by running `fuckingnode settings`.

```cmd
PS C:\Users\sigma_male> fuckingnode settings help
💡 Your current settings are:
---
Update frequency: Each 9 days.
Default cleaner intensity: normal
Favorite editor: vscode
```

You can change them with the `settings change <setting> value`. These are all settings that can be changed, how, and what they do.

| Command | Type | Description | Notes |
| :--- | ---: | :--: | ---: |
| `change default-int <value>` | `normal`, `hard`, `hard-only`, or `maxim` | Changes the default intensity for the `clean` command. | / |
| `change update-freq <value>` | A fixed number | Changes how frequently (in DAYS) the CLI sends an HTTP request for updates. | We recommend setting it to a high value; we don't frequently update, so save up those HTTP requests. |
| `change fav-editor <value>` | `vscode`, `sublime` | Your favorite code editor. Used by `kickstart`. | You can't set it to a different editor as of now, sorry. |

Settings includes an additional `flush` command, that takes a `<file>` (`logs`, `updates`, `projects`, or `all`) as an argument, removing that from F\*ckingNode's configuration. Removing `logs` is particularly recommended. Removals of `projects` and `all` are discouraged - by the way, yes, we store all logs in a `.log` file, it lives in `%APPDATA%/FuckingNode` on Windows and `/home/USER/.config/FuckingNode` on Linux & macOS.

There's another settings command, `settings repair`. It simply resets settings to defaults.

---

By this point, the core of the CLI (`clean`, `manager`, and `settings`) has been explained entirely. Now just the extras remain.

---

[Next: Extra - Kickstart projects](kickstart.md)
