import { ApiResponse, HealthCheckData, ApiMetadataData } from '@/types';
import { AuthUser, LoginResponseData } from '@/types/auth';

export function getApiBaseUrl(): string {
  // If running in browser on localhost or 127.0.0.1, ALWAYS use local backend (port 5000)
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:5000';
  }

  let raw = process.env.NEXT_PUBLIC_API_URL?.trim();

  // If multiple URLs separated by || or comma:
  if (raw && (raw.includes('||') || raw.includes(','))) {
    const separator = raw.includes('||') ? '||' : ',';
    const parts = raw.split(separator).map((p) => p.trim()).filter(Boolean);
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      const httpsCandidate = parts.find((p) => p.startsWith('https://'));
      if (httpsCandidate) return httpsCandidate.replace(/\/+$/, '');
    }
    raw = parts[0];
  }

  // If explicitly configured:
  if (raw) {
    const cleaned = raw.replace(/\/+$/, '');
    // If running in production browser (e.g. Vercel) but NEXT_PUBLIC_API_URL was mistakenly left as localhost:
    if (
      typeof window !== 'undefined' &&
      cleaned.includes('localhost') &&
      !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('127.0.0.1')
    ) {
      return 'https://bidsure-ai-3db4.onrender.com';
    }
    return cleaned;
  }

  // Fallback: When running on Vercel or any non-localhost host without env configured,
  // automatically route to the deployed Render backend
  if (
    typeof window !== 'undefined' &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1')
  ) {
    return 'https://bidsure-ai-3db4.onrender.com';
  }

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
    const rawMsg = (error as Error).message || '';
    let errMsg = rawMsg || 'Network request failed';
    if (rawMsg.toLowerCase().includes('failed to fetch') || rawMsg.toLowerCase().includes('networkerror')) {
      const isRemote = !getApiBaseUrl().includes('localhost');
      errMsg = isRemote
        ? 'Unable to connect to the backend server. If using Render free tier, the server may be waking up from sleep (can take up to 60s on the first request). Please wait a moment and try again.'
        : 'Unable to connect to backend at localhost:5000. Please ensure the backend server is running.';
    }
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

  // --- Bidder Self-Registration & Portal API ---
  registerBidder: (payload: {
    name: string;
    email: string;
    password: string;
    companyName: string;
    companyType?: string;
    gstin?: string;
    pan?: string;
    registeredAddress?: string;
    contactPhone?: string;
  }) => request<{ token: string; user: AuthUser; profile: any }>('api/auth/register/bidder', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

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
    request<any[]>('api/applications/my'),

  getApplication: (id: string) =>
    request<any>(`api/applications/${id}`),

  createApplication: (tenderId: string) =>
    request<any>('api/applications', {
      method: 'POST',
      body: JSON.stringify({ tenderId }),
    }),

  saveApplicationDraft: (id: string, payload: { companyDetails?: any }) =>
    request<any>(`api/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  uploadApplicationDocument: (id: string, formData: FormData) =>
    request<any>(`api/applications/${id}/documents`, {
      method: 'POST',
      body: formData,
    }),

  deleteApplicationDocument: (applicationId: string, documentId: string) =>
    request<{ message: string }>(`api/applications/${applicationId}/documents/${documentId}`, {
      method: 'DELETE',
    }),

  submitApplication: (id: string) =>
    request<any>(`api/applications/${id}/submit`, { method: 'POST' }),

  withdrawApplication: (id: string) =>
    request<any>(`api/applications/${id}/withdraw`, { method: 'POST' }),

  getBidderProfile: () =>
    request<any>('api/applications/profile/me'),

  updateBidderProfile: (payload: any) =>
    request<any>('api/applications/profile/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // --- Officer Management (Admin) ---
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

  updateOfficer: (id: string, payload: {
    name?: string;
    department?: string;
    designation?: string;
    phone?: string;
  }) =>
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
