---
trigger: always_on
---

# OWASP Frontend Security Baseline — Angular 21 (2026)

> **Authority**: SINGLE SOURCE OF TRUTH for all frontend security decisions in this project.
> **Sources**: OWASP Top 10:2025 (Web), OWASP ASVS v4.0.3, OWASP Secure Headers Project.
> **Scope**: Browser-side security, CSP, auth flows, XSS prevention, CSRF, secrets management, dependency security.
> **Remember**: The frontend is NOT a security boundary — real enforcement is on the API server. These rules minimize attack surface and prevent client-side exploitation.
>
> **Project reality**: this app uses an **in-memory JWT** model (`TokenStorageService` holds the access token in a signal — never `localStorage`/`sessionStorage`), attached by a **functional** interceptor (`authInterceptor`) with silent refresh on 401. Examples below reflect that model.

---

## 1. Cross-Site Scripting (XSS) Prevention

- **Angular auto-escapes by default** — NEVER bypass with `DomSanitizer.bypassSecurityTrust*` unless absolutely necessary.
- If bypassing is unavoidable, ALWAYS sanitize with DOMPurify first.
- NEVER render user input inside `[innerHTML]` without sanitization.
- NEVER use `document.write()`, `innerHTML`, or `outerHTML` with user-controlled data.
- NEVER construct URLs from user input without validation — use the `URL` constructor + allowlist.

```typescript
// ✅ CORRECT — inject() + sanitized HTML (dompurify ^3 is installed)
import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Component({ /* ... */ })
export class ArticleComponent {
  private sanitizer = inject(DomSanitizer);

  getSafeHtml(html: string) {
    const clean = DOMPurify.sanitize(html);
    return this.sanitizer.bypassSecurityTrustHtml(clean);
  }
}

// ❌ FORBIDDEN — raw user HTML, and ❌ constructor injection
// this.sanitizer.bypassSecurityTrustHtml(userInput);
```

---

## 2. Content Security Policy (CSP) & Security Headers

**CSP and security headers are RESPONSE headers — they MUST be set by the server / edge / SSR layer, NEVER by an Angular HTTP interceptor.** An interceptor sets *request* headers, which has zero security effect for CSP/HSTS/X-Frame-Options.

Set them where responses are produced:

- **SSR (this app uses `@angular/ssr` + Express)** — set headers on the Express response:

```typescript
// server.ts (Express) — applies to the served HTML document
app.use((_req, res, next) => {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' blob: data: https:; connect-src 'self' https: wss:; " +
    "frame-ancestors 'none'; form-action 'self'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests;");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  next();
});
```

- **Static/CDN hosting** — configure the same headers at the edge (host config, `_headers`, reverse proxy).
- Avoid `'unsafe-inline'` in `script-src`. Angular's build emits hashable/externalized scripts; use nonces/hashes if inline is unavoidable.
- Do NOT add the obsolete `X-XSS-Protection` header (deprecated; a strong CSP replaces it).

---

## 3. Authentication & Session Security

Two acceptable models — pick one and be consistent. **This project uses Model A.**

- **Model A — In-memory access token (current):** store the access token in a `signal`-backed service (`TokenStorageService`), attach it via the functional interceptor, refresh on 401. Never persist it to `localStorage`/`sessionStorage`. Refresh token should live in an **HttpOnly, Secure, SameSite=Lax** cookie set by the backend.
- **Model B — Pure HttpOnly cookies:** backend sets HttpOnly cookies; the browser sends them automatically and the frontend never reads or attaches tokens manually.

Rules:
- NEVER store any JWT in `localStorage`/`sessionStorage`.
- NEVER expose tokens to templates — read them only inside services/interceptors.
- NEVER trust client-side permission checks as security — they are UX hints; the API enforces authorization.
- Password reset tokens MUST be single-use and time-limited (backend), and the backend MUST return 200 regardless of email existence (prevents user enumeration).

```typescript
// ✅ CORRECT — functional interceptor, in-memory token, no `any`
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '...';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenStorageService).getAccessToken();
  const outgoing = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(outgoing);
};

// ❌ FORBIDDEN — class-based interceptor, `any`, and localStorage tokens
// localStorage.setItem('token', response.accessToken);
```

---

## 4. Cross-Site Request Forgery (CSRF)

- For cookie-based auth, enable Angular's built-in protection with `withXsrfConfiguration()` in `provideHttpClient`.
- Backend sets a readable `XSRF-TOKEN` cookie; Angular echoes it in `X-XSRF-TOKEN`.
- Use `SameSite=Lax` (or `Strict` for sensitive actions) — avoid `SameSite=None` unless cross-site is required.
- NEVER use GET for state mutations — always POST/PATCH/PUT/DELETE.

```typescript
// app.config.ts
provideHttpClient(
  withFetch(),
  withInterceptors([authInterceptor]),
  withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' })
)
```

> Note: a Bearer-token (in-memory) request model is not vulnerable to classic cookie-CSRF, since the token isn't sent automatically. Enable XSRF config only if/when cookie auth is used.

---

## 5. Environment Variables & Secrets

- **Server-only secrets** (DB URLs, private API keys): never reach the client bundle.
- **Client-exposed values** (API base URL): build-time env, embedded in the bundle — assume public.
- This app reads `NG_APP_API_BASE_URL` from `import.meta.env` with a typed, `any`-free accessor (see `app.config.ts`); validate it at startup.
- NEVER commit `.env.local`. Provide `.env.example` with placeholders. `.env*` is denied to tooling in `settings.json`.

---

## 6. Open Redirect Prevention

- NEVER redirect to user-supplied URLs without validation.
- Use Angular Router with hardcoded paths. The stored `intended_url` (post-login redirect) MUST be validated against an internal-path allowlist before navigating.

```typescript
const ALLOWED = new Set(['/dashboard', '/profile', '/settings']);
const target = redirectUrl ?? '/dashboard';
this.router.navigateByUrl(ALLOWED.has(target) ? target : '/dashboard');
```

---

## 7. Dependency Security

- Use a committed lockfile (`package-lock.json`) — npm only (no pnpm/yarn).
- Run `npm audit` in CI on every PR; block on critical/high.
- Keep Angular and PrimeNG on the latest patched versions (Angular >= 21).
- Review changelogs before major upgrades.

---

## 8. Information Disclosure Prevention

- NEVER expose stack traces, internal error messages, or server paths to the client.
- A global `ErrorHandler` shows user-friendly messages; it must not surface `error.stack`/server `error.message`.
- NEVER log tokens, passwords, cookies, or headers to the console. NEVER use `console.log` in production code.

```typescript
import { ErrorHandler, Injectable, inject } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private notify = inject(NotificationService);
  handleError(_error: unknown): void {
    this.notify.showError('Something went wrong'); // generic to user
    // report `_error` to a monitoring service here, not the console
  }
}
```

---

## 9. Secure Data Fetching

- The functional interceptor attaches auth automatically — NEVER pass tokens manually at call sites.
- NEVER fetch from URLs built from raw user input (browser-side SSRF).
- Types from `ng-openapi-gen` give compile-time safety but NOT runtime guarantees. For data crossing trust boundaries (auth responses, anything rendered as HTML, money/permissions), validate the runtime shape with **Zod** (`zod ^4` is installed) before use.
- Set request timeouts — NEVER allow infinite waits. NEVER log bodies with sensitive data.

---

## 10. Image & File Upload Security

- Validate file type, size, and dimensions on client AND server.
- Use `NgOptimizedImage` for static images.
- Add allowed image domains to the CSP `img-src`.

---

## 11. Rate Limiting & Abuse Prevention

- Rate-limit auth endpoints on the API; add client-side debounce on login/search.
- Disable submit buttons during the `isLoading` signal — prevent double submission.
- Confirmation dialogs before destructive actions (delete, suspend, revoke).

---

## 12. WebSocket Security

- Authenticate during the handshake — no unauthenticated WS.
- Validate all incoming WS payloads — don't trust server data blindly.
- Use `wss://` in production; reconnect with exponential backoff.

---

## 13. Functional Interceptors (Security)

- Use `HttpInterceptorFn` — never class-based `HttpInterceptor`.
- Skip token attachment for non-API and auth endpoints (login/refresh/logout) as `authInterceptor` already does.
- On 401, refresh once and retry; on refresh failure, store a validated `intended_url` and log out.
- NEVER leak internal error details from the interceptor.

---

## 14. Third-Party Script Security

- Load third-party scripts via Angular mechanisms — no inline `<script>`.
- Pin versions — never `latest` from a CDN.
- Add third-party domains to CSP `script-src` explicitly.

---

## Repository Enforcement Rules

- Set CSP + security headers at the **server/SSR/edge** layer — NEVER via an HTTP request interceptor.
- Keep access tokens **in memory** (signal service) — NEVER `localStorage`/`sessionStorage`.
- Use **functional** interceptors (`HttpInterceptorFn`) and `inject()` — never class-based interceptors or constructor injection.
- NEVER use `any` / `@ts-ignore` / `as any` — use `unknown` and narrow.
- Sanitize with DOMPurify (`dompurify ^3`, installed) before any `[innerHTML]`.
- Validate runtime shapes for trust-boundary data with Zod (`zod ^4`, installed) even with generated types.
- Validate redirects against an internal allowlist.
- Show user-friendly errors; never expose stack traces or server internals; no `console.log` in production.
- Use `NgOptimizedImage` for static images; keep Angular/PrimeNG patched.
