import type { tURL } from "../types/misc.ts"; /**
 * Fetches a resource using GitHub's headers.
 *
 * @export
 * @async
 * @param{tURL}url
 * @returns{Promise<Response>}
 */

export async function FetchGitHub(url: tURL): Promise<Response> {
    return await fetch(url, { headers: { Accept: "application/vnd.github.v3+json" } });
}
