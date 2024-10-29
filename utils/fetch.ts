import type { tURL } from "../src/types.ts";

export async function FetchGitHub(url: tURL): Promise<Response> {
    return await fetch(url, {
        headers: { Accept: "application/vnd.github.v3+json" },
    });
}
