/**
 * GitHub OAuth proxy for the Decap CMS admin (backend `github`, `base_url` = this Worker).
 *
 *   GET /auth      -> 302 to GitHub, with a random `state` kept in an HttpOnly cookie
 *   GET /callback  -> checks `state`, exchanges the code, then runs Decap's popup handshake:
 *                     the popup announces "authorizing:github", the admin window answers from its
 *                     own origin, and only an allow-listed origin receives the token.
 */

export type Env = {
  /** OAuth app client id (wrangler var; not secret). */
  GITHUB_CLIENT_ID: string;
  /** OAuth app client secret (`wrangler secret put GITHUB_CLIENT_SECRET`). */
  GITHUB_CLIENT_SECRET: string;
  /** Comma-separated origins allowed to receive the token, e.g. `https://example.com`. */
  ALLOWED_ORIGINS: string;
};

const PROVIDER = 'github';
const STATE_COOKIE = 'decap_oauth_state';
const STATE_MAX_AGE_SECONDS = 600;
/** Decap needs `repo` (or `public_repo` for a public repo); never anything wider. */
const ALLOWED_SCOPES = ['repo', 'public_repo'] as const;
const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

type Outcome =
  | { kind: 'success'; token: string }
  | { kind: 'error'; message: string; status: number };

export async function handleRequest(
  request: Request,
  env: Env,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  const url = new URL(request.url);
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }
  switch (url.pathname) {
    case '/auth':
      return startLogin(url, env);
    case '/callback':
      return renderOutcome(await finishLogin(request, url, env, fetchImpl), env);
    default:
      return new Response('Not found', { status: 404 });
  }
}

function buildCallbackUrl(url: URL): string {
  return `${url.origin}/callback`;
}

function startLogin(url: URL, env: Env): Response {
  if (url.searchParams.get('provider') !== PROVIDER) {
    return new Response('Unsupported provider', { status: 400 });
  }
  const requestedScope = url.searchParams.get('scope');
  const scope = ALLOWED_SCOPES.find((allowed) => allowed === requestedScope) ?? 'repo';
  const state = crypto.randomUUID();

  const authorizeUrl = new URL(GITHUB_AUTHORIZE_URL);
  authorizeUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set('redirect_uri', buildCallbackUrl(url));
  authorizeUrl.searchParams.set('scope', scope);
  authorizeUrl.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      location: authorizeUrl.toString(),
      'set-cookie': `${STATE_COOKIE}=${state}; Path=/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=${STATE_MAX_AGE_SECONDS}`,
      'cache-control': 'no-store',
    },
  });
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie') ?? '';
  for (const part of header.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) {
      return value.join('=');
    }
  }
  return null;
}

async function finishLogin(
  request: Request,
  url: URL,
  env: Env,
  fetchImpl: typeof fetch,
): Promise<Outcome> {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expectedState = readCookie(request, STATE_COOKIE);
  if (!code || !state || !expectedState || state !== expectedState) {
    return { kind: 'error', message: 'Invalid or expired login attempt', status: 400 };
  }

  const response = await fetchImpl(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'user-agent': 'portfolio-decap-auth',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: buildCallbackUrl(url),
    }),
  });
  const body: unknown = await response.json().catch(() => null);
  if (typeof body === 'object' && body !== null) {
    if ('access_token' in body && typeof body.access_token === 'string') {
      return { kind: 'success', token: body.access_token };
    }
    if ('error' in body && typeof body.error === 'string') {
      return { kind: 'error', message: body.error, status: 401 };
    }
  }
  return { kind: 'error', message: 'Unexpected response from GitHub', status: 502 };
}

/** JSON safe to inline in a <script>: no `<`, so the payload can never close the tag. */
function toScriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function renderOutcome(outcome: Outcome, env: Env): Response {
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  const message =
    outcome.kind === 'success'
      ? `authorization:${PROVIDER}:success:${JSON.stringify({ token: outcome.token, provider: PROVIDER })}`
      : `authorization:${PROVIDER}:error:${JSON.stringify({ message: outcome.message })}`;
  const nonce = crypto.randomUUID();

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Signing in…</title></head>
<body>
<p>${outcome.kind === 'success' ? 'Signed in. This window will close.' : 'Sign-in failed. You can close this window.'}</p>
<script nonce="${nonce}">
(function () {
  var allowed = ${toScriptJson(allowedOrigins)};
  var message = ${toScriptJson(message)};
  if (!window.opener) { return; }
  window.addEventListener('message', function receive(event) {
    if (allowed.indexOf(event.origin) === -1 || event.data !== 'authorizing:${PROVIDER}') { return; }
    window.removeEventListener('message', receive);
    window.opener.postMessage(message, event.origin);
    window.setTimeout(function () { window.close(); }, 100);
  });
  window.opener.postMessage('authorizing:${PROVIDER}', '*');
})();
</script>
</body>
</html>`;

  return new Response(html, {
    status: outcome.kind === 'success' ? 200 : outcome.status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'content-security-policy': `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'`,
      'set-cookie': `${STATE_COOKIE}=; Path=/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
      'cache-control': 'no-store',
      'referrer-policy': 'no-referrer',
    },
  });
}
