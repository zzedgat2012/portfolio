import { describe, expect, test, vi } from 'vitest';
import { type Env, handleRequest } from './handle-request';

const ENV: Env = {
  GITHUB_CLIENT_ID: 'client-id',
  GITHUB_CLIENT_SECRET: 'client-secret',
  ALLOWED_ORIGINS: 'https://portfolio.example.com, http://localhost:3000',
};
const BASE = 'https://decap-auth.example.workers.dev';

function tokenResponse(body: object) {
  return vi.fn<typeof fetch>().mockResolvedValue(Response.json(body));
}

function stateCookie(response: Response): string {
  const cookie = response.headers.get('set-cookie') ?? '';
  return /decap_oauth_state=([^;]+)/.exec(cookie)?.[1] ?? '';
}

async function startLogin(query = '?provider=github&scope=repo') {
  return handleRequest(new Request(`${BASE}/auth${query}`), ENV, tokenResponse({}));
}

describe('GET /auth', () => {
  test('redirects to GitHub with the client id, callback, repo scope and a state', async () => {
    const response = await startLogin();

    expect(response.status).toBe(302);
    const location = new URL(response.headers.get('location') ?? '');
    expect(location.origin + location.pathname).toBe('https://github.com/login/oauth/authorize');
    expect(location.searchParams.get('client_id')).toBe('client-id');
    expect(location.searchParams.get('redirect_uri')).toBe(`${BASE}/callback`);
    expect(location.searchParams.get('scope')).toBe('repo');
    expect(location.searchParams.get('state')).toBe(stateCookie(response));
    expect(stateCookie(response)).toMatch(/^[0-9a-f-]{36}$/);
  });

  test('keeps the state in an HttpOnly, Secure, short-lived cookie', async () => {
    const cookie = (await startLogin()).headers.get('set-cookie') ?? '';

    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Max-Age=600');
  });

  test('never widens the scope beyond repo', async () => {
    const response = await startLogin('?provider=github&scope=repo,admin:org');
    const location = new URL(response.headers.get('location') ?? '');

    expect(location.searchParams.get('scope')).toBe('repo');
  });

  test('rejects providers other than GitHub', async () => {
    expect((await startLogin('?provider=gitlab')).status).toBe(400);
  });
});

describe('GET /callback', () => {
  async function callback(query: string, cookie: string, fetchImpl: typeof fetch) {
    const request = new Request(`${BASE}/callback${query}`, { headers: { cookie } });
    return handleRequest(request, ENV, fetchImpl);
  }

  test('exchanges the code and hands the token only to allow-listed origins', async () => {
    const fetchImpl = tokenResponse({ access_token: 'gho_secret', token_type: 'bearer' });

    const response = await callback('?code=the-code&state=s-1', 'decap_oauth_state=s-1', fetchImpl);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0] ?? [];
    expect(String(url)).toBe('https://github.com/login/oauth/access_token');
    expect(JSON.parse(String(init?.body))).toEqual({
      client_id: 'client-id',
      client_secret: 'client-secret',
      code: 'the-code',
      redirect_uri: `${BASE}/callback`,
    });
    expect(html).toContain('authorization:github:success:');
    expect(html).toContain('gho_secret');
    expect(html).toContain('"https://portfolio.example.com","http://localhost:3000"');
    expect(html).not.toContain('client-secret');
  });

  test('clears the state cookie and locks the page down with a CSP nonce', async () => {
    const response = await callback(
      '?code=c&state=s-1',
      'decap_oauth_state=s-1',
      tokenResponse({ access_token: 't' }),
    );
    const csp = response.headers.get('content-security-policy') ?? '';
    const nonce = /'nonce-([^']+)'/.exec(csp)?.[1];

    expect(response.headers.get('set-cookie')).toContain('Max-Age=0');
    expect(csp).toContain("default-src 'none'");
    expect(nonce).toBeTruthy();
    expect(await response.text()).toContain(`<script nonce="${nonce}">`);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  test('refuses a state that does not match the cookie, without calling GitHub', async () => {
    const fetchImpl = tokenResponse({ access_token: 'never' });

    const response = await callback('?code=c&state=forged', 'decap_oauth_state=s-1', fetchImpl);

    expect(response.status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(await response.text()).toContain('authorization:github:error:');
  });

  test('refuses a callback without a state cookie', async () => {
    const response = await callback('?code=c&state=s-1', '', tokenResponse({}));

    expect(response.status).toBe(400);
  });

  test('reports GitHub errors to the admin window without a token', async () => {
    const response = await callback(
      '?code=c&state=s-1',
      'decap_oauth_state=s-1',
      tokenResponse({ error: 'bad_verification_code' }),
    );
    const html = await response.text();

    expect(response.status).toBe(401);
    expect(html).toContain('authorization:github:error:');
    expect(html).toContain('bad_verification_code');
  });

  test('escapes the token payload so it cannot close the script tag', async () => {
    const response = await callback(
      '?code=c&state=s-1',
      'decap_oauth_state=s-1',
      tokenResponse({ access_token: '</script><script>alert(1)</script>' }),
    );

    expect(await response.text()).not.toContain('</script><script>alert(1)');
  });
});

test('answers 404 for any other path', async () => {
  const response = await handleRequest(new Request(`${BASE}/other`), ENV, tokenResponse({}));

  expect(response.status).toBe(404);
});
