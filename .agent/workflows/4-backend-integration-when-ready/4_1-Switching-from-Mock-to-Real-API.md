---
description: Backend Integration (When Ready) -> Switching from Mock to Real API
---

```bash
# Step 1: Update environment variable
# .env.production
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://your-backend.onrender.com/api

# Step 2: Rebuild frontend
npm run build

# Step 3: Deploy to Vercel
vercel deploy --prod
```

**Real API Implementation:**

```typescript
// lib/api/realApi.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          localStorage.setItem('access_token', response.data.access_token);
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${response.data.access_token}`;
          return axios(error.config);
        } catch (refreshError) {
          // Refresh failed - logout
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const realApi = {
  // Auth
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },
  
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },
  
  async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout');
  },
  
  // Series
  async getSeries(): Promise<Series[]> {
    const response = await axiosInstance.get('/series');
    return response.data;
  },
  
  async getSeriesById(seriesId: string): Promise<Series> {
    const response = await axiosInstance.get(`/series/${seriesId}`);
    return response.data;
  },
  
  async createSeries(data: CreateSeriesData): Promise<Series> {
    const response = await axiosInstance.post('/series', data);
    return response.data;
  },
  
  async updateSeries(seriesId: string, updates: Partial<Series>): Promise<Series> {
    const response = await axiosInstance.patch(`/series/${seriesId}`, updates);
    return response.data;
  },
  
  async deleteSeries(seriesId: string): Promise<void> {
    await axiosInstance.delete(`/series/${seriesId}`);
  },
  
  // Episodes
  async getEpisodesBySeriesId(seriesId: string): Promise<Episode[]> {
    const response = await axiosInstance.get(`/series/${seriesId}/episodes`);
    return response.data;
  },
  
  async getEpisodeFull(episodeId: string): Promise<EpisodeFullResponse> {
    const response = await axiosInstance.get(`/episodes/${episodeId}/full`);
    return response.data;
  },
  
  async createEpisode(seriesId: string, data: CreateEpisodeData): Promise<Episode> {
    const response = await axiosInstance.post(`/series/${seriesId}/episodes`, data);
    return response.data;
  },
  
  async updatePanel(panelId: string, updates: Partial<Panel>): Promise<Panel> {
    const response = await axiosInstance.patch(`/panels/${panelId}`, updates);
    return response.data;
  },
  
  // AI Generation
  async createAIJob(input: AIJobInput): Promise<AIJob> {
    const response = await axiosInstance.post('/ai/jobs', input);
    return response.data;
  },
  
  async getAIJob(jobId: string): Promise<AIJob> {
    const response = await axiosInstance.get(`/ai/jobs/${jobId}`);
    return response.data;
  },
  
  // Credits
  async getCredits(): Promise<{ credits_balance: number }> {
    const response = await axiosInstance.get('/billing/credits');
    return response.data;
  },
  
  async getCreditTransactions(): Promise<CreditTransaction[]> {
    const response = await axiosInstance.get('/billing/transactions');
    return response.data;
  },
  
  // Export
  async createExportJob(
    episodeId: string,
    format: 'png' | 'pdf',
    config: any
  ): Promise<ExportJob> {
    const response = await axiosInstance.post('/export/jobs', {
      episode_id: episodeId,
      format,
      config
    });
    return response.data;
  },
  
  async getExportJob(exportId: string): Promise<ExportJob> {
    const response = await axiosInstance.get(`/export/jobs/${exportId}`);
    return response.data;
  }
};
```