import 'server-only';
import { CmsUnavailableError } from '@portfolio/contracts';
import qs from 'qs';

const CMS_URL = process.env.CMS_URL;
const CMS_TOKEN = process.env.CMS_TOKEN;

/**
 * Server-only CMS client. Reads the read-only API token from process.env
 * (never exposed to the client bundle via VITE_* / NEXT_PUBLIC_*).
 */
export async function cmsGet<T>(path: string, query: object = {}): Promise<T> {
  const url = `${CMS_URL}/api/${path}?${qs.stringify(query, { encodeValuesOnly: true })}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${CMS_TOKEN}` },
  });
  if (!res.ok) {
    throw new CmsUnavailableError(res.status, path);
  }
  return (await res.json()) as T;
}
