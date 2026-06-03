import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID, Injector } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, switchMap, throwError, from } from 'rxjs';
import { ApiConfiguration } from '../api-configuration';
import { TokenStorageService } from '../../features/auth/services/token-storage.service';
import { AuthFeatureService } from '../../features/auth/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const tokenStorage = inject(TokenStorageService);
  const config = inject(ApiConfiguration);
  const injector = inject(Injector);

  const token = tokenStorage.getAccessToken();
  const rootUrl = (config.rootUrl || '').replace(/\/$/, '');

  const isApiRequest = rootUrl
    ? req.url.startsWith(rootUrl)
    : req.url.includes('backend-aquashield-restoration-production.up.railway.app');

  // Don't attach expired access token to refresh endpoint — backend may reject it
  const isRefreshRequest = req.url.endsWith('/api/v1/auth/refresh');

  let outgoingReq = req;
  if (token && isApiRequest && !isRefreshRequest) {
    outgoingReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(outgoingReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isApiRequest) {
        // Lazy-resolve AuthFeatureService via Injector to avoid circular dependency
        const authService = injector.get(AuthFeatureService);
        return from(authService.refreshToken()).pipe(
          switchMap(() => {
            const newToken = tokenStorage.getAccessToken();
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });
            return next(retryReq);
          }),
          catchError(() => {
            authService.logout();
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
