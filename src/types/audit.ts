import type { tURL } from "./misc.ts";

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

export type ParsedNpmReport = {
    vulnerablePackages: string[];
    changeType: "break" | "noBreak" | "both";
    directDependencies: string[];
    indirectDependencies: string[];
    risk: "low" | "moderate" | "high" | "critical";
};
