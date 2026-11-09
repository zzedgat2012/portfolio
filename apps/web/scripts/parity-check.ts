// Story 3.1 AC6: every URL of the old WordPress sitemap must answer 200, or a 301/308 to a 200.
// Pure logic with an injected fetch; the CLI is scripts/verify-parity.ts.

/** The part of `fetch` the check needs (redirects are followed by hand). */
export type FetchLike = (
  url: string,
  init: { redirect: 'manual' },
) => Promise<{ status: number; headers: { get(name: string): string | null } }>;

export type ParityHop = { url: string; status: number };

export type ParityResult = {
  path: string;
  isOk: boolean;
  hops: ParityHop[];
  reason?: string;
};

export const MAX_REDIRECTS = 2;

const PERMANENT_REDIRECTS: ReadonlySet<number> = new Set([301, 308]);

/** Paths of `legacy-urls.txt`: one per line; blank lines and `#` comments are ignored. */
export function parseLegacyPaths(text: string): string[] {
  return text.split('\n').flatMap((rawLine, index) => {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) {
      return [];
    }
    if (!line.startsWith('/')) {
      throw new Error(`line ${index + 1}: "${line}" is not a path`);
    }
    return [line];
  });
}

function failure(path: string, hops: ParityHop[], reason: string): ParityResult {
  return { path, isOk: false, hops, reason };
}

/** Fetches `path` on `baseUrl`, following at most two permanent redirects. */
export async function checkPath(
  baseUrl: string,
  path: string,
  fetchFn: FetchLike,
): Promise<ParityResult> {
  const hops: ParityHop[] = [];
  let url = new URL(path, baseUrl).href;
  for (let redirects = 0; ; redirects += 1) {
    let response: Awaited<ReturnType<FetchLike>>;
    try {
      response = await fetchFn(url, { redirect: 'manual' });
    } catch (error) {
      return failure(path, hops, error instanceof Error ? error.message : String(error));
    }
    hops.push({ url, status: response.status });
    if (response.status === 200) {
      return { path, isOk: true, hops };
    }
    if (!PERMANENT_REDIRECTS.has(response.status)) {
      return failure(path, hops, `answered ${response.status}`);
    }
    const location = response.headers.get('location');
    if (location === null) {
      return failure(path, hops, `${response.status} without Location`);
    }
    if (redirects === MAX_REDIRECTS) {
      return failure(path, hops, `more than ${MAX_REDIRECTS} redirects`);
    }
    url = new URL(location, url).href;
  }
}

/** Checks every path, one after the other (a handful of URLs; keeps the server log readable). */
export async function checkParity(
  baseUrl: string,
  paths: readonly string[],
  fetchFn: FetchLike,
): Promise<ParityResult[]> {
  const results: ParityResult[] = [];
  for (const path of paths) {
    results.push(await checkPath(baseUrl, path, fetchFn));
  }
  return results;
}

function describeHops(hops: readonly ParityHop[]): string {
  return hops
    .map((hop, index) =>
      index === 0 ? `${hop.status}` : `${new URL(hop.url).pathname} ${hop.status}`,
    )
    .join(' → ');
}

/** A plain-text table, one row per path, and a summary line. */
export function formatParityReport(results: readonly ParityResult[]): string {
  const width = Math.max(4, ...results.map((result) => result.path.length));
  const rows = results.map((result) =>
    [
      (result.isOk ? 'OK' : 'FAIL').padEnd(4),
      result.path.padEnd(width),
      describeHops(result.hops) || '-',
      ...(result.reason === undefined ? [] : [result.reason]),
    ].join('  '),
  );
  const failed = results.filter((result) => !result.isOk).length;
  return [
    ...rows,
    '',
    `${results.length - failed} of ${results.length} URLs OK, ${failed} failed`,
  ].join('\n');
}
