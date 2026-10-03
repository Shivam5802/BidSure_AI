import { ApiResponse, HealthCheckData, ApiMetadataData } from '@/types';
import { AuthUser, LoginResponseData } from '@/types/auth';

/**
 * Resolves the backend API base URL.
 * Priority: explicit NEXT_PUBLIC_API_URL env var → localhost fallback.
 * The env var should be set per deployment (Vercel, Netlify, etc.).
 */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (raw) {
    // Handle multiple URLs separated by comma or || — take the first https one in production
    if (raw.includes('||') || raw.includes(',')) {
      const separator = raw.includes('||') ? '||' : ',';
      const parts = raw.split(separator).map((p) => p.trim()).filter(Boolean);
      if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
        const httpsUrl = parts.find((p) => p.startsWith('https://'));
        if (httpsUrl) return httpsUrl.replace(/\/+$/, '');
      }
      return parts[0]!.replace(/\/+$/, '');
    }
    return raw.replace(/\/+$/, '');
  }

  // Fallback to local backend in development
  return 'http://localhost:5000';
}

export const API_BASE_URL = getApiBaseUrl();

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
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const hasBody = options.body !== undefined && options.body !== null;

  // Attach Bearer token from localStorage if available
  if (!headers['Authorization'] && typeof window !== 'undefined') {
    const token = localStorage.getItem('bidguard_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Only set Content-Type for non-FormData JSON bodies
  if (!headers['Content-Type'] && !isFormData && hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const json: any = await res.json().catch(() => {
      throw new ApiError('INVALID_JSON', `Failed to parse response from ${url}`);
    });

    if (!res.ok || json?.success === false) {
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

    // Unwrap standard { success: true, data: T } envelope
    if (json && typeof json === 'object' && 'data' in json && json.success === true) {
      return json.data as T;
    }

    return json as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const rawMsg = (error as Error).message || '';
    const isNetworkError =
      rawMsg.toLowerCase().includes('failed to fetch') ||
      rawMsg.toLowerCase().includes('networkerror');
    const errMsg = isNetworkError
      ? 'Unable to connect to the server. Please check your connection and try again.'
      : rawMsg || 'Network request failed';
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

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

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
    try {
      return await request<{ message: string }>('api/auth/logout', {
        method: 'POST',
      });
    } catch {
      return { message: 'Logged out' };
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bidguard_token');
        document.cookie = 'bidguard_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      }
    }
  },

  getMe: (): Promise<{ user: AuthUser }> =>
    request<{ user: AuthUser }>('api/auth/me'),

  checkHealth: (): Promise<HealthCheckData> =>
    request<HealthCheckData>('api/health'),

  getMetadata: (): Promise<ApiMetadataData> =>
    request<ApiMetadataData>('api'),

  registerBidder: async (payload: {
    name: string;
    email: string;
    password: string;
    companyName: string;
    companyType?: string;
    gstin?: string;
    pan?: string;
    registeredAddress?: string;
    contactPhone?: string;
    phone?: string;
  }): Promise<{ token: string; user: AuthUser; profile: any }> => {
    const data = await request<{ token: string; user: AuthUser; profile: any }>(
      'api/auth/register/bidder',
      {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          phone: payload.phone || payload.contactPhone,
        }),
      }
    );
    if (typeof window !== 'undefined' && data?.token) {
      localStorage.setItem('bidguard_token', data.token);
    }
    return data;
  },

  getPublishedTenders: (params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<any[]>(`api/tenders/published${qs}`);
  },

  getPublishedTender: (id: string) =>
    request<any>(`api/tenders/published/${id}`),

  publishTender: (id: string) =>
    request<any>(`api/tenders/${id}/publish`, { method: 'POST' }),

  getMyApplications: () =>
    request<any[]>('api/bidder/applications'),

  getApplication: (id: string) =>
    request<any>(`api/bidder/applications/${id}`),

  createApplication: (
    tenderId: string,
    payload?: {
      companyName?: string;
      companyType?: string;
      gstin?: string;
      pan?: string;
      registeredAddress?: string;
      contactPhone?: string;
    }
  ) =>
    request<any>(`api/tenders/${tenderId}/apply`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),

  saveApplicationDraft: (id: string, payload: { companyDetails?: any }) =>
    request<any>(`api/bidder/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  uploadApplicationDocument: (id: string, formData: FormData) =>
    request<any>(`api/bidder/applications/${id}/documents`, {
      method: 'POST',
      body: formData,
    }),

  deleteApplicationDocument: (applicationId: string, documentId: string) =>
    request<{ message: string }>(
      `api/bidder/applications/${applicationId}/documents/${documentId}`,
      { method: 'DELETE' }
    ),

  submitApplication: (id: string) =>
    request<any>(`api/bidder/applications/${id}/submit`, { method: 'POST' }),

  withdrawApplication: (id: string) =>
    request<any>(`api/bidder/applications/${id}/withdraw`, { method: 'POST' }),

  getBidderProfile: () =>
    request<any>('api/bidder/profile'),

  updateBidderProfile: (payload: any) =>
    request<any>('api/bidder/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  listOfficers: () =>
    request<any[]>('api/admin/officers'),

  getOfficer: (id: string) =>
    request<any>(`api/admin/officers/${id}`),

  createOfficer: (payload: {
    name: string;
    email: string;
    password?: string;
    department?: string;
    designation?: string;
    phone?: string;
  }) =>
    request<any>('api/admin/officers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateOfficer: (
    id: string,
    payload: {
      name?: string;
      department?: string;
      designation?: string;
      phone?: string;
    }
  ) =>
    request<any>(`api/admin/officers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  activateOfficer: (id: string) =>
    request<any>(`api/admin/officers/${id}/activate`, { method: 'POST' }),

  deactivateOfficer: (id: string) =>
    request<any>(`api/admin/officers/${id}/deactivate`, { method: 'POST' }),

  getOfficerActivity: (id: string) =>
    request<any[]>(`api/admin/officers/${id}/activity`),
};
