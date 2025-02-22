# Using FuckingNode: The fknode.yaml file

The `fknode.yaml` file is used to configure extra settings for individual projects. It is completely opt-in and not required whatsoever. Some settings do however require specific config from here.

Below is a detailed explanation of each configuration option available in the file. They are all optional.

!!! tip "Get autocomplete for VSCode"
    While still work in progress, you can already download our Visual Studio Code extension for FuckingNode V3 [here](https://marketplace.visualstudio.com/items?itemName=ZakaHaceCosas.fknode).

## divineProtection

Divine protection is what we call _ignorance_. Basically, if you run a global cleanup with the `--update` flag (so all projects get their dependencies updated) but don't want a specific project to get its dependencies updated, you'd add `"updater"` to the `divineProtection` option.

It can either be an array of `feature-er` strings (`updater`, `linter`, etc...), or `"*"` to ignore everything. `"disabled"` is also valid and equals the default configuration.

- **Type**: `("updater" | "cleaner" | "linter" | "prettifier" | "destroyer")[] | "*" | "disabled"`
- **Example**:

  ```yaml
  divineProtection: ["updater", "cleaner"] # ignore cleanup & dependency updates
  ```

## lintCmd

Specifies a script (from `your package file > scripts {}`) to be used for linting when `--lint` is passed to `clean`, overriding the default (ESLint).

- **Type**: `string`
- **Example**:

  ```yaml
  lintCmd: "lint" # so FuckingNode will run "npm run lint"
  ```

## prettyCmd

Specifies a script (from `your package file > scripts {}`) script to be used for prettifying when `--pretty` is passed to `clean`, overriding the default (Prettier).

- **Type**: `string`
- **Example**:

  ```yaml
  prettyCmd: "prettify" # so FuckingNode will run "npm run prettify"
  ```

## destroy

Configuration for the destroyer, which removes specified targets when `clean` is called with any of the `intensities`, or an `"*"` for enabling regardless of the intensity.

- **Type**:

  ```yaml
  destroy:
    intensities: ("normal" | "hard" | "maxim" | "*")[]
    targets: string[]
  ```

- **Example**:

  ```yaml
  destroy:
    intensities: ["high"]
    targets: ["dist", "build"]
  ```

## commitActions

If true, a commit will be made if an action that changes the code is performed and the Git workspace is clean. Learn more [here](usage.md#committing-your-code---commit).

- **Type**: `boolean`
- **Example**:

  ```yaml
  commitActions: true
  ```

## commitMessage

Specifies the commit message to be used if a commit is made. If not provided, a default message is used.

- **Type**: `string`
- **Example**:

  ```yaml
  commitMessage: "Automated maintenance commit by fknode"
  ```

## updateCmdOverride

Overrides the default command for the updating dependencies with the provided runtime script command. Works the same way as [lintCmd](#lintcmd) or [prettyCmd](#prettycmd), we simply made the name more verbose because in most cases you don't need (and should not) mess around with it.

- **Type**: `string`
- **Example**:

  ```yaml
  updateCmdOverride: "update" # replaces "npm update" with "npm run update"
  ```

## flagless

Enables flagless features.

- **Type**:

  ```yaml
  flagless:
    flaglessUpdate: boolean
    flaglessDestroy: boolean
    flaglessLint: boolean
    flaglessPretty: boolean
    flaglessCommit: boolean
  ```

- **Example**:

  ```yaml
  flagless:
    flaglessUpdate: true
    flaglessDestroy: false
    flaglessLint: true
    flaglessPretty: false
    flaglessCommit: true
  ```

## releaseCmd

Specifies a task to be executed upon running the `release` command.

- **Type**: `string`
- **Example**:

  ```yaml
  releaseCmd: "release" # equals "npm run release"
  ```

## releaseAlwaysDry

If true, the `release` command will always use `dry-run`.

- **Type**: `boolean`
- **Example**:

  ```yaml
  releaseAlwaysDry: true
  ```

## commitCmd

Specifies a task to be executed upon running the `commit` command.

- **Type**: `string`
- **Example**:

  ```yaml
  commitCmd: "commit" # equals "npm run commit"
  ```

---

This is an example of a full `fknode.yaml` file.

```yaml
divineProtection: ["updater", "cleaner"]
lintCmd: "lint"
prettyCmd: "prettify"
destroy:
  intensities: ["high"]
  targets: ["dist", "build"]
commitActions: true
commitMessage: "Automated commit by fknode"
updateCmdOverride: "update"
flagless:
  flaglessUpdate: true
  flaglessDestroy: false
  flaglessLint: true
  flaglessPretty: false
  flaglessCommit: true
releaseCmd: "release"
releaseAlwaysDry: true
commitCmd: "commit"
```
