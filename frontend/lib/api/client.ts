import { ApiResponse, HealthCheckData, ApiMetadataData } from '@/types';
import { AuthUser, LoginResponseData } from '@/types/auth';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class ApiError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const hasBody = options.body !== undefined && options.body !== null;

  // Attach Bearer token from localStorage if available (ensures cross-domain auth works even when 3rd-party cookies are blocked)
  if (!headers['Authorization'] && typeof window !== 'undefined') {
    const token = localStorage.getItem('bidguard_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Only attach Content-Type: application/json if there is a non-FormData body and it was not explicitly provided
  if (!headers['Content-Type'] && !isFormData && hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Essential for sending & receiving HttpOnly session cookies
    });

    const json: any = await res.json().catch(() => {
      throw new ApiError('INVALID_JSON', `Failed to parse response from ${url}`);
    });

    if (!res.ok || json?.success === false) {
      // If 401 on protected endpoint (and not checking login credentials), notify auth listeners
      if (res.status === 401 && !url.includes('/api/auth/login')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bidguard_token');
          window.dispatchEvent(new CustomEvent('bidguard:session-expired'));
        }
      }

      const code = json?.error?.code || `HTTP_${res.status}`;
      const message = json?.error?.message || `Request failed with status ${res.status}`;
      throw new ApiError(code, message, json?.error?.details);
    }

    // If wrapped in standard { success: true, data: T }, unwrap it
    if (json && typeof json === 'object' && 'data' in json && json.success === true) {
      return json.data as T;
    }

    return json as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const errMsg = (error as Error).message || 'Network request failed';
    throw new ApiError('NETWORK_ERROR', errMsg);
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body ?? {}),
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body ?? {}),
    }),

  login: async (email: string, password?: string): Promise<LoginResponseData> => {
    const data = await request<LoginResponseData>('api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (typeof window !== 'undefined' && data?.token) {
      localStorage.setItem('bidguard_token', data.token);
    }
    return data;
  },

  logout: async (): Promise<{ message: string }> => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bidguard_token');
    }
    return request<{ message: string }>('api/auth/logout', {
      method: 'POST',
    });
  },

  getMe: (): Promise<{ user: AuthUser }> => request<{ user: AuthUser }>('api/auth/me'),

  checkHealth: (): Promise<HealthCheckData> => request<HealthCheckData>('api/health'),

  getMetadata: (): Promise<ApiMetadataData> => request<ApiMetadataData>('api'),
};
