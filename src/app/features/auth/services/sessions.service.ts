import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { z } from 'zod';
import { ApiConfiguration } from '../../../api/api-configuration';
import { joinApiUrl } from '../../../api/api-url';

/**
 * Active session as displayed in the UI. Normalized from the backend payload —
 * the OpenAPI spec defines no response schema for `/auth/sessions`, so we accept
 * an array of objects and map defensively across the likely field names rather
 * than hard-coding one shape that may not match the running backend.
 */
export interface SessionView {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  lastActiveAt?: string;
  createdAt?: string;
  current: boolean;
}

export interface TrustedDeviceView {
  id: string;
  name?: string;
  userAgent?: string;
  lastUsedAt?: string;
  createdAt?: string;
  expiresAt?: string;
}

/** Tolerant: validate only that the response is an array of objects. */
const recordArraySchema = z.array(z.record(z.string(), z.unknown())).catch([]);

type RawRecord = Record<string, unknown>;

function pickString(rec: RawRecord, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = rec[key];
    if (typeof value === 'string' && value.length > 0) return value;
    if (typeof value === 'number') return String(value);
  }
  return undefined;
}

function pickBool(rec: RawRecord, ...keys: string[]): boolean {
  for (const key of keys) {
    if (rec[key] === true) return true;
  }
  return false;
}

@Injectable({ providedIn: 'root' })
export class AuthSessionsFeatureService {
  private http = inject(HttpClient);
  private config = inject(ApiConfiguration);

  async listSessions(): Promise<SessionView[]> {
    const url = joinApiUrl(this.config.rootUrl, '/api/v1/auth/sessions');
    const data = recordArraySchema.parse(await firstValueFrom(this.http.get<unknown>(url)));
    return data
      .map((rec): SessionView | null => {
        const id = pickString(rec, 'id', 'sessionId', '_id', 'jti');
        if (!id) return null;
        return {
          id,
          ipAddress: pickString(rec, 'ipAddress', 'ip', 'ipAddr'),
          userAgent: pickString(rec, 'userAgent', 'agent', 'device', 'deviceName'),
          location: pickString(rec, 'location', 'city', 'country'),
          lastActiveAt: pickString(rec, 'lastActiveAt', 'lastUsedAt', 'lastSeenAt', 'updatedAt'),
          createdAt: pickString(rec, 'createdAt', 'issuedAt'),
          current: pickBool(rec, 'current', 'isCurrent', 'isCurrentSession'),
        };
      })
      .filter((s): s is SessionView => s !== null);
  }

  async revokeSession(id: string): Promise<void> {
    const url = joinApiUrl(this.config.rootUrl, `/api/v1/auth/sessions/${encodeURIComponent(id)}`);
    await firstValueFrom(this.http.delete(url));
  }

  async listTrustedDevices(): Promise<TrustedDeviceView[]> {
    const url = joinApiUrl(this.config.rootUrl, '/api/v1/auth/trusted-devices');
    const data = recordArraySchema.parse(await firstValueFrom(this.http.get<unknown>(url)));
    return data
      .map((rec): TrustedDeviceView | null => {
        const id = pickString(rec, 'id', 'deviceId', '_id');
        if (!id) return null;
        return {
          id,
          name: pickString(rec, 'name', 'deviceName', 'label'),
          userAgent: pickString(rec, 'userAgent', 'agent', 'device'),
          lastUsedAt: pickString(rec, 'lastUsedAt', 'lastActiveAt', 'updatedAt'),
          createdAt: pickString(rec, 'createdAt', 'trustedAt'),
          expiresAt: pickString(rec, 'expiresAt', 'expiry'),
        };
      })
      .filter((d): d is TrustedDeviceView => d !== null);
  }

  async revokeTrustedDevice(id: string): Promise<void> {
    const url = joinApiUrl(this.config.rootUrl, `/api/v1/auth/trusted-devices/${encodeURIComponent(id)}`);
    await firstValueFrom(this.http.delete(url));
  }

  async revokeAllTrustedDevices(): Promise<void> {
    const url = joinApiUrl(this.config.rootUrl, '/api/v1/auth/trusted-devices');
    await firstValueFrom(this.http.delete(url));
  }
}
