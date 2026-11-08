import { AppError } from '@portfolio/contracts';
import { toWpSnapshot, WP_REST_ENDPOINTS, type WpRestName, type WpSnapshot } from './wp-schemas';

export type FetchFn = (url: string) => Promise<Response>;

const PAGE_SIZE = 100;

async function fetchOk(fetchFn: FetchFn, url: string): Promise<Response> {
  const response = await fetchFn(url);
  if (!response.ok) {
    throw new AppError(`GET ${url} answered ${response.status}`, 'SOURCE_UNAVAILABLE');
  }
  return response;
}

/** Every item of a paginated collection endpoint. */
async function listAll(fetchFn: FetchFn, url: string): Promise<unknown[]> {
  const items: unknown[] = [];
  for (let page = 1; ; page += 1) {
    const response = await fetchOk(fetchFn, `${url}?per_page=${PAGE_SIZE}&page=${page}`);
    const body: unknown = await response.json();
    if (!Array.isArray(body)) {
      throw new AppError(`GET ${url} did not return a list`, 'SOURCE_UNAVAILABLE');
    }
    items.push(...body);
    const totalPages = Number(response.headers.get('x-wp-totalpages') ?? '1');
    if (page >= totalPages) {
      return items;
    }
  }
}

/** Reads the live WordPress site: REST payloads, then the rendered pages of every entry. */
export async function fetchSnapshot(
  baseUrl: string,
  fetchFn: FetchFn = fetch,
): Promise<WpSnapshot> {
  const origin = new URL(baseUrl).origin;
  const fetchText = async (url: string) => (await fetchOk(fetchFn, url)).text();
  const names = Object.keys(WP_REST_ENDPOINTS) as WpRestName[];
  const rest = Object.fromEntries(
    await Promise.all(
      names.map(async (name) => {
        const url = `${origin}${WP_REST_ENDPOINTS[name]}`;
        const payload: unknown =
          name === 'root'
            ? await (await fetchOk(fetchFn, url)).json()
            : await listAll(fetchFn, url);
        return [name, payload] as const;
      }),
    ),
  ) as Record<WpRestName, unknown>;

  // Validate first so the page links below are known to be URLs.
  const partial = toWpSnapshot({ rest, homeHtml: '', projectHtml: {}, articleHtml: {} });
  const readPages = async (entries: ReadonlyArray<{ slug: string; link: string }>) =>
    Object.fromEntries(
      await Promise.all(
        entries.map(async ({ slug, link }) => {
          if (new URL(link).origin !== origin) {
            throw new AppError(`${slug}: link ${link} is not on ${origin}`, 'SOURCE_UNAVAILABLE');
          }
          return [slug, await fetchText(link)] as const;
        }),
      ),
    );

  return {
    ...partial,
    homeHtml: await fetchText(`${origin}/`),
    projectHtml: await readPages(partial.projects),
    articleHtml: await readPages(partial.posts),
  };
}

/** Downloads one media file. */
export async function downloadMedia(url: string, fetchFn: FetchFn = fetch): Promise<Uint8Array> {
  return new Uint8Array(await (await fetchOk(fetchFn, url)).arrayBuffer());
}
