import type {
    LoginCredentials,
    RegisterData,
    AuthResponse,
    Series,
    CreateSeriesData,
    Episode,
    CreateEpisodeData,
    EpisodeFullResponse,
    Panel,
    TextElement,
    AIJobInput,
    AIJob,
    ExportJob,
    CreditTransaction
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Helper to get auth token
const getAuthToken = (): string | null => {
    const authData = localStorage.getItem('comic-creator-auth');
    if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.accessToken || null;
    }
    return null;
};

// Fetch wrapper with auth
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = getAuthToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response;
};

export const realApi = {
    // ============================================
    // AUTHENTICATION
    // ============================================

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Invalid credentials');
        }

        return response.json();
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Registration failed');
        }

        return response.json();
    },

    async logout(): Promise<void> {
        await fetchWithAuth('/auth/logout', { method: 'POST' });
    },

    // ============================================
    // SERIES
    // ============================================

    async getSeries(): Promise<Series[]> {
        const response = await fetchWithAuth('/series');
        return response.json();
    },

    async getSeriesById(seriesId: string): Promise<Series> {
        const response = await fetchWithAuth(`/series/${seriesId}`);
        return response.json();
    },

    async createSeries(data: CreateSeriesData): Promise<Series> {
        const response = await fetchWithAuth('/series', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.json();
    },

    async updateSeries(seriesId: string, updates: Partial<Series>): Promise<Series> {
        const response = await fetchWithAuth(`/series/${seriesId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return response.json();
    },

    async deleteSeries(seriesId: string): Promise<void> {
        await fetchWithAuth(`/series/${seriesId}`, { method: 'DELETE' });
    },

    // ============================================
    // EPISODES
    // ============================================

    async getEpisodesBySeriesId(seriesId: string): Promise<Episode[]> {
        const response = await fetchWithAuth(`/series/${seriesId}/episodes`);
        return response.json();
    },

    async getEpisodeById(episodeId: string): Promise<Episode> {
        const response = await fetchWithAuth(`/episodes/${episodeId}`);
        return response.json();
    },

    async getEpisodeFull(episodeId: string): Promise<EpisodeFullResponse> {
        const response = await fetchWithAuth(`/episodes/${episodeId}/full`);
        return response.json();
    },

    async createEpisode(seriesId: string, data: CreateEpisodeData): Promise<Episode> {
        const response = await fetchWithAuth(`/series/${seriesId}/episodes`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.json();
    },

    async updateEpisode(episodeId: string, updates: Partial<Episode>): Promise<Episode> {
        const response = await fetchWithAuth(`/episodes/${episodeId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return response.json();
    },

    async deleteEpisode(episodeId: string): Promise<void> {
        await fetchWithAuth(`/episodes/${episodeId}`, { method: 'DELETE' });
    },

    async saveEpisode(episodeId: string, data: any): Promise<EpisodeFullResponse> {
        const response = await fetchWithAuth(`/episodes/${episodeId}/save`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response.json();
    },

    // ============================================
    // PANELS
    // ============================================

    async updatePanel(panelId: string, updates: Partial<Panel>): Promise<Panel> {
        const response = await fetchWithAuth(`/panels/${panelId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return response.json();
    },

    // ============================================
    // TEXT ELEMENTS
    // ============================================

    async createTextElement(panelId: string, data: Partial<TextElement>): Promise<TextElement> {
        const response = await fetchWithAuth(`/panels/${panelId}/texts`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.json();
    },

    async updateTextElement(textId: string, updates: Partial<TextElement>): Promise<TextElement> {
        const response = await fetchWithAuth(`/texts/${textId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return response.json();
    },

    async deleteTextElement(textId: string): Promise<void> {
        await fetchWithAuth(`/texts/${textId}`, { method: 'DELETE' });
    },

    // ============================================
    // AI GENERATION
    // ============================================

    async createAIJob(input: AIJobInput): Promise<AIJob> {
        const response = await fetchWithAuth('/ai/generate', {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return response.json();
    },

    async getAIJob(jobId: string): Promise<AIJob> {
        const response = await fetchWithAuth(`/ai/jobs/${jobId}`);
        return response.json();
    },

    async cancelAIJob(jobId: string): Promise<void> {
        await fetchWithAuth(`/ai/jobs/${jobId}/cancel`, { method: 'POST' });
    },

    // ============================================
    // EXPORT
    // ============================================

    async createExportJob(episodeId: string, format: 'pdf' | 'png', config: any): Promise<ExportJob> {
        const response = await fetchWithAuth('/export', {
            method: 'POST',
            body: JSON.stringify({ episodeId, format, config }),
        });
        return response.json();
    },

    async getExportJob(exportId: string): Promise<ExportJob> {
        const response = await fetchWithAuth(`/export/${exportId}`);
        return response.json();
    },

    // ============================================
    // CREDITS
    // ============================================

    async getCredits(): Promise<{ credits_balance: number }> {
        const response = await fetchWithAuth('/credits');
        return response.json();
    },

    async getCreditTransactions(limit: number = 10): Promise<CreditTransaction[]> {
        const response = await fetchWithAuth(`/credits/transactions?limit=${limit}`);
        return response.json();
    },

    async purchaseCredits(amount: number): Promise<{ new_balance: number }> {
        const response = await fetchWithAuth('/credits/purchase', {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
        return response.json();
    },
};
