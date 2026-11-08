---
title: "Oracle APEX on OCI: Custom Domain & Custom OAuth with Cloudflare Workers"
summary: A comprehensive guide to running Oracle APEX on OCI Autonomous Database with a custom domain using Cloudflare Workers, including a robust workaround for OAuth 2.0 redirection issues.
publishedOn: 2025-12-19
tags:
  - cloudflare
  - oauth2
  - oci
  - oracle-apex
  - pl-sql
  - security
legacyWpId: 14
---
## Introduction

Running Oracle APEX on OCI Autonomous Database (ADB) Shared is a powerful, low-maintenance solution. However, it comes with a notorious limitation: **Vanity URLs**. By default, your application lives on a generated domain like `apex-original-domain`.

The official Oracle recommendation involves provisioning an OCI Load Balancer with a vanity certificate, which adds significant cost (approx. $20–30/month minimum) and complexity to what should be a simple deployment.

In this case study, I will demonstrate how we achieved a **zero-cost**, high-performance architecture using **Cloudflare Workers** as a smart reverse proxy. Furthermore, we will dive deep into a complex challenge that arises with this architecture: **handling OAuth 2.0 authentication** when the internal host does not match the external domain.

## Part 1: The Architecture

The goal is simple: the user accesses `https://app.yourdomain.com`, but the content is served from `https://...oraclecloudapps.com`, without the user ever knowing.

**The Challenges:**

1\. **Host Header Validation:** OCI imposes strict checks on the `Host` header.

2\. **Cookies:** APEX sets session cookies for the internal domain.

3\. **Absolute URLs:** APEX generates HTML with internal links that need rewriting.

4\. **OAuth Redirects:** Identity Providers (IdPs) require the `redirect_uri` to match the external domain, but APEX generates it based on the internal domain.

## Part 2: The Cloudflare Worker

The heart of this solution is a Cloudflare Worker acting as a man-in-the-middle. It does not simply forward requests; it aggressively rewrites headers and body content to perform a **full identity impersonation**.

Ideally, deploy this Worker on a route such as:

```
*app.yourdomain.com/*
```

## Production-Ready Worker Code

```javascript
/**
 * CLOUDFLARE WORKER - FULL IDENTITY IMPERSONATION
 * Strategy: Trick APEX into thinking the access is local/internal,
 * whilst translating everything to the public domain in real-time.
 */

const CONFIG = {
  // The "real" APEX URL from the OCI Console
  INTERNAL_HOST: "apex-original-domain",

  // The public vanity domain
  PUBLIC_HOST: "app.yourdomain.com"
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // -----------------------------------------------------------
    // 1. REQUEST (OUTBOUND): SOCIAL ENGINEERING ON APEX
    // -----------------------------------------------------------
    const targetUrl = new URL(request.url);
    targetUrl.hostname = CONFIG.INTERNAL_HOST;
    targetUrl.protocol = "https:";
    targetUrl.port = "";

    const reqHeaders = new Headers(request.headers);

    // A. Oracle requires the internal Host header
    reqHeaders.set("Host", CONFIG.INTERNAL_HOST);

    // B. Rewrite Origin and Referer for CSRF/CORS checks
    if (reqHeaders.has("Origin")) {
      reqHeaders.set(
        "Origin",
        reqHeaders.get("Origin").replace(CONFIG.PUBLIC_HOST, CONFIG.INTERNAL_HOST)
      );
    }

    if (reqHeaders.has("Referer")) {
      reqHeaders.set(
        "Referer",
        reqHeaders.get("Referer").replace(CONFIG.PUBLIC_HOST, CONFIG.INTERNAL_HOST)
      );
    }

    // C. Remove proxy fingerprints
    reqHeaders.delete("X-Forwarded-Host");
    reqHeaders.delete("X-Forwarded-Server");

    // Optional: forward real client IP
    const clientIP = request.headers.get("CF-Connecting-IP");
    if (clientIP) reqHeaders.set("X-Forwarded-For", clientIP);

    // -----------------------------------------------------------
    // 2. EXECUTION
    // -----------------------------------------------------------
    let response;
    try {
      response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: reqHeaders,
        body: ["GET", "HEAD"].includes(request.method)
          ? null
          : await request.arrayBuffer(),
        redirect: "manual"
      });
    } catch (e) {
      return new Response(`Connection Error with Oracle: ${e.message}`, {
        status: 502
      });
    }

    // -----------------------------------------------------------
    // 3. RESPONSE (INBOUND): TRANSLATION TO USER
    // -----------------------------------------------------------
    const respHeaders = new Headers(response.headers);

    // A. Remove security headers that break cross-domain rendering
    respHeaders.delete("Strict-Transport-Security");
    respHeaders.delete("Content-Security-Policy");
    respHeaders.delete("X-Frame-Options");
    respHeaders.delete("X-Content-Type-Options");

    // B. Rewrite redirects
    if (respHeaders.has("Location")) {
      respHeaders.set(
        "Location",
        respHeaders.get("Location").replace(CONFIG.INTERNAL_HOST, CONFIG.PUBLIC_HOST)
      );
    }

    // C. Cookie translation (critical for APEX sessions)
    const setCookies = response.headers.getAll("Set-Cookie");
    if (setCookies.length > 0) {
      respHeaders.delete("Set-Cookie");
      setCookies.forEach(cookie => {
        let rewritten = cookie.replace(
          new RegExp(CONFIG.INTERNAL_HOST, "g"),
          CONFIG.PUBLIC_HOST
        );

        if (!rewritten.includes("Domain=")) {
          rewritten += `; Domain=${CONFIG.PUBLIC_HOST}`;
        }
        if (!rewritten.includes("Secure")) rewritten += "; Secure";
        if (!rewritten.includes("HttpOnly")) rewritten += "; HttpOnly";
        if (!rewritten.includes("SameSite")) rewritten += "; SameSite=Lax";

        respHeaders.append("Set-Cookie", rewritten);
      });
    }

    // -----------------------------------------------------------
    // 4. BODY REWRITE
    // -----------------------------------------------------------
    const contentType = respHeaders.get("Content-Type") || "";

    if (
      contentType.includes("text/html") ||
      contentType.includes("application/json") ||
      contentType.includes("javascript")
    ) {
      const bodyText = await response.text();
      const regex = new RegExp(CONFIG.INTERNAL_HOST.replace(/./g, "\."), "g");
      const rewrittenBody = bodyText.replace(regex, CONFIG.PUBLIC_HOST);

      respHeaders.delete("Content-Length");

      return new Response(rewrittenBody, {
        status: response.status,
        headers: respHeaders
      });
    }

    // Binary content
    return new Response(response.body, {
      status: response.status,
      headers: respHeaders
    });
  }
};
```

## Part 3: The OAuth 2.0 Challenge

The Worker above works perfectly for standard APEX authentication. However, when introducing OAuth 2.0 (Google, Microsoft, etc.), a critical issue appears.

## The Problem

APEX generates the OAuth `redirect_uri` using the **internal** hostname, because the Worker convinces APEX that it is running locally. Identity Providers reject this because `oraclecloudapps.com` is not allowed in the redirect allowlist.

Forcing the external URL breaks APEX’s internal session validation, resulting in infinite redirects or \*Invalid Session\* errors.

## The Solution

We abandoned the declarative APEX authentication scheme and implemented a **manual OAuth flow in PL/SQL**, giving us full control over:

\* `redirect_uri`

\* Token exchange

\* Session creation

## Part 4: Manual OAuth with PL/SQL

## 1\. Authentication Package (PCK\_AUTH\_SSM)

```sql
create or replace PACKAGE BODY pck_auth_ssm AS

    c_client_id      CONSTANT VARCHAR2(1000) := 'YOUR_CLIENT_ID';
    c_client_secret  CONSTANT VARCHAR2(1000) := 'YOUR_CLIENT_SECRET';
    c_public_host    CONSTANT VARCHAR2(100)  := 'https://app.yourdomain.com';
    c_callback_uri   CONSTANT VARCHAR2(200)  := c_public_host || '/ords/r/workspace/app/callback';

    c_token_endpoint CONSTANT VARCHAR2(200) := 'https://idp.provider.com/oauth/token';
    c_user_endpoint  CONSTANT VARCHAR2(200) := 'https://idp.provider.com/api/userinfo';

    FUNCTION get_login_url RETURN VARCHAR2 IS
    BEGIN
        RETURN 'https://idp.provider.com/oauth/authorize'
            || '?response_type=code'
            || '&client_id=' || c_client_id
            || '&redirect_uri=' || apex_util.url_encode(c_callback_uri)
            || '&scope=openid profile email';
    END;

    PROCEDURE process_callback(p_code IN VARCHAR2) IS
        l_response      CLOB;
        l_token         VARCHAR2(32767);
        l_json          JSON_OBJECT_T;
        l_email         VARCHAR2(255);

        l_names  apex_application_global.vc_arr2;
        l_values apex_application_global.vc_arr2;
    BEGIN
        apex_web_service.g_request_headers.delete();
        apex_web_service.g_request_headers(1).name  := 'Content-Type';
        apex_web_service.g_request_headers(1).value := 'application/x-www-form-urlencoded';

        l_names(1) := 'grant_type';    l_values(1) := 'authorization_code';
        l_names(2) := 'client_id';     l_values(2) := c_client_id;
        l_names(3) := 'client_secret'; l_values(3) := c_client_secret;
        l_names(4) := 'redirect_uri';  l_values(4) := c_callback_uri;
        l_names(5) := 'code';          l_values(5) := p_code;

        l_response := apex_web_service.make_rest_request(
            p_url         => c_token_endpoint,
            p_http_method => 'POST',
            p_parm_name   => l_names,
            p_parm_value  => l_values
        );

        l_json  := JSON_OBJECT_T.parse(l_response);
        l_token := l_json.get_string('access_token');

        apex_web_service.g_request_headers.delete();
        apex_web_service.g_request_headers(1).name  := 'Authorization';
        apex_web_service.g_request_headers(1).value := 'Bearer ' || l_token;

        l_response := apex_web_service.make_rest_request(
            p_url         => c_user_endpoint,
            p_http_method => 'GET'
        );

        l_json  := JSON_OBJECT_T.parse(l_response);
        l_email := substr(l_json.get_string('email'), 1, 255);

        apex_authentication.login(
            p_username           => l_email,
            p_password           => 'EXTERNAL_OAUTH_TOKEN',
            p_uppercase_username => TRUE
        );
    END;
END;
/
```

## 2\. Callback Page (Public)

A public APEX page (e.g., Page 1000) with alias `callback` receives the `?code=` parameter.

**Before Header Process:**

```sql
DECLARE
    v_code_temp VARCHAR2(32767);
BEGIN
    v_code_temp := :CODE;

    IF v_code_temp IS NOT NULL THEN
        :CODE := NULL;
        pck_auth_ssm.process_callback(p_code => v_code_temp);
    END IF;
END;
```

## 3\. Authentication Scheme

Authentication Function:

```sql
FUNCTION auth_inline (
    p_username in varchar2,
    p_password in varchar2
) return boolean is
BEGIN
    return true;
END;
```

## Conclusion

By combining **Cloudflare Workers** for domain impersonation and **manual PL/SQL OAuth handling**, we successfully bypassed OCI ADB Shared limitations.

**This architecture delivers:**

\* Zero infrastructure cost

\* Professional vanity domains

\* Fully controlled OAuth flows

\* Stable APEX sessions

All without OCI Load Balancers, network hacks, or unsupported configurations.
