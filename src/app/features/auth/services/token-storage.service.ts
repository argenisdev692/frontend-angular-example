import { Injectable, computed, signal } from '@angular/core';

/**
 * Holds auth tokens IN MEMORY ONLY (signals) — never localStorage/sessionStorage.
 * The backend uses a body-based (Bearer) refresh scheme, so the refresh token lives
 * here too. Consequence: a full page reload clears both tokens and the user must
 * re-authenticate. This is the secure default for an SPA whose backend does not issue
 * an HttpOnly refresh cookie.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private _accessToken = signal<string | null>(null);
  private _refreshToken = signal<string | null>(null);

  readonly accessToken = this._accessToken.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();

  /** True when an access token is currently held in memory. */
  readonly hasToken = computed(() => this._accessToken() !== null);

  setAccessToken(token: string | null): void {
    this._accessToken.set(token);
  }

  getAccessToken(): string | null {
    return this._accessToken();
  }

  setRefreshToken(token: string | null): void {
    this._refreshToken.set(token);
  }

  getRefreshToken(): string | null {
    return this._refreshToken();
  }

  /** Wipe both tokens (used on logout / failed refresh). */
  clear(): void {
    this._accessToken.set(null);
    this._refreshToken.set(null);
  }
}
