const OVS_SAMPLE_RETURN = {
    vulns: [
        {
            id: "GHSA-cm5g-3pgc-8rg4",
            summary: "Express ressource injection",
            details:
                "A vulnerability has been identified in the Express response.links function, allowing for arbitrary resource injection in the Link header when unsanitized data is used.\n" +
                "\n" +
                "The issue arises from improper sanitization in `Link` header values, which can allow a combination of characters like `,`, `;`, and `<>` to preload malicious resources.\n" +
                "\n" +
                "This vulnerability is especially relevant for dynamic parameters.",
            aliases: ["CVE-2024-10491"],
            modified: "2024-12-19T17:52:09Z",
            published: "2024-10-29T18:30:37Z",
            database_specific: {
                github_reviewed_at: "2024-11-25T21:31:20Z",
                github_reviewed: true,
                severity: "MODERATE",
                cwe_ids: ["CWE-74"],
                nvd_published_at: "2024-10-29T17:15:03Z",
            },
            references: [
                {
                    type: "ADVISORY",
                    url: "https://nvd.nist.gov/vuln/detail/CVE-2024-10491",
                },
                {
                    type: "WEB",
                    url: "https://github.com/expressjs/express/issues/6222",
                },
                {
                    type: "PACKAGE",
                    url: "https://github.com/expressjs/express",
                },
                {
                    type: "WEB",
                    url: "https://www.herodevs.com/vulnerability-directory/cve-2024-10491",
                },
            ],
            affected: [
                {
                    package: [Object],
                    ranges: [Array],
                    database_specific: [Object],
                },
            ],
            schema_version: "1.6.0",
            severity: [
                {
                    type: "CVSS_V3",
                    score: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:C/C:L/I:N/A:N",
                },
            ],
        },
        {
            id: "GHSA-gpvr-g6gh-9mc2",
            summary: "No Charset in Content-Type Header in express",
            details:
                "Vulnerable versions of express do not specify a charset field in the content-type header while displaying 400 level response messages. The lack of enforcing user's browser to set correct charset, could be leveraged by an attacker to perform a cross-site scripting attack, using non-standard encodings, like UTF-7.\n" +
                "\n" +
                "\n" +
                "## Recommendation\n" +
                "\n" +
                "For express 3.x, update express to version 3.11 or later.\n" +
                "For express 4.x, update express to version 4.5 or later. ",
            aliases: ["CVE-2014-6393"],
            modified: "2023-11-08T03:57:43.877257Z",
            published: "2018-10-23T17:22:54Z",
            database_specific: {
                cwe_ids: ["CWE-79"],
                github_reviewed: true,
                severity: "MODERATE",
                github_reviewed_at: "2020-06-16T21:37:54Z",
                nvd_published_at: "2017-08-09T18:29:00Z",
            },
            references: [
                {
                    type: "ADVISORY",
                    url: "https://nvd.nist.gov/vuln/detail/CVE-2014-6393",
                },
                {
                    type: "WEB",
                    url: "https://bugzilla.redhat.com/show_bug.cgi?id=1203190",
                },
                {
                    type: "ADVISORY",
                    url: "https://github.com/advisories/GHSA-gpvr-g6gh-9mc2",
                },
                { type: "WEB", url: "https://www.npmjs.com/advisories/8" },
            ],
            affected: [
                {
                    package: [Object],
                    ranges: [Array],
                    database_specific: [Object],
                },
                {
                    package: [Object],
                    ranges: [Array],
                    database_specific: [Object],
                },
            ],
            schema_version: "1.6.0",
            severity: [
                {
                    type: "CVSS_V3",
                    score: "CVSS:3.0/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N",
                },
            ],
        },
        {
            id: "GHSA-jj78-5fmv-mv28",
            summary: "Express Open Redirect vulnerability",
            details:
                "URL Redirection to Untrusted Site ('Open Redirect') vulnerability in Express. This vulnerability affects the use of the Express Response object. This issue impacts Express: from 3.4.5 before 4.0.0-rc1.",
            aliases: ["CVE-2024-9266"],
            modified: "2024-10-09T23:46:55Z",
            published: "2024-10-03T21:31:05Z",
            database_specific: {
                github_reviewed_at: "2024-10-09T17:03:12Z",
                github_reviewed: true,
                severity: "LOW",
                cwe_ids: ["CWE-601"],
                nvd_published_at: "2024-10-03T19:15:05Z",
            },
            references: [
                {
                    type: "ADVISORY",
                    url: "https://nvd.nist.gov/vuln/detail/CVE-2024-9266",
                },
                {
                    type: "PACKAGE",
                    url: "https://github.com/expressjs/express",
                },
                {
                    type: "WEB",
                    url: "https://github.com/expressjs/express/compare/3.4.4...3.4.5",
                },
                {
                    type: "WEB",
                    url: "https://www.herodevs.com/vulnerability-directory/cve-2024-9266",
                },
            ],
            affected: [
                {
                    package: [Object],
                    ranges: [Array],
                    database_specific: [Object],
                },
            ],
            schema_version: "1.6.0",
            severity: [
                {
                    type: "CVSS_V3",
                    score: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:N/A:N",
                },
                {
                    type: "CVSS_V4",
                    score: "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:P/VC:N/VI:N/VA:N/SC:L/SI:N/SA:N/E:P",
                },
            ],
        },
        {
            id: "GHSA-qw6h-vgh9-j6wx",
            summary: "express vulnerable to XSS via response.redirect()",
            details: "### Impact\n" +
                "\n" +
                "In express <4.20.0, passing untrusted user input - even after sanitizing it - to `response.redirect()` may execute untrusted code\n" +
                "\n" +
                "### Patches\n" +
                "\n" +
                "this issue is patched in express 4.20.0\n" +
                "\n" +
                "### Workarounds\n" +
                "\n" +
                "users are encouraged to upgrade to the patched version of express, but otherwise can workaround this issue by making sure any untrusted inputs are safe, ideally by validating them against an explicit allowlist\n" +
                "\n" +
                "### Details\n" +
                "\n" +
                "successful exploitation of this vector requires the following:\n" +
                "\n" +
                "1. The attacker MUST control the input to response.redirect()\n" +
                "1. express MUST NOT redirect before the template appears\n" +
                "1. the browser MUST NOT complete redirection before:\n" +
                "1. the user MUST click on the link in the template\n",
            aliases: ["CVE-2024-43796"],
            modified: "2024-11-18T16:27:11Z",
            published: "2024-09-10T19:41:04Z",
            related: ["CGA-8w92-879x-f9wc", "CGA-jq8v-jx6x-3fpc"],
            database_specific: {
                github_reviewed_at: "2024-09-10T19:41:04Z",
                github_reviewed: true,
                severity: "LOW",
                cwe_ids: ["CWE-79"],
                nvd_published_at: "2024-09-10T15:15:17Z",
            },
            references: [
                {
                    type: "WEB",
                    url: "https://github.com/expressjs/express/security/advisories/GHSA-qw6h-vgh9-j6wx",
                },
                {
                    type: "ADVISORY",
                    url: "https://nvd.nist.gov/vuln/detail/CVE-2024-43796",
                },
                {
                    type: "WEB",
                    url: "https://github.com/expressjs/express/commit/54271f69b511fea198471e6ff3400ab805d6b553",
                },
                {
                    type: "PACKAGE",
                    url: "https://github.com/expressjs/express",
                },
            ],
            affected: [
                {
                    package: [Object],
                    ranges: [Array],
                    database_specific: [Object],
                },
                {
                    package: [Object],
                    ranges: [Array],
                    database_specific: [Object],
                },
            ],
            schema_version: "1.6.0",
            severity: [
                {
                    type: "CVSS_V3",
                    score: "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:L/A:L",
                },
                {
                    type: "CVSS_V4",
                    score: "CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:P/VC:N/VI:N/VA:N/SC:L/SI:L/SA:L",
                },
            ],
        },
        {
            id: "GHSA-rv95-896h-c2vc",
            summary: "Express.js Open Redirect in malformed URLs",
            details: "### Impact\n" +
                "\n" +
                "Versions of Express.js prior to 4.19.2 and pre-release alpha and beta versions before 5.0.0-beta.3 are affected by an open redirect vulnerability using malformed URLs.\n" +
                "\n" +
                "When a user of Express performs a redirect using a user-provided URL Express performs an encode [using `encodeurl`](https://github.com/pillarjs/encodeurl) on the contents before passing it to the `location` header. This can cause malformed URLs to be evaluated in unexpected ways by common redirect allow list implementations in Express applications, leading to an Open Redirect via bypass of a properly implemented allow list.\n" +
                "\n" +
                "The main method impacted is `res.location()` but this is also called from within `res.redirect()`.\n" +
                "\n" +
                "### Patches\n" +
                "\n" +
                "https://github.com/expressjs/express/commit/0867302ddbde0e9463d0564fea5861feb708c2dd\n" +
                "https://github.com/expressjs/express/commit/0b746953c4bd8e377123527db11f9cd866e39f94\n" +
                "\n" +
                "An initial fix went out with `express@4.19.0`, we then patched a feature regression in `4.19.1` and added improved handling for the bypass in `4.19.2`.\n" +
                "\n" +
                "### Workarounds\n" +
                "\n" +
                "The fix for this involves pre-parsing the url string with either `require('node:url').parse` or `new URL`. These are steps you can take on your own before passing the user input string to `res.location` or `res.redirect`.\n" +
                "\n" +
                "### References\n" +
                "\n" +
                "https://github.com/expressjs/express/pull/5539\n" +
                "https://github.com/koajs/koa/issues/1800\n" +
                "https://expressjs.com/en/4x/api.html#res.location",
            aliases: ["CVE-2024-29041"],
            modified: "2024-03-25T22:24:57Z",
            published: "2024-03-25T19:40:26Z",
            related: [
                "CGA-5389-98xc-vr78",
                "CGA-w26h-h47r-f6rx",
                "CVE-2024-29041",
            ],
            database_specific: {
                github_reviewed_at: "2024-03-25T19:40:26Z",
                github_reviewed: true,
                severity: "MODERATE",
                cwe_ids: ["CWE-1286", "CWE-601"],
                nvd_published_at: "2024-03-25T21:15:46Z",
            },
            references: [
                {
                    type: "WEB",
                    url: "https://github.com/expressjs/express/security/advisories/GHSA-rv95-896h-c2vc",
                },
                {
                    type: "ADVISORY",
                    url: "https://nvd.nist.gov/vuln/detail/CVE-2024-29041",
                },
                {
                    type: "WEB",
                    url: "https://github.com/koajs/koa/issues/1800",
                },
                {
                    type: "WEB",
                    url: "https://github.com/expressjs/express/pull/5539",
                },
                {
                    type: "WEB",
                    url: "https://github.com/expressjs/express/commit/0867302ddbde0e9463d0564fea5861feb708c2dd",
                },
                {
                    type: "WEB",
                    url: "https://github.com/expressjs/express/commit/0b746953c4bd8e377123527db11f9cd866e39f94",
                },
                {
                    type: "WEB",
                    url: "https://expressjs.com/en/4x/api.html#res.location",
                },
                {
                    type: "PACKAGE",
                    url: "https://github.com/expressjs/express",
                },
            ],
            affected: [
                {
                    package: [Object],
                    ranges: [Array],
                    database_specific: [Object],
                },
                {
                    package: [Object],
                    ranges: [Array],
                    database_specific: [Object],
                },
            ],
            schema_version: "1.6.0",
            severity: [
                {
                    type: "CVSS_V3",
                    score: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N",
                },
            ],
        },
    ],
};

console.debug("This file is for testing purposes only. Don't mind it.");
console.debug(OVS_SAMPLE_RETURN);
