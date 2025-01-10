import type { tURL } from "./misc.ts";

/**
 * A security vulnerability.
 */
export type SecurityVulnerability = {
    id: string;
    references: {
        type: "REPORT";
        url: tURL;
    }[];
    summary: string;
    details: string | string[];
};

/**
 * A simple summary of our security audit.
 */
export type FkNodeSecurityAudit = {
    /**
     * Amount of answers that are positive or imply a decrease in the vulnerability's severity.
     *
     * @type {number}
     */
    positives: number;
    /**
     * Amount of answers that are negative or imply an increase in the vulnerability's severity.
     *
     * @type {number}
     */
    negatives: number;
    /**
     * Final risk factor.
     *
     * @type {number}
     */
    percentage: number;
};

/**
 * A parsed `npm` report.
 */
export type ParsedNpmReport = {
    /**
     * Packages that are vulnerable.
     *
     * @type {string[]}
     */
    vulnerablePackages: string[];
    /**
     * Do the proposed fixes imply breaking changes, non-breaking changes, or a mix of both?
     *
     * @type {"break" | "noBreak" | "both"}
     */
    changeType: "break" | "noBreak" | "both";
    /**
     * Dependencies directly affected.
     *
     * e.g., if I depend on `expo@52.0.0` and it's vulnerable to something _by itself_, it appears here.
     *
     * @type {string[]}
     */
    directDependencies: string[];
    /**
     * Dependencies indirectly affected.
     *
     * e.g., if I depend on `expo@52.0.0` and it's _not_ vulnerable to something _by itself_ but depends on some package that _is_ vulnerable, it appears here.
     *
     * @type {string[]}
     */
    indirectDependencies: string[];
    /**
     * Highest risk found.
     *
     * @type {("low" | "moderate" | "high" | "critical")}
     */
    risk: "low" | "moderate" | "high" | "critical";
};
