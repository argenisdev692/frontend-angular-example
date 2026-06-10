import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiConfiguration } from '../../../api/api-configuration';
import { joinApiUrl } from '../../../api/api-url';
import { AuthService as GeneratedAuthService } from '../../../api/services/auth.service';
import { LoginDto } from '../../../api/models';
import { VerifyTwoFactorChallengeDto } from '../../../api/models/verify-two-factor-challenge-dto';
import { UserResponse } from '../../../api/models/user-response';
import { TokenStorageService } from './token-storage.service';
import {
  LoginResponse,
  parseAuthTokens,
  parseLoginResponse,
  parseUserResponse,
} from '../models/auth.schemas';

@Injectable({ providedIn: 'root' })
export class AuthFeatureService {
  private generatedAuthService = inject(GeneratedAuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private config = inject(ApiConfiguration);
  private tokenStorage = inject(TokenStorageService);

  // Authentication state signals
  private _isAuthenticated = signal<boolean>(false);
  private _currentUser = signal<UserResponse | null>(null);
  private _isInitialized = signal<boolean>(false);

  // Public readonly signals
  isAuthenticated = this._isAuthenticated.asReadonly();
  currentUser = this._currentUser.asReadonly();
  token = this.tokenStorage.accessToken;

  constructor() {
    // Tokens live in memory only (see TokenStorageService) — there is nothing to
    // rehydrate from storage on construction. A page reload starts unauthenticated.
    this._isInitialized.set(true);
  }

  async login(credentials: LoginDto, returnUrl?: string): Promise<LoginResponse & { returnUrl?: string }> {
    const loginUrl = joinApiUrl(this.config.rootUrl, '/api/v1/auth/login');

    const loginResponse = parseLoginResponse(
      await firstValueFrom(this.http.post<unknown>(loginUrl, credentials))
    );

    if (loginResponse.twoFactorRequired) {
      return loginResponse;
    }

    if (!loginResponse?.accessToken || !loginResponse.refreshToken) {
      throw new Error('Login response did not contain tokens');
    }

    this.tokenStorage.setAccessToken(loginResponse.accessToken);
    this.tokenStorage.setRefreshToken(loginResponse.refreshToken);
    this._isAuthenticated.set(true);

    // Populate currentUser before navigation so authGuard sees it immediately (important in zoneless + signals)
    await this.fetchCurrentUser().catch(() => {
      // Still allow the caller to decide navigation even if /me fails
    });

    // Consume intended_url from session-timeout redirect so caller can navigate back to original page
    if (!returnUrl && isPlatformBrowser(this.platformId)) {
      returnUrl = localStorage.getItem('intended_url') ?? undefined;
      if (returnUrl) {
        localStorage.removeItem('intended_url');
      }
    }

    // Note: actual navigation is performed by the caller (login-form) after showing 'Redirecting...' message
    // to ensure the transient success banner is visible to the user.

    return { ...loginResponse, returnUrl };
  }

  async verifyTwoFactor(challenge: VerifyTwoFactorChallengeDto, returnUrl?: string): Promise<void> {
    const url = joinApiUrl(this.config.rootUrl, '/api/v1/auth/two-factor/verify');

    const response = parseAuthTokens(
      await firstValueFrom(this.http.post<unknown>(url, challenge))
    );

    this.tokenStorage.setAccessToken(response.accessToken);
    this.tokenStorage.setRefreshToken(response.refreshToken);
    this._isAuthenticated.set(true);

    // Populate currentUser BEFORE navigation (critical for authGuard + zoneless signals)
    await this.fetchCurrentUser().catch(() => {});

    let redirectUrl = returnUrl;
    if (!redirectUrl && isPlatformBrowser(this.platformId)) {
      redirectUrl = localStorage.getItem('intended_url') ?? undefined;
      localStorage.removeItem('intended_url');
    }

    await this.router.navigate([redirectUrl || '/dashboard']);
  }

  googleSignIn(): void {
    window.location.href = joinApiUrl(this.config.rootUrl, '/api/v1/auth/google/redirect');
  }

  async forgotPassword(email: string): Promise<void> {
    await firstValueFrom(
      this.http.post(joinApiUrl(this.config.rootUrl, '/api/v1/auth/forgot-password'), { email })
    );
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    await firstValueFrom(
      this.http.post(joinApiUrl(this.config.rootUrl, '/api/v1/auth/reset-password'), { email, code, newPassword })
    );
  }

  /**
   * Send a one-time login code to the user's email.
   * Backend endpoint required: POST /api/v1/auth/otp/send
   */
  async sendEmailOtp(email: string): Promise<void> {
    await firstValueFrom(
      this.http.post(joinApiUrl(this.config.rootUrl, '/api/v1/auth/otp/send'), { email })
    );
  }

  /**
   * Verify email OTP code and complete login.
   * Backend endpoint required: POST /api/v1/auth/otp/verify
   */
  async verifyEmailOtp(email: string, code: string, returnUrl?: string): Promise<void> {
    const response = parseAuthTokens(
      await firstValueFrom(
        this.http.post<unknown>(joinApiUrl(this.config.rootUrl, '/api/v1/auth/otp/verify'), { email, code })
      )
    );

    this.tokenStorage.setAccessToken(response.accessToken);
    this.tokenStorage.setRefreshToken(response.refreshToken);
    this._isAuthenticated.set(true);

    // Populate currentUser before caller decides to navigate (zoneless + authGuard safety)
    await this.fetchCurrentUser().catch(() => {});

    // Navigation intentionally left to the caller (login-form) so the 'Redirecting...' banner is visible.
  }

  /**
   * Login directly with TOTP code (primary method).
   * Backend endpoint required: POST /api/v1/auth/totp/login
   */
  async loginWithTotp(email: string, code: string, returnUrl?: string): Promise<void> {
    const response = parseAuthTokens(
      await firstValueFrom(
        this.http.post<unknown>(joinApiUrl(this.config.rootUrl, '/api/v1/auth/totp/login'), { email, code })
      )
    );

    this.tokenStorage.setAccessToken(response.accessToken);
    this.tokenStorage.setRefreshToken(response.refreshToken);
    this._isAuthenticated.set(true);

    // Populate currentUser before caller decides to navigate (zoneless + authGuard safety)
    await this.fetchCurrentUser().catch(() => {});

    // Navigation intentionally left to the caller (login-form) so the 'Redirecting...' banner is visible.
  }

  async logout(returnUrl?: string): Promise<void> {
    try {
      await this.generatedAuthService.authControllerLogout();
    } catch {
      // Ignore logout API errors
    } finally {
      this._isAuthenticated.set(false);
      this._currentUser.set(null);
      this.tokenStorage.clear();

      const extras = returnUrl ? { queryParams: { returnUrl } } : undefined;
      await this.router.navigate(['/login'], extras);
    }
  }

  async fetchCurrentUser(): Promise<void> {
    try {
      const meUrl = joinApiUrl(this.config.rootUrl, '/api/v1/auth/me');

      const user = parseUserResponse(await firstValueFrom(this.http.get<unknown>(meUrl)));

      this._currentUser.set(user);
      this._isAuthenticated.set(true);
    } catch (err: unknown) {
      // Don't auto-logout here — caller (authGuard) will try refreshToken first.
      // logout() clears the in-memory refresh token, making refresh impossible.
      throw err;
    }
  }

  async refreshToken(): Promise<void> {
    try {
      const refreshToken = this.tokenStorage.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const refreshUrl = joinApiUrl(this.config.rootUrl, '/api/v1/auth/refresh');

      const refreshResponse = parseAuthTokens(
        await firstValueFrom(this.http.post<unknown>(refreshUrl, { refreshToken }))
      );

      this.tokenStorage.setAccessToken(refreshResponse.accessToken);
      this.tokenStorage.setRefreshToken(refreshResponse.refreshToken);
    } catch (err: unknown) {
      // Only logout on 401 Unauthorized. Network/server errors should not wipe session.
      if (err instanceof HttpErrorResponse && err.status === 401) {
        await this.logout();
      }
      throw err;
    }
  }
}
