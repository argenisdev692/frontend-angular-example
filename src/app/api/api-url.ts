/**
 * Joins the configured API root URL with an endpoint path, normalizing slashes.
 * Centralizes the `(rootUrl || '').replace(/\/$/, '')` pattern that was duplicated
 * across auth/profile services so URL construction lives in exactly one place.
 *
 * @example joinApiUrl('https://api.example.com/', '/api/v1/auth/me')
 *          // -> 'https://api.example.com/api/v1/auth/me'
 */
export function joinApiUrl(rootUrl: string | null | undefined, path: string): string {
  const base = (rootUrl ?? '').replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}
