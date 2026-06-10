import { z } from 'zod';
import { UserResponse } from '../../../api/models/user-response';

/**
 * Runtime validation for auth trust-boundary responses (OWASP).
 *
 * The backend OpenAPI spec defines NO response schemas, so the generated client
 * resolves these endpoints to `void` and the app reads them with raw HttpClient.
 * That means nothing guarantees the JSON shape at runtime — these Zod schemas are
 * the only thing standing between an unexpected/hostile payload and the UI.
 *
 * Schemas are intentionally lenient on rarely-displayed fields (`.nullish()`) so a
 * minor backend drift never blocks login; the security-critical fields (id, email,
 * tokens) are required.
 */

const permissionSchema = z.object({
  action: z.string(),
  subject: z.string(),
});

const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
});

/** Mirrors the generated `UserResponse` model. */
export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  lastName: z.string().nullish(),
  username: z.string().nullish(),
  phone: z.string().nullish(),
  dateOfBirth: z.string().nullish(),
  gender: z.string().nullish(),
  address: z.string().nullish(),
  address2: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  zipCode: z.string().nullish(),
  country: z.string().nullish(),
  profilePhotoUrl: z.string().nullish(),
  emailVerifiedAt: z.string().nullish(),
  passwordConfirmedAt: z.string().nullish(),
  mustChangePassword: z.boolean().nullish(),
  totpEnabled: z.boolean().nullish(),
  deletedAt: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  roles: z.array(roleSchema).nullish(),
  permissions: z.array(permissionSchema).nullish(),
});

/** Token payload returned by login / refresh / 2FA / OTP / TOTP flows. */
export const authTokensSchema = z.object({
  accessToken: z.string().min(1),
  accessTokenExpiresAt: z.string().nullish(),
  refreshToken: z.string().min(1),
});

/** Full login response (tokens may be absent when 2FA is required). */
export const loginResponseSchema = z.object({
  accessToken: z.string().nullish(),
  accessTokenExpiresAt: z.string().nullish(),
  refreshToken: z.string().nullish(),
  twoFactorRequired: z.boolean().nullish(),
  mustChangePassword: z.boolean().nullish(),
  passwordExpiresAt: z.string().nullish(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;

/**
 * Parse `/me` data, returning a value assignable to the generated `UserResponse`.
 * Throws a clear error if the payload doesn't match — callers already handle
 * fetchCurrentUser() failures (background hydration / profile error state).
 */
export function parseUserResponse(data: unknown): UserResponse {
  return userResponseSchema.parse(data) as UserResponse;
}

export function parseLoginResponse(data: unknown): LoginResponse {
  return loginResponseSchema.parse(data);
}

export function parseAuthTokens(data: unknown): AuthTokens {
  return authTokensSchema.parse(data);
}
