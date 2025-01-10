// send help

import { APP_NAME, I_LIKE_JS } from "../../constants.ts";
import { Commander } from "../../functions/cli.ts";
import { ColorString, LogStuff, MultiColorString } from "../../functions/io.ts";
import { GetProjectEnvironment, NameProject, SpotProject } from "../../functions/projects.ts";
import type { FkNodeSecurityAudit, ParsedNpmReport, SecurityVulnerability } from "../../types/audit.ts";
import { FknError } from "../../utils/error.ts";

/**
 * Gets a package's security vulnerabilities from OSV.dev.
 *
 * @async
 * @param {string} packageName Name of the package.
 * @returns {Promise<SecurityVulnerability[]>} Array of vulnerabilities associated to the package.
 */
async function FetchVulnerability(packageName: string): Promise<SecurityVulnerability[]> {
    const response = await fetch("https://api.osv.dev/v1/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            package: {
                name: packageName,
                ecosystem: "npm",
            },
        }),
    });

    if (!response.ok) throw new Error(`Error checking with OSV.dev: ${response.statusText}`);

    const data = await response.json();

    if (!data.vulns) {
        throw new Error("Unexpected response format from OSV.dev");
    }

    return data.vulns || [];
}

/**
 * Analyzes security vulnerabilities searching for keywords, returns an array of starter questions for the interrogatory. While unused, also returns the keywords (`vectors`) found.
 *
 * @param {SecurityVulnerability[]} vulnerabilities
 */
function AnalyzeVulnerabilities(vulnerabilities: SecurityVulnerability[]): {
    questions: string[];
    vectors: string[];
} {
    const questions: Set<string> = new Set<string>();
    const vectors: Set<string> = new Set<string>();

    function has(vuln: SecurityVulnerability, keywords: string[]): boolean {
        const details = typeof vuln.details === "string" ? vuln.details.toLowerCase() : "";
        const summary = typeof vuln.summary === "string" ? vuln.summary.toLowerCase() : "";

        const hasInSum = keywords.some((keyword) => summary.includes(keyword.toLowerCase()));
        const hasInDet = keywords.some((keyword) => details.includes(keyword.toLowerCase()));

        return hasInSum || hasInDet;
    }

    for (const vulnerability of vulnerabilities) {
        if (has(vulnerability, ["network"])) {
            questions.add(
                "Does your app make HTTP requests and/or depend on networking in any way?",
            );
            vectors.add("network");
        }

        if (has(vulnerability, ["cookie"])) {
            questions.add(
                "Does your app make use of browser cookies?",
            );
            vectors.add("cookie");
        }

        if (has(vulnerability, ["console"])) {
            questions.add(
                "Does your app allow access to the browser or JavaScript console?\n(Web apps obviously do; we ask for cases like Electron or ReactNative apps).",
            );
            vectors.add("console");
        }
    }

    return {
        questions: Array.from(questions),
        vectors: Array.from(vectors),
    };
}

/**
 * Asks a question for the interrogatory, returns a "stringified boolean" (weird, I know, we had to pivot a little bit), depending on the response. `"true"` means the user response is something to worry about, `"false"` means it's not.
 *
 * @async
 * @param {string} question Question itself.
 * @param {boolean} isFollowUp If true, question is a follow up to another question.
 * @param {boolean} isReversed If true, responding "yes" to the question means it's not a vulnerability (opposite logic).
 * @returns {Promise<"true" | "false">}
 */
async function askQuestion(question: string, isFollowUp: boolean, isReversed: boolean): Promise<"true" | "false"> {
    const formattedQuestion = MultiColorString(question, isFollowUp ? "bright-blue" : "bright-yellow", "italic");
    const response = await LogStuff(formattedQuestion, undefined, undefined, true);
    switch (response) {
        case true:
            return isReversed ? "false" : "true";
        case false:
            return isReversed ? "true" : "false";
    }
}

/**
 * Interrogates a vulnerability, based on base questions (obtained from `AnalyzeVulnerabilities()`) and asking more in-depth questions based on user response.
 *
 * @async
 * @param {string[]} questions Base questions.
 * @returns {Promise<FkNodeSecurityAudit>}
 */
async function InterrogateVulnerability(questions: string[]): Promise<FkNodeSecurityAudit> {
    const responses: ("true" | "false")[] = [];

    // I REMADE BOOLEANS AS STRINGS IN PURPOSE
    // ! DON'T QUESTION IT
    async function handleAskQuestion(q: string, f: boolean, r: boolean): Promise<"true" | "false"> {
        const qu = await askQuestion(q, f, r);
        responses.push(qu);
        return qu;
    }

    for (const question of questions) {
        const response = await handleAskQuestion(question, false, false);

        // specific follow-up questions based on user responses
        // to further interrogate da vulnerability
        // im the king of naming functions fr fr
        if (response === "true" && question.includes("cookies")) {
            await handleAskQuestion(
                "Are cookies being set with the 'Secure' and 'HttpOnly' flags?",
                true,
                true,
            );
            await handleAskQuestion(
                "Are your cookies being shared across domains?",
                true,
                false,
            );
            const followUpThree = await handleAskQuestion(
                "Are you using cookies to store user sensitive data (such as their login)?",
                true,
                false,
            );
            if (followUpThree === "true") {
                await handleAskQuestion(
                    "Do these cookies store sensitive data directly (e.g., a user token that grants automatic access), or is there an additional layer of protection for their content?",
                    true,
                    false,
                );
            }
        }

        if (response === "true" && question.includes("network")) {
            await handleAskQuestion(
                "Does any of that HTTP requests include any sensitive data? Such as login credentials, user data, etc...",
                true,
                false,
            );
            await handleAskQuestion(
                "Do you use Secure HTTP (HTTPS) for some or all requests?",
                true,
                true,
            );
            const followUpThree = await handleAskQuestion(
                "Does your app use WebSockets or similar persistent connections?",
                true,
                false,
            );
            if (followUpThree === "true") {
                await LogStuff(
                    "We'll use the word 'WebSockets', however these questions apply for any other kind of persistent connection, like WebRTC.",
                    undefined,
                    "italic",
                );
                await handleAskQuestion(
                    "Do you use Secure WebSockets (WSS) for some or all connections?",
                    true,
                    true,
                );
                await handleAskQuestion(
                    "WebSockets are used for real-time communication in your app. In your app, is it possible for a user to access sensitive data or perform administrative actions from another client without additional authorization? For example, in a real-time document editing app, changing permissions or seeing emails from other users?",
                    true,
                    false,
                );
            }
        }

        if (question.includes("console")) {
            if (response === "true") {
                const followUpOne = await handleAskQuestion(
                    "Do you have any method and/or API exposed that can be used from the console?",
                    true,
                    false,
                );
                if (followUpOne === "true") {
                    await handleAskQuestion(
                        "Does that include risky methods? For example, in Discord you can get an account's token from the JS console (risky method).",
                        true,
                        false,
                    );
                }
            } else if (response === "false") {
                const followUpOne = await handleAskQuestion(
                    "You said your app doesn't allow access to the console. Is there, still, any way of executing JS commands within your app that you're aware of?",
                    true,
                    false,
                );
                if (followUpOne === "true") {
                    await handleAskQuestion(
                        "Do you have control over it? So you can disable certain methods, and/or disable it entirely.",
                        true,
                        true,
                    );
                }
            }
        }
    }

    const { positives, negatives } = responses.reduce(
        (acc, value) => {
            if (value === "true") {
                acc.positives += 1;
            } else if (value === "false") {
                acc.negatives += 1;
            }
            return acc;
        },
        { positives: 0, negatives: 0 },
    );

    const total = positives + negatives;
    const percentage = Math.abs((positives / total) * 100);

    return {
        positives,
        negatives,
        percentage,
    };
}

/**
 * Formats and displays the audit results.
 *
 * @async
 * @param {number} percentage Percentage result.
 * @returns {Promise<void>}
 */
async function DisplayAudit(percentage: number): Promise<void> {
    let color: "bright-yellow" | "red" | "bright-green";
    let message: string;
    if (percentage < 20) {
        color = "bright-green";
        message =
            `Seems like we're okay, one ${I_LIKE_JS.MFN} project less to take care of!\nNever forget the best risk is no risk - we still encourage you to fix the vulnerabilities if you can.`;
    } else if (percentage >= 20 && percentage < 50) {
        color = "bright-yellow";
        message = `${ColorString("There is a potential risk", "bold")} of these vulnerabilities causing you a headache.\nWhile you ${
            ColorString("might", "italic")
        } be able to live with them, you should fix them.`;
    } else {
        color = "red";
        message = `${
            ColorString(`Oh ${I_LIKE_JS.FK}`, "bold")
        }. This project really should get all vulnerabilities fixed.\nBreaking changes can hurt, but your app security's breaking hurts a lot more. ${
            ColorString("Please, fix this issue.", "bold")
        }`;
    }
    console.log("");
    const percentageString = MultiColorString(
        `${percentage.toFixed(2)}%`,
        color,
        "bold",
    );
    await LogStuff(
        `We've evaluated your responses and concluded a risk factor of ${percentageString}.`,
    );
    await LogStuff(message);
    console.log("");
}

/**
 * Takes the output of npm audit command and parses it to get what we care about.
 *
 * Don't tell me about npm audit --json, I know that exists, we parse bare output by design, not by mistake.
 *
 * @export
 * @param {string} report
 * @returns {ParsedNpmReport}
 */
export function ParseNpmReport(report: string): ParsedNpmReport {
    const vulnerablePackages: string[] = [];
    const directlyAffectedDependencies: string[] = [];
    const indirectlyAffectedDependencies: string[] = [];
    const severities: string[] = [];
    let breakingChanges = false;
    let nonBreakingChanges = false;

    // process each line of the report
    const lines = report.split("\n");
    lines.forEach((line) => {
        line = line.trim();
        if (/^\w+/.test(line) && !line.startsWith("#")) {
            // extract names of affected packages (format: package [version])
            const match = line.match(/^(\w+)/);
            if (match && match[1]) vulnerablePackages.push(match[1]);
        } else if (line.includes("fix available via") && line.includes("--force")) {
            // fix (breaking)
            breakingChanges = true;
        } else if (line.includes("fix available via") && !line.includes("--force")) {
            // fix (non breaking)
            nonBreakingChanges = true;
        } else if (line.startsWith("node_modules")) {
            // extract affected dependencies
            const match = line.match(/node_modules\/([\w-]+)/);
            if (match && match[1]) {
                if (line.includes("Depends on vulnerable versions")) {
                    indirectlyAffectedDependencies.push(match[1]);
                } else {
                    directlyAffectedDependencies.push(match[1]);
                }
            }
        } else if (/Severity:\s*(\w+)/.test(line)) {
            // get severity
            const match = line.match(/Severity:\s*(\w+)/);
            if (match && match[1]) {
                severities.push(match[1]);
            }
        }
    });

    // determine the kind of change
    let changeType: "noBreak" | "break" | "both" = "noBreak";
    let risk: "critical" | "high" | "moderate" | "low";

    if (breakingChanges && nonBreakingChanges) {
        changeType = "both";
    } else if (breakingChanges) {
        changeType = "break";
    }

    if (severities.includes("critical")) {
        risk = "critical";
    } else if (severities.includes("high")) {
        risk = "high";
    } else if (severities.includes("moderate")) {
        risk = "moderate";
    } else if (severities.includes("low")) {
        risk = "low";
    } else {
        // 1. rare edge case, we should have detected a severity already
        // 2. just in case, default to moderate instead of low (as we don't really know what's up)
        risk = "moderate";
    }

    return {
        vulnerablePackages: [...new Set(vulnerablePackages)], // (Set to remove duplicates)
        changeType,
        directDependencies: [...new Set(directlyAffectedDependencies)],
        indirectDependencies: [...new Set(indirectlyAffectedDependencies)],
        risk,
    };
}

/**
 * Handler function for auditing a project.
 *
 * @export
 * @async
 * @param {ParsedNpmReport} bareReport Parsed npm audit.
 * @param {boolean} strict If true, uses a slightly stricter criteria for the audit.
 * @returns {Promise<FkNodeSecurityAudit>}
 */
export async function AuditProject(bareReport: ParsedNpmReport, strict: boolean): Promise<FkNodeSecurityAudit> {
    const { vulnerablePackages, risk } = bareReport;

    const vulnerabilities: SecurityVulnerability[] = [];

    for (const dependency of vulnerablePackages) {
        const res = await FetchVulnerability(dependency);

        for (const foundVulnerability of res) {
            vulnerabilities.push(foundVulnerability);
        }
    }

    const totalVulnerabilities: number = vulnerabilities.length;

    await LogStuff(
        `\n===        FOUND VULNERABILITIES (${totalVulnerabilities.toString().padStart(3, "0")})        ===\n${
            ColorString(vulnerabilities.map((vuln) => vuln.id).join(" & "), "bold")
        }\n===    STARTING ${APP_NAME.STYLED} SECURITY AUDIT    ===`,
    );

    console.log("");
    await LogStuff("Please answer these questions. We'll use your responses to evaluate this vulnerability:", "bulb");
    console.log("");

    const { questions } = AnalyzeVulnerabilities(vulnerabilities);

    const audit = await InterrogateVulnerability(questions);
    const { negatives, positives } = audit;

    const riskBump = risk === "critical" ? 1 : risk === "high" ? 0.75 : risk === "moderate" ? 0.5 : 0.25;

    // neg += riskBump;
    // LEGACY IMPLEMENTATION
    const classicPercentage = (positives + negatives) > 0 ? (positives / (positives + negatives)) * 100 : 0;

    const revampedStrictPercentage = (classicPercentage + (riskBump * 100)) / 2;

    const percentage = strict ? revampedStrictPercentage : classicPercentage;

    // ATTEMPTS OF IMPROVEMENT THAT NEVER WORKED OUT :(
    // const tweakedPercentage = (neg === 0) ? 0 : Math.abs(((pos + riskBump) / (pos + neg)) * 100);
    // const strictPercentage = Math.abs(pos - neg) !== 0 ? ((pos / (pos + neg)) + (riskBump / (riskBump + neg - pos))) * 100 : 0;
    await DisplayAudit(percentage);
    return {
        negatives,
        positives,
        percentage,
    };
}

/**
 * Audits a project for security vulnerabilities. Returns 0 if no vulnerabilities are found, 1 if the project manager doesn't support auditing, or the audit results.
 *
 * @export
 * @async
 * @param {string} project Path to project to be audited.
 * @param {boolean} strict If true, uses a slightly stricter criteria for the audit.
 * @returns {Promise<
 *     | FkNodeSecurityAudit
 *     | 0
 *     | 1
 * >}
 */
export async function PerformAuditing(project: string, strict: boolean): Promise<
    | FkNodeSecurityAudit
    | 0
    | 1
> {
    try {
        const workingPath = await SpotProject(project);
        if (!workingPath) {
            throw new FknError("Generic__NonFoundProject");
        }
        const env = await GetProjectEnvironment(workingPath);
        const name = await NameProject(env.root, "name-ver");
        const current = Deno.cwd();
        if (env.commands.audit === "__UNSUPPORTED") {
            await LogStuff(
                `Audit is not supported for ${env.manager.toUpperCase()}`,
                "prohibited",
            );
            return 1;
        }
        Deno.chdir(env.root);
        await LogStuff(`Auditing ${name}`, "working");
        const res = await Commander(
            env.commands.base,
            env.commands.audit,
            false,
        );
        if (res.success || !res.stdout || res.stdout?.trim() === "") {
            await LogStuff(
                `Clear! There aren't any known vulnerabilities affecting ${name}.`,
                "tick",
            );
            return 0;
        }

        const bareReport = ParseNpmReport(res.stdout);

        const ret = await AuditProject(bareReport, strict);

        Deno.chdir(current);

        return ret;
    } catch (e) {
        throw e;
    }
}
