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

  // If we already have a valid current user, allow immediately
  if (authService.currentUser()) {
    return true;
  }

  // Try to validate the stored session by fetching current user.
  // If the access token expired, fetchCurrentUser will call logout internally.
  try {
    await authService.fetchCurrentUser();
    return true;
  } catch {
    // fetchCurrentUser already handles logout on 401.
    // If it fails, try a silent token refresh before redirecting.
    try {
      await authService.refreshToken();
      await authService.fetchCurrentUser();
      return true;
    } catch {
      await router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }
};
