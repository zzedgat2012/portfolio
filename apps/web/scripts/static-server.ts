import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';

/** A throwaway server for `out/`, used only while the postbuild steps run. */
export type StaticServer = {
  /** `http://127.0.0.1:<port>`, no trailing slash. */
  origin: string;
  close: () => Promise<void>;
};

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
};

const DEFAULT_CONTENT_TYPE = 'application/octet-stream';
const INDEX_FILE = 'index.html';
const LOOPBACK = '127.0.0.1';

/** MIME type of a served file, from its extension. */
export function toContentType(filePath: string): string {
  return CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? DEFAULT_CONTENT_TYPE;
}

/**
 * File under `rootDir` for a request URL (`/cv/` → `cv/index.html`), or `null` when the URL
 * is malformed or escapes the root.
 */
export function resolveStaticFilePath(rootDir: string, requestUrl: string): string | null {
  const [pathname = '/'] = requestUrl.split(/[?#]/);
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const root = path.resolve(rootDir);
  const filePath = path.resolve(root, `.${decoded}`);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    return null;
  }
  return decoded.endsWith('/') ? path.join(filePath, INDEX_FILE) : filePath;
}

async function findServableFile(filePath: string): Promise<string | null> {
  const stats = await stat(filePath).catch(() => null);
  if (stats?.isFile()) {
    return filePath;
  }
  if (stats?.isDirectory()) {
    return findServableFile(path.join(filePath, INDEX_FILE));
  }
  return null;
}

/** Serves `rootDir` read-only (GET/HEAD) on an ephemeral loopback port. */
export async function startStaticServer(rootDir: string): Promise<StaticServer> {
  const server = createServer(async (request, response) => {
    const candidate = resolveStaticFilePath(rootDir, request.url ?? '/');
    const filePath = candidate === null ? null : await findServableFile(candidate);
    if (filePath === null) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
      return;
    }
    response.writeHead(200, { 'content-type': toContentType(filePath) });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    createReadStream(filePath).pipe(response);
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, LOOPBACK, () => resolve());
  });
  const { port } = server.address() as AddressInfo;

  return {
    origin: `http://${LOOPBACK}:${port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  };
}
