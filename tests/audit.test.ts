import { assertEquals } from "@std/assert";
import { ParseNpmReport, ParsePnpmYarnReport } from "../src/commands/toolkit/auditer.ts";
import type { ParsedNodeReport } from "../src/types/audit.ts";
import { JoinPaths } from "../src/functions/filesystem.ts";

const expected: ParsedNodeReport = {
    vulnerablePackages: [
        {
            advisoryUrl: "https://github.com/advisories/GHSA-35jh-r3h4-6jhm",
            packageName: "lodash",
            patchedVersions: ">=4.17.21",
            severity: "high",
            summary: "Command Injection in lodash",
            vulnerableVersions: "<4.17.21",
        },
        {
            advisoryUrl: "https://github.com/advisories/GHSA-qwcr-r2fm-qrc7",
            packageName: "body-parser",
            patchedVersions: ">=1.20.3",
            severity: "high",
            summary: "body-parser vulnerable to denial of service when url",
            vulnerableVersions: "<1.20.3",
        },
        {
            advisoryUrl: "https://github.com/advisories/GHSA-9wv6-86v2-598j",
            packageName: "path-to-regexp",
            patchedVersions: ">=0.1.10",
            severity: "high",
            summary: "path-to-regexp outputs backtracking regular",
            vulnerableVersions: "<0.1.10",
        },
        {
            advisoryUrl: "https://github.com/advisories/GHSA-29mw-wpgm-hmr9",
            packageName: "lodash",
            patchedVersions: ">=4.17.21",
            severity: "moderate",
            summary: "Regular Expression Denial of Service (ReDoS) in lodash",
            vulnerableVersions: "<4.17.21",
        },
        {
            advisoryUrl: "https://github.com/advisories/GHSA-rv95-896h-c2vc",
            packageName: "express",
            patchedVersions: ">=4.19.2",
            severity: "moderate",
            summary: "Express.js Open Redirect in malformed URLs",
            vulnerableVersions: "<4.19.2",
        },
        {
            advisoryUrl: "https://github.com/advisories/GHSA-jpcq-cgw6-v4j6",
            packageName: "jquery",
            patchedVersions: ">=3.5.0",
            severity: "moderate",
            summary: "Potential XSS vulnerability in jQuery",
            vulnerableVersions: ">=1.0.3,<3.5.0",
        },
        {
            advisoryUrl: "https://github.com/advisories/GHSA-gxr4-xjj5-5px2",
            packageName: "jquery",
            patchedVersions: ">=3.5.0",
            severity: "moderate",
            summary: "Potential XSS vulnerability in jQuery",
            vulnerableVersions: ">=1.2.0,<3.5.0",
        },
        {
            advisoryUrl: "https://github.com/advisories/GHSA-rhx6-c78j-4q9w",
            packageName: "path-to-regexp",
            patchedVersions: ">=0.1.12",
            severity: "moderate",
            summary: "Unpatched \\`path-to-regexp\\` ReDoS in 0.1.x",
            vulnerableVersions: "<0.1.12",
        },
        {
            advisoryUrl: "https://github.com/advisories/GHSA-pxg6-pf52-xh8x",
            packageName: "cookie",
            patchedVersions: ">=0.7.0",
            severity: "low",
            summary: "cookie accepts cookie name, path, and domain with out",
            vulnerableVersions: "<0.7.0",
        },
        {
            advisoryUrl: "https://github.com/advisories/GHSA-m6fv-jmcg-4jfg",
            packageName: "send",
            patchedVersions: ">=0.19.0",
            severity: "low",
            summary: "send vulnerable to template injection that can lead to",
            vulnerableVersions: "<0.19.0",
        },
        {
            advisoryUrl: "https://github.com/advisories/GHSA-cm22-4g7w-348p",
            packageName: "serve-static",
            patchedVersions: ">=1.16.0",
            severity: "low",
            summary: "serve-static vulnerable to template injection that can",
            vulnerableVersions: "<1.16.0",
        },
        {
            advisoryUrl: "https://github.com/advisories/GHSA-qw6h-vgh9-j6wx",
            packageName: "express",
            patchedVersions: ">=4.20.0",
            severity: "low",
            summary: "express vulnerable to XSS via response.redirect()",
            vulnerableVersions: "<4.20.0",
        },
    ].sort() as ParsedNodeReport["vulnerablePackages"],
    directDependencies: [
        "lodash",
        "body-parser",
        "express",
        "jquery",
        "path-to-regexp",
        "cookie",
        "send",
        "qs",
        "serve-static",
    ].sort(),
    indirectDependencies: [],
    changeType: "break",
    risk: "high",
};

Deno.test({
    name: "pnpm audit works",
    fn: async () => {
        assertEquals(
            ParsePnpmYarnReport(
                await Deno.readTextFile(
                    await JoinPaths(Deno.cwd(), "tests/environment/test-three/audits/audit-pnpm.txt"),
                ),
                "pnpm",
            ),
            expected,
        );
    },
});

Deno.test({
    name: "npm audit works",
    fn: async () => {
        assertEquals(
            ParseNpmReport(
                await Deno.readTextFile(
                    await JoinPaths(Deno.cwd(), "tests/environment/test-three/audits/audit-npm.txt"),
                ),
            ),
            expected,
        );
    },
});

Deno.test({
    name: "yarn audit works",
    fn: async () => {
        assertEquals(
            ParsePnpmYarnReport(
                await Deno.readTextFile(
                    await JoinPaths(Deno.cwd(), "tests/environment/test-three/audits/audit-yarn.txt"),
                ),
                "yarn",
            ),
            expected,
        );
    },
});
