---
description: Frontend Development Workflows -> Implementing Mock API with Realistic Behavior
---

```typescript
// lib/api/mockApi.ts
import { faker } from '@faker-js/faker';

const MOCK_DELAY = parseInt(import.meta.env.VITE_MOCK_DELAY_MS || '500');

// Simulate network latency with jitter
async function mockDelay(ms: number = MOCK_DELAY): Promise {
  const jitter = Math.random() * 200 - 100;
  return new Promise(resolve => setTimeout(resolve, ms + jitter));
}

// Simulate random errors (5% chance)
function shouldSimulateError(): boolean {
  return Math.random() < 0.05;
}

// Mock localStorage-based database
class MockDB {
  private static getItem(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }
  
  private static setItem(key: string, value: T[]): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
  
  static series = {
    getAll: (): Series[] => this.getItem('mock-series'),
    create: (series: Series) => {
      const all = this.getAll();
      all.push(series);
      this.setItem('mock-series', all);
      return series;
    },
    update: (id: string, updates: Partial) => {
      const all = this.getAll();
      const index = all.findIndex(s => s.series_id === id);
      if (index !== -1) {
        all[index] = { ...all[index], ...updates };
        this.setItem('mock-series', all);
        return all[index];
      }
      throw new Error('Series not found');
    },
    delete: (id: string) => {
      const all = this.getAll();
      this.setItem('mock-series', all.filter(s => s.series_id !== id));
    }
  };
  
  static episodes = {
    getBySeriesId: (seriesId: string): Episode[] => {
      return this.getItem('mock-episodes')
        .filter(e => e.series_id === seriesId);
    },
    getById: (id: string): Episode | undefined => {
      return this.getItem('mock-episodes')
        .find(e => e.episode_id === id);
    },
    create: (episode: Episode) => {
      const all = this.getItem('mock-episodes');
      all.push(episode);
      this.setItem('mock-episodes', all);
      return episode;
    }
  };
  
  // Similar for pages, panels, etc.
}

// Initialize mock data on first load
function initializeMockData() {
  if (!localStorage.getItem('mock-initialized')) {
    // Create 3 sample series
    const series: Series[] = [
      generateMockSeries(),
      generateMockSeries(),
      generateMockSeries()
    ];
    MockDB.series.setItem('mock-series', series);
    
    // Create episodes for first series
    const episodes = [
      generateMockEpisode(series[0].series_id, 1),
      generateMockEpisode(series[0].series_id, 2)
    ];
    localStorage.setItem('mock-episodes', JSON.stringify(episodes));
    
    localStorage.setItem('mock-initialized', 'true');
  }
}

// Call on module load
initializeMockData();

// Mock API implementation
export const mockApi = {
  // Authentication
  async login(credentials: LoginCredentials): Promise {
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
          expires_in: 604800
        }
      };
    }
    
    throw new Error('Invalid credentials');
  },
  
  async register(data: RegisterData): Promise {
    await mockDelay(800);
    
    if (shouldSimulateError()) {
      throw new Error('Registration failed - please try again');
    }
    
    const user: User = {
      user_id: crypto.randomUUID(),
      email: data.email,
      username: data.username,
      display_name: data.username,
      credits_balance: 10,
      subscription_tier: 'free',
      email_verified: false,
      created_at: new Date().toISOString()
    };
    
    return {
      user,
      tokens: {
        access_token: 'mock-jwt-token-' + Date.now(),
        refresh_token: 'mock-refresh-token-' + Date.now(),
        expires_in: 604800
      }
    };
  },
  
  async logout(): Promise {
    await mockDelay(200);
    // Clear mock session
    sessionStorage.removeItem('mock-token');
  },
  
  // Series endpoints
  async getSeries(): Promise {
    await mockDelay(300);
    
    if (shouldSimulateError()) {
      throw new Error('Failed to fetch series');
    }
    
    return MockDB.series.getAll();
  },
  
  async getSeriesById(seriesId: string): Promise {
    await mockDelay(250);
    
    const series = MockDB.series.getAll().find(s => s.series_id === seriesId);
    if (!series) {
      throw new Error('Series not found');
    }
    
    return series;
  },
  
  async createSeries(data: CreateSeriesData): Promise {
    await mockDelay(500);
    
    const newSeries: Series = {
      series_id: crypto.randomUUID(),
      user_id: 'demo-user-123',
      title: data.title,
      description: data.description,
      genre: data.genre,
      art_style: data.art_style,
      status: 'draft',
      cover_image_url: null,
      tags: data.tags || [],
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return MockDB.series.create(newSeries);
  },
  
  async updateSeries(seriesId: string, updates: Partial): Promise {
    await mockDelay(400);
    return MockDB.series.update(seriesId, updates);
  },
  
  async deleteSeries(seriesId: string): Promise {
    await mockDelay(300);
    MockDB.series.delete(seriesId);
  },
  
  // Episode endpoints
  async getEpisodesBySeriesId(seriesId: string): Promise {
    await mockDelay(300);
    return MockDB.episodes.getBySeriesId(seriesId);
  },
  
  async getEpisodeFull(episodeId: string): Promise {
    await mockDelay(600);
    
    // Check if we have cached data
    const cached = localStorage.getItem(`mock-episode-full-${episodeId}`);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Generate full episode data
    const fullData = generateMockEpisodeFull(episodeId);
    
    // Cache it
    localStorage.setItem(
      `mock-episode-full-${episodeId}`,
      JSON.stringify(fullData)
    );
    
    return fullData;
  },
  
  async createEpisode(seriesId: string, data: CreateEpisodeData): Promise {
    await mockDelay(500);
    
    const episodes = MockDB.episodes.getBySeriesId(seriesId);
    const nextNumber = episodes.length > 0 
      ? Math.max(...episodes.map(e => e.episode_number)) + 1 
      : 1;
    
    const newEpisode: Episode = {
      episode_id: crypto.randomUUID(),
      series_id: seriesId,
      episode_number: nextNumber,
      title: data.title,
      description: data.description,
      script: null,
      status: 'draft',
      thumbnail_url: null,
      page_count: 0,
      published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return MockDB.episodes.create(newEpisode);
  },
  
  // Panel operations
  async updatePanel(panelId: string, updates: Partial): Promise {
    await mockDelay(200);
    
    // Simple update - in production would update in MockDB
    console.log('Mock: Updated panel', panelId, updates);
    
    return {
      panel_id: panelId,
      ...updates
    } as Panel;
  },
  
  // AI Generation
  async createAIJob(input: AIJobInput): Promise {
    await mockDelay(1000);
    
    if (shouldSimulateError()) {
      throw new Error('AI service unavailable');
    }
    
    const jobId = crypto.randomUUID();
    const job: AIJob = {
      job_id: jobId,
      status: 'pending',
      estimated_credits: 1,
      estimated_duration_seconds: 10,
      created_at: new Date().toISOString()
    };
    
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
            steps: 30
          }
        },
        started_at: new Date(Date.now() + 1000).toISOString(),
        finished_at: new Date(Date.now() + 10000).toISOString()
      };
      
      localStorage.setItem(`mock-job-${jobId}`, JSON.stringify(completedJob));
    }, 10000); // Complete after 10 seconds
    
    return job;
  },
  
  async getAIJob(jobId: string): Promise {
    await mockDelay(100);
    
    const stored = localStorage.getItem(`mock-job-${jobId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Still processing - return progress
    return {
      job_id: jobId,
      status: 'processing',
      progress: faker.number.int({ min: 20, max: 80 }),
      started_at: new Date().toISOString()
    };
  },
  
  // Credits
  async getCredits(): Promise {
    await mockDelay(100);
    return { credits_balance: 100 };
  },
  
  async getCreditTransactions(): Promise {
    await mockDelay(200);
    
    // Generate some mock transactions
    return Array.from({ length: 10 }, (_, i) => ({
      tx_id: crypto.randomUUID(),
      user_id: 'demo-user-123',
      amount: faker.helpers.arrayElement([-1, -2, 10, 50]),
      balance_after: 100 - i,
      reason: faker.helpers.arrayElement([
        'panel_generation',
        'monthly_credit',
        'refund',
        'purchase'
      ]),
      created_at: faker.date.recent({ days: 30 }).toISOString()
    }));
  },
  
  // Export
  async createExportJob(episodeId: string, format: 'png' | 'pdf', config: any): Promise {
    await mockDelay(800);
    
    const jobId = crypto.randomUUID();
    
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
    }, 5000);
    
    return {
      export_id: jobId,
      status: 'pending',
      estimated_duration: 5
    };
  },
  
  async getExportJob(exportId: string): Promise {
    await mockDelay(100);
    
    const stored = localStorage.getItem(`mock-export-${exportId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      export_id: exportId,
      status: 'processing',
      progress: faker.number.int({ min: 30, max: 70 })
    };
  }
};
```