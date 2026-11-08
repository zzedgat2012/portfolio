/** A server-side redirect (`content/settings/redirects.yml`), written to `out/_redirects`. */
export type Redirect = {
  from: string;
  to: string;
  status: 301 | 302;
};
