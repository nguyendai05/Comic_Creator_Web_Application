import { faker } from '@faker-js/faker';
import { mockDelay, shouldSimulateError, generateId } from '@/lib/utils/mockUtils';
import { MockDB } from '@/lib/mockData/mockDB';
import { generateMockEpisodeFull } from '@/lib/mockData/generators';

import type {
    LoginCredentials,
    RegisterData,
    AuthResponse,
    Series,
    CreateSeriesData,
    User,
    Episode,
    CreateEpisodeData,
    EpisodeFullResponse,
    AIJobInput,
    AIJob,
    ExportJob,
    CreditTransaction
} from '@/types';

/**
 * Mock API implementation
 * Simulates real API behavior with localStorage
 */
export const mockApi = {
    // ============================================
    // AUTHENTICATION
    // ============================================

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        await mockDelay();

        if (shouldSimulateError()) {
            throw new Error('Network error - please try again');
        }

        // Demo credentials
        if (credentials.email === 'demo@example.com' &&
            credentials.password === 'demo123') {
            return {
                user: {
                    user_id: 'demo-user-123',
                    email: 'demo@example.com',
                    username: 'demo_artist',
                    display_name: 'Demo Artist',
                    credits_balance: 100,
                    subscription_tier: 'pro',
                    email_verified: true,
                    created_at: '2025-01-01T00:00:00Z'
                },
                tokens: {
                    access_token: 'mock-jwt-token-' + Date.now(),
                    refresh_token: 'mock-refresh-token-' + Date.now(),
                    expires_in: 604800 // 7 days
                }
            };
        }

        throw new Error('Invalid email or password');
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        await mockDelay(800);

        if (shouldSimulateError()) {
            throw new Error('Registration failed - please try again');
        }

        // Check if email already exists (in real implementation)
        const existingUser = localStorage.getItem(`mock-user-${data.email}`);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        const user: User = {
            user_id: generateId(),
            email: data.email,
            username: data.username,
            display_name: data.username,
            credits_balance: 10, // Free tier
            subscription_tier: 'free',
            email_verified: false,
            created_at: new Date().toISOString()
        };

        // Store user (simplified - in production would be in database)
        localStorage.setItem(`mock-user-${data.email}`, JSON.stringify(user));

        return {
            user,
            tokens: {
                access_token: 'mock-jwt-token-' + Date.now(),
                refresh_token: 'mock-refresh-token-' + Date.now(),
                expires_in: 604800
            }
        };
    },

    async logout(): Promise<void> {
        await mockDelay(200);
        // Clear session
        sessionStorage.removeItem('mock-token');
        console.log('🔓 Logged out');
    },

    // ============================================
    // SERIES
    // ============================================

    async getSeries(): Promise<Series[]> {
        await mockDelay(300);

        if (shouldSimulateError()) {
            throw new Error('Failed to fetch series');
        }

        return MockDB.series.getAll();
    },

    async getSeriesById(seriesId: string): Promise<Series> {
        await mockDelay(250);

        const series = MockDB.series.getById(seriesId);
        if (!series) {
            throw new Error('Series not found');
        }

        return series;
    },

    async createSeries(data: CreateSeriesData): Promise<Series> {
        await mockDelay(500);

        if (shouldSimulateError()) {
            throw new Error('Failed to create series');
        }

        const newSeries: Series = {
            series_id: generateId(),
            user_id: 'demo-user-123',
            title: data.title,
            description: data.description,
            genre: data.genre,
            art_style: data.art_style,
            status: 'draft',
            cover_image_url: undefined,
            tags: data.tags || [],
            is_public: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        return MockDB.series.create(newSeries);
    },

    async updateSeries(seriesId: string, updates: Partial<Series>): Promise<Series> {
        await mockDelay(400);

        if (shouldSimulateError()) {
            throw new Error('Failed to update series');
        }

        return MockDB.series.update(seriesId, updates);
    },

    async deleteSeries(seriesId: string): Promise<void> {
        await mockDelay(300);

        if (shouldSimulateError()) {
            throw new Error('Failed to delete series');
        }

        MockDB.series.delete(seriesId);
    },

    // ============================================
    // EPISODES
    // ============================================

    async getEpisodesBySeriesId(seriesId: string): Promise<Episode[]> {
        await mockDelay(300);

        if (shouldSimulateError()) {
            throw new Error('Failed to fetch episodes');
        }

        return MockDB.episodes.getBySeriesId(seriesId);
    },

    async getEpisodeById(episodeId: string): Promise<Episode> {
        await mockDelay(250);

        const episode = MockDB.episodes.getById(episodeId);
        if (!episode) {
            throw new Error('Episode not found');
        }

        return episode;
    },

    async createEpisode(seriesId: string, data: CreateEpisodeData): Promise<Episode> {
        await mockDelay(500);

        if (shouldSimulateError()) {
            throw new Error('Failed to create episode');
        }

        // Get next episode number
        const existingEpisodes = MockDB.episodes.getBySeriesId(seriesId);
        const nextNumber = existingEpisodes.length > 0
            ? Math.max(...existingEpisodes.map(e => e.episode_number)) + 1
            : 1;

        const newEpisode: Episode = {
            episode_id: generateId(),
            series_id: seriesId,
            episode_number: nextNumber,
            title: data.title,
            description: data.description,
            script: undefined,
            status: 'draft',
            thumbnail_url: undefined,
            page_count: 0,
            published_at: undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        return MockDB.episodes.create(newEpisode);
    },

    async updateEpisode(episodeId: string, updates: Partial<Episode>): Promise<Episode> {
        await mockDelay(400);

        if (shouldSimulateError()) {
            throw new Error('Failed to update episode');
        }

        return MockDB.episodes.update(episodeId, updates);
    },

    async deleteEpisode(episodeId: string): Promise<void> {
        await mockDelay(300);

        if (shouldSimulateError()) {
            throw new Error('Failed to delete episode');
        }

        MockDB.episodes.delete(episodeId);
    },

    // ============================================
    // EPISODE FULL (Critical for Editor)
    // ============================================

    /**
     * Get complete episode data with pages, panels, text elements, characters
     * This is the main endpoint for loading the editor
     */
    async getEpisodeFull(episodeId: string): Promise<EpisodeFullResponse> {
        await mockDelay(600); // Longer delay - lots of data

        if (shouldSimulateError()) {
            throw new Error('Failed to load episode');
        }

        // Check cache first
        let fullData = MockDB.episodeFull.get(episodeId);

        // If not cached, generate and cache it
        if (!fullData) {
            console.log('📝 Generating new episode full data for:', episodeId);
            fullData = generateMockEpisodeFull(episodeId);
            MockDB.episodeFull.set(episodeId, fullData);
        } else {
            console.log('📂 Loaded cached episode full data for:', episodeId);
        }

        return fullData;
    },

    /**
     * Update panel (called during editing)
     */
    async updatePanel(panelId: string, updates: Partial<any>): Promise<any> {
        await mockDelay(200);

        // Simple update - in production would update in database
        console.log('📝 Mock: Updated panel', panelId, updates);

        // Return updated panel
        return {
            panel_id: panelId,
            ...updates,
            updated_at: new Date().toISOString()
        };
    },

    /**
     * Add text element to panel
     */
    async addTextElement(panelId: string, textElement: any): Promise<any> {
        await mockDelay(200);

        console.log('📝 Mock: Added text element to panel', panelId);

        return {
            ...textElement,
            text_id: generateId(),
            panel_id: panelId,
            created_at: new Date().toISOString()
        };
    },

    /**
     * Update text element
     */
    async updateTextElement(textId: string, updates: any): Promise<any> {
        await mockDelay(150);

        console.log('📝 Mock: Updated text element', textId);

        return {
            text_id: textId,
            ...updates,
            updated_at: new Date().toISOString()
        };
    },

    /**
     * Delete text element
     */
    async deleteTextElement(textId: string): Promise<void> {
        await mockDelay(150);

        console.log('🗑️  Mock: Deleted text element', textId);
    },

    // ============================================
    // AI GENERATION
    // ============================================

    /**
     * Create an AI generation job
     * Simulates panel generation - completes after 10 seconds
     */
    async createAIJob(input: AIJobInput): Promise<AIJob> {
        await mockDelay(1000);

        if (shouldSimulateError()) {
            throw new Error('AI service unavailable - please try again');
        }

        const jobId = generateId();
        const estimatedCredits = input.job_type === 'panel_generation' ? 1 : 2;

        const job: AIJob = {
            job_id: jobId,
            status: 'pending',
            estimated_credits: estimatedCredits,
            estimated_duration_seconds: 10,
            created_at: new Date().toISOString()
        };

        console.log('🎨 Created AI job:', jobId);

        // Simulate processing in background
        setTimeout(() => {
            const completedJob: AIJob = {
                ...job,
                status: 'success',
                result: {
                    image_url: `/mock-images/panel-${faker.number.int({ min: 1, max: 20 })}.jpg`,
                    thumbnail_url: `/mock-images/thumb-${faker.number.int({ min: 1, max: 20 })}.jpg`,
                    width: 1024,
                    height: 576,
                    prompt_used: input.input.scene_description,
                    generation_metadata: {
                        model: 'gemini-pro-vision-mock',
                        seed: faker.number.int({ min: 1000, max: 9999 }),
                        steps: 30,
                        style: input.input.style.base
                    }
                },
                started_at: new Date(Date.now() + 1000).toISOString(),
                finished_at: new Date(Date.now() + 10000).toISOString()
            };

            // Store completed job
            localStorage.setItem(`mock-job-${jobId}`, JSON.stringify(completedJob));
            console.log('✅ AI job completed:', jobId);

        }, 10000); // Complete after 10 seconds

        return job;
    },

    /**
     * Get AI job status (for polling)
     */
    async getAIJob(jobId: string): Promise<AIJob> {
        await mockDelay(100); // Quick check

        // Check if job completed
        const stored = localStorage.getItem(`mock-job-${jobId}`);
        if (stored) {
            return JSON.parse(stored);
        }

        // Still processing - return progress
        return {
            job_id: jobId,
            status: 'processing',
            progress: faker.number.int({ min: 20, max: 80 }),
            started_at: new Date().toISOString(),
            created_at: new Date().toISOString() // Added missing required property
        };
    },

    /**
     * Cancel AI job (optional)
     */
    async cancelAIJob(jobId: string): Promise<void> {
        await mockDelay(200);

        console.log('❌ Cancelled AI job:', jobId);

        // Remove from localStorage
        localStorage.removeItem(`mock-job-${jobId}`);
    },

    // ============================================
    // EXPORT
    // ============================================

    /**
     * Create export job for episode
     */
    async createExportJob(
        episodeId: string,
        format: 'png' | 'pdf',
        _config: any
    ): Promise<ExportJob> {
        await mockDelay(800);

        if (shouldSimulateError()) {
            throw new Error('Export service unavailable');
        }

        const jobId = generateId();

        console.log(`📦 Creating ${format.toUpperCase()} export for episode:`, episodeId);

        // Simulate export processing
        setTimeout(() => {
            const url = format === 'pdf'
                ? `/mock-exports/episode-${episodeId}.pdf`
                : `/mock-exports/episode-${episodeId}.zip`;

            const completedJob: ExportJob = {
                export_id: jobId,
                status: 'success',
                result_url: url,
                finished_at: new Date().toISOString()
            };

            localStorage.setItem(`mock-export-${jobId}`, JSON.stringify(completedJob));
            console.log('✅ Export completed:', jobId);

        }, 5000); // Complete after 5 seconds

        return {
            export_id: jobId,
            status: 'pending',
            estimated_duration: 5,
            created_at: new Date().toISOString()
        };
    },

    /**
     * Get export job status
     */
    async getExportJob(exportId: string): Promise<ExportJob> {
        await mockDelay(100);

        const stored = localStorage.getItem(`mock-export-${exportId}`);
        if (stored) {
            return JSON.parse(stored);
        }

        // Still processing
        return {
            export_id: exportId,
            status: 'processing',
            progress: faker.number.int({ min: 30, max: 70 })
        };
    },

    // ============================================
    // CREDITS
    // ============================================

    /**
     * Get user's credit balance
     */
    async getCredits(): Promise<{ credits_balance: number }> {
        await mockDelay(100);

        // In production, would get from user session
        return { credits_balance: 100 };
    },

    /**
     * Get credit transaction history
     */
    async getCreditTransactions(limit: number = 10): Promise<CreditTransaction[]> {
        await mockDelay(200);

        // Generate mock transactions
        return Array.from({ length: limit }, (_, i) => ({
            tx_id: generateId(),
            user_id: 'demo-user-123',
            amount: faker.helpers.arrayElement([-1, -2, -5, 10, 50, 100]),
            balance_after: 100 - i * 2,
            reason: faker.helpers.arrayElement([
                'panel_generation',
                'monthly_credit',
                'refund',
                'purchase',
                'batch_generation',
                'character_generation'
            ]),
            metadata: {
                job_id: generateId()
            },
            created_at: faker.date.recent({ days: 30 }).toISOString()
        })).sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    },

    /**
     * Purchase credits (mock)
     */
    async purchaseCredits(amount: number): Promise<{ new_balance: number }> {
        await mockDelay(1000);

        console.log('💳 Mock: Purchased', amount, 'credits');

        return { new_balance: 100 + amount };
    }
};
