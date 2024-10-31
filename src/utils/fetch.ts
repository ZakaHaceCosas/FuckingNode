import type { tURL } from "../types.ts";

export async function FetchGitHub(url: tURL): Promise<Response> {
    return await fetch(url, {
        headers: { Accept: "application/vnd.github.v3+json" },
    });
}
