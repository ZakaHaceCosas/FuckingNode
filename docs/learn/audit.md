# Audit

An attempt to make security reports easier.

!!! danger "Outdated"
    **This section will not be updated until V3.1.** To prevent V3 from taking ages, as we've recently planned a full rewrite of this feature, we will not waste our time on fixing a feature that is not considered stable for use anyway.
    **Avoid using audit as of now.**

!!! danger "Work in Progress feature"
    This is an **experimental** feature. It is subject to changes, full rewrites, or even removals.

## Abstract

We will explain this  with a real life example - I, the creator of F\*ckingNode, have been working on a mobile React Native app, which once became affected by a `low` severity vulnerability, related to cookies. The thing is, fixing it implied breaking changes (as `expo-router` had a dependency that had a dependency that had a... until one that depended on the vulnerable version).

However, as a mobile app that never interacted with cookies and very rarely used HTTP or the web themselves, turns out the breaking changes _were not "worth it"_.

**Sometimes that is the case, a vulnerability is not really a concern.** However, it can be hard to analyze if you really should just let it go, or if it is a vulnerability that can really hurt your project. _**That is what we made this feature for.**_

### TL;DR

`fuckingnode audit` analyzes vulnerabilities and helps you tell if they really affect your project or if they can be left alone without too much risk.

## How it works

> AGAIN, THIS IS AN UNFINISHED, NON-RELEASED FEATURE.

The process is as follows:

- We analyze your vulnerabilities
- A questionnaire is made based on present attack vectors
- Your responses are used to prompt additional questions depending on your responses
- A final **risk factor** (percentage) is calculated and shown to you.

Due to where nowadays society is heading, it _is_ worth noting questions are not AI generated whatsoever.

### Step one: analysis

```mermaid
graph TD
    A[npm audit] -->|Command execution| B[Returns report string]
    B -->|Parsed| C[Stored in ParsedNpmReport]
    C -->|For each dependency| D[Fetch info from OSV.dev and store it]
```

We regularly audit your project and rely on `https://api.osv.dev` to get more details onto what is it about. After that, a more detailed analysis is made where we obtain **key questions** based on vectors.

```mermaid
graph TD
    A[ParsedNpmReport] -->|For each vulnerability| B[Pass key data to analyzer function]
    B -->|Search for attack vectors via keywords| C(Keyword / vector found?)
    C -- Yes --> D[Return 'beginner question' based on attack vector] --> F
    C -- No --> E[No return] --> F
    F[Was that the last one?]
    F -- Yes --> G[Audit complete]
    F -- No --> B
```

We search for keywords like `network`, `cookie`, or `console` which define "attack vectors". For each vector that is present, we return a "beginner question" for the auditing process. These "beginner questions" are the entry point of each vector's auditing flow - in other words - if the `network` vector _is_ found you will be first asked if your app does make usage of any kind of networking features, asking you more specific questions about your usage if you respond "yes", or skipping the vulnerability if otherwise, considering it is probably a vulnerable dependency _of a dependency of a dependency..._ that does not really affect you.

### Step two: interrogation

As noted above, we will "interrogate" your usage of features. It is a simple YES/NO flow, like in this illustrated example:

```mermaid
graph TD
    A(Network vector was found) -->|Beginner question| B['Does your app use networking features?']
    B -->|YES| C(Additional questions are asked) --> D[...]
    B -->|NO| E[SKIP]
    E --> F(More vectors present?)
    F -->|YES| G[Continue...]
    F -->|NO| H[Audit results are ready by this point.]
```

### Step three: evaluation

Your questions are evaluated using a straightforward positive-negative system: responses indicating 'positive' information add +1 to the positive count, while those indicating 'negative' information add +1 to the negative count.

These counts are used to compute the RF, based on the following formula:

$$
R.F. = \left( \frac{\text{positives}}{\text{positives} + \text{negatives}} \right) \times 100
$$

There is a `--strict` flag that can be passed to the audit command that adds an additional **risk bump**, based on the severity of the most-severe identified vulnerability, as follows:

$$
Strict R.B. = \frac{R.F. + (R.B. \times 100)}{2}
$$

RB values are as follows:

| Severity |   RB |
| :------- | ---: |
| critical |    1 |
| high     | 0.75 |
| moderate |  0.5 |
| low      | 0.25 |

---

## Summary

F\*ckingNode audit should not be allowed to have the final say over whether breaking-changes-packed security fixes should be applied or not. It is only meant to provide an estimate, in order to help you make a clearer decision. We will still always encourage you to resolve any vulnerability that you're capable of.

---

## Availability

Where `EXP` indicates experimental, `CAVEAT` indicates partial support / support with known flaws, and `YES` and `NO` indicate the obvious.

| Support    | NodeJS npm | NodeJS pnpm | NodeJS yarn | Deno | Bun | Go | Cargo |
| :--------- | ---------- | ----------- | ----------- | ---- | --- | -- | ----- |
| **v3.0.0** | EXP        | EXP         | EXP         | NO   | NO  | NO | NO    |
| v2.1.0     | EXP        | NO          | NO          | NO   | NO  | NO | NO    |

*[RF]: Risk Factor; a percentage computed by us to estimate the joint impact of all vulnerabilities of a NodeJS project.
*[RB]: Risk Bump; a 0.25-1 number that's used to bump the RF based on the highest severity (as in low/moderate/high/critical) of a found vulnerability within a project.
