import { APP_NAME } from "../constants.ts";
import { ColorString, LogStuff, ParseFlag } from "../functions/io.ts";
import { GetAllProjects, NameProject } from "../functions/projects.ts";
import { PerformAuditing } from "./toolkit/auditer.ts";
import type { FkNodeSecurityAudit } from "../types/audit.ts";
import type { TheAuditerConstructedParams } from "./constructors/command.ts";
import { StringUtils } from "@zakahacecosas/string-utils";

export default async function TheAuditer(params: TheAuditerConstructedParams) {
    const { project, strict } = params;

    const shouldAuditAll = !StringUtils.validate(project) || ParseFlag("all", true).includes(project) || StringUtils.normalize(project) === "--";

    if (shouldAuditAll) {
        const projects = await GetAllProjects();
        await LogStuff(
            `${APP_NAME.CASED} Audit is only supported for NodeJS projects as of now.`,
            "heads-up",
        );
        const report: {
            project: string;
            audit: FkNodeSecurityAudit;
        }[] = [];
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
        if (reportDetails.length > 0) {
            await LogStuff(
                `Report (${ColorString(strict ? "strict" : "standard", "bold")})\n${reportDetails.join("\n")}${
                    strict ? "" : `\n${ColorString("Unsure about the results? Run with --strict (or -s) for stricter criteria", "italic")}\n`
                }`,
                "chart",
            );
        } else {
            await LogStuff("Not a single project has security issues. Great!\n", "tick");
        }
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
}
