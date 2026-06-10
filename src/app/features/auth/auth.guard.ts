import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthFeatureService } from './services/auth.service';
import { isPlatformServer } from '@angular/common';

export const authGuard: CanActivateFn = async (_route, state) => {
  const authService = inject(AuthFeatureService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId)) {
    return true;
  }

  // Already have the user loaded → allow immediately.
  if (authService.currentUser()) {
    return true;
  }

  // We hold an in-memory access token (just logged in). Trust it and allow
  // navigation NOW. Loading /me is best-effort and must NOT gate the route:
  // a freshly-issued token can momentarily 401 (server clock skew / session
  // replication lag), and blocking on /me here was bouncing the user straight
  // back to /login right after a successful sign-in. We hydrate currentUser in
  // the background; if the token is genuinely invalid, the interceptor's 401
  // refresh-retry (and ultimately logout) handles it on the next API call.
  if (authService.token()) {
    authService.fetchCurrentUser().catch(() => {
      // Background hydration; ignored on failure (interceptor owns recovery).
    });
    return true;
  }

  // No token at all — this is a fresh load/reload (tokens live in memory only,
  // so a reload always lands here) or an expired session. Try a silent refresh
  // before forcing re-authentication.
  try {
    await authService.refreshToken();
    await authService.fetchCurrentUser();
    return true;
  } catch {
    // Refresh failed — clean session and redirect to login.
    await authService.logout(state.url);
    return false;
  }
};
