import { InjectionToken } from "@angular/core";
import { HttpInterceptor, HttpContextToken } from "@angular/common/http";

/**
 * Injection token for the ApiClient client base API path
 */
export const BASE_PATH_APICLIENT = new InjectionToken<string>('BASE_PATH_APICLIENT', {
    providedIn: 'root',
    factory: () => '/api', // Default fallback
});
/**
 * Injection token for the ApiClient client HTTP interceptor instances
 */
export const HTTP_INTERCEPTORS_APICLIENT = new InjectionToken<HttpInterceptor[]>('HTTP_INTERCEPTORS_APICLIENT', {
    providedIn: 'root',
    factory: () => [], // Default empty array
});
/**
 * HttpContext token to identify requests belonging to the ApiClient client
 */
export const CLIENT_CONTEXT_TOKEN_APICLIENT = new HttpContextToken<string>(() => 'ApiClient');
