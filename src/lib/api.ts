import axios from 'axios';

const configuredApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const API_BASE_URL = configuredApiUrl || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '');
export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE_URL.endsWith('/api') && normalizedPath.startsWith('/api')) {
    return `${API_BASE_URL}${normalizedPath.slice(4)}`;
  }
  return `${API_BASE_URL}${normalizedPath}`;
};

const api = axios.create({
  baseURL: apiUrl('/api/v1'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

// Auth API
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const { access_token, user } = response.data;
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('user', JSON.stringify(user));
  return { access_token, user };
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth:logout'));
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// B2B API
export interface B2BRequest {
  id: string;
  buyer_id: string;
  buyer_name?: string;
  title: string;
  description?: string;
  category_id?: number;
  craft?: string;
  material?: string;
  region?: string;
  quantity_required: number;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  priority: string;
  status: string;
  matches: B2BMatch[];
  created_at: string;
  updated_at: string;
}

export interface B2BMatch {
  id: string;
  b2b_request_id: string;
  artwork_id?: string;
  artisan_id: string;
  artisan_name?: string;
  artwork_title?: string;
  artwork_image_url?: string;
  match_score: number;
  match_factors?: Record<string, unknown>;
  notes?: string;
  is_accepted: boolean;
  is_rejected: boolean;
  created_at: string;
  responded_at?: string;
}

export interface B2BRequestCreate {
  title: string;
  description?: string;
  category_id?: number;
  craft?: string;
  material?: string;
  region?: string;
  quantity_required: number;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  priority?: string;
}

export const b2bApi = {
  // Buyer endpoints
  createRequest: async (data: B2BRequestCreate): Promise<B2BRequest> => {
    const response = await api.post('/b2b/requests', data);
    return response.data;
  },

  listRequests: async (statusFilter?: string): Promise<B2BRequest[]> => {
    const params = statusFilter ? { status_filter: statusFilter } : {};
    const response = await api.get('/b2b/requests', { params });
    return response.data;
  },

  getRequest: async (id: string): Promise<B2BRequest> => {
    const response = await api.get(`/b2b/requests/${id}`);
    return response.data;
  },

  matchArtisans: async (requestId: string, topN: number = 10): Promise<unknown> => {
    const response = await api.post(`/b2b/requests/${requestId}/match`, { top_n: topN });
    return response.data;
  },

  acceptMatch: async (requestId: string, artisanId: string): Promise<unknown> => {
    const response = await api.post(`/b2b/requests/${requestId}/accept/${artisanId}`);
    return response.data;
  },

  // Artisan endpoints
  getMyMatches: async (): Promise<B2BRequest[]> => {
    const response = await api.get('/b2b/my-matches');
    return response.data;
  },

  getOpenRequests: async (craft?: string, region?: string): Promise<B2BRequest[]> => {
    const params: Record<string, string> = {};
    if (craft) params.craft = craft;
    if (region) params.region = region;
    const response = await api.get('/b2b/open-requests', { params });
    return response.data;
  },
};

export default api;
