// todo - review code QL and all of this stuff before release, jsdoc and comments, var names, etc...
// ! this entire module has been uncommitted for a while, under active development and many iterations. it's still WIP, expect bugs and frequent changes.
import { APP_NAME } from "../constants.ts";
import { ColorString, LogStuff, ParseFlag } from "../functions/io.ts";
import { GetAllProjects, NameProject } from "../functions/projects.ts";
import { PerformAuditing } from "./toolkit/auditer.ts";
import type { FkNodeSecurityAudit } from "../types/audit.ts";

export default async function TheAuditer(project: string | null, strict: boolean) {
    try {
        if (strict) {
            await LogStuff(ColorString("Strict is not available yet.", "italic"));
        }

        const shouldAuditAll = project === null || project.trim() === "" || ParseFlag("all", true).includes(project) || project.trim() === "--";

        type reportType = {
            project: string;
            audit: FkNodeSecurityAudit;
        };

        if (shouldAuditAll) {
            const projects = await GetAllProjects();
            await LogStuff(
                `${APP_NAME.CASED} Audit is only supported for NPM projects as of now.`,
                "heads-up",
            );
            const report: reportType[] = [];
            for (const project of projects) {
                const res = await PerformAuditing(project);
                if (typeof res === "number") continue;
                report.push({
                    project: project,
                    audit: res,
                });
            }

            const reportDetails = await Promise.all(report.map(async (item) => {
                const name = await NameProject(item.project, "name-ver");
                const string = `${name} # ${ColorString(`${item.audit.percentage}%`, "bold")} risk factor`;
                return string;
            }));
            console.log("");
            await LogStuff(
                `Report (${ColorString(strict ? "strict" : "standard", "bold")})${
                    strict ? "" : ColorString(" Unsure about the results? Run with --strict (or -s) for stricter criteria", "italic")
                }:\n` + reportDetails.join("\n"),
                "chart",
            );
        } else {
            await PerformAuditing(project);
        }
    } catch (e) {
        throw e;
    }
}
