// todo - review code QL and all of this stuff before release, jsdoc and comments, var names, etc...
// ! this entire module has been uncommitted for a while, under active development and many iterations. it's still WIP, expect bugs and frequent changes.
import { APP_NAME } from "../constants.ts";
import { ColorString, LogStuff, ParseFlag } from "../functions/io.ts";
import { GetAllProjects, NameProject } from "../functions/projects.ts";
import { PerformAuditing } from "./toolkit/auditer.ts";
import type { FkNodeSecurityAudit } from "../types/audit.ts";

export default async function TheAuditer(project: string | null, strict: boolean) {
    try {
        const shouldAuditAll = project === null || project.trim() === "" || ParseFlag("all", true).includes(project) || project.trim() === "--";

        type reportType = {
            project: string;
            audit: FkNodeSecurityAudit;
        };

        if (shouldAuditAll) {
            const projects = await GetAllProjects();
            await LogStuff(
                `${APP_NAME.CASED} Audit is only supported for npm projects as of now.`,
                "heads-up",
            );
            const report: reportType[] = [];
            for (const project of projects) {
                const res = await PerformAuditing(project, strict);
                if (typeof res === "number") continue;
                report.push({
                    project: project,
                    audit: res,
                });
            }

            const reportDetails = await Promise.all(report.map(async (item) => {
                const name = await NameProject(item.project, "name-ver");
                const string = `${name} # ${ColorString(`${item.audit.percentage.toFixed(2)}%`, "bold")} risk factor`;
                return string;
            }));
            console.log("");
            await LogStuff(
                `Report (${ColorString(strict ? "strict" : "standard", "bold")})\n${reportDetails.join("\n")}${
                    strict ? "" : "\n"+ColorString("Unsure about the results? Run with --strict (or -s) for stricter criteria", "italic")
                }`,
                "chart",
            );
        } else {
            await PerformAuditing(project, strict);
        }

        await LogStuff("Audit complete!", "tick-clear");
        await LogStuff(
            ColorString(
                "Keep in mind our report simply can't be 100% accurate - the best option is always to fix vulnerabilities.",
                "italic",
            ),
            "heads-up",
        );
    } catch (e) {
        throw e;
    }
}
