import type { Series, Episode, EpisodeFullResponse } from '@/types';
import {
    generateMockSeriesList,
    generateMockEpisode
} from './generators';

class MockDatabase {
    /**
     * Get items from localStorage
     */
    private getItem<T>(key: string): T[] {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Set items in localStorage
     */
    private setItem<T>(key: string, value: T[]): void {
        localStorage.setItem(key, JSON.stringify(value));
    }

    // ============================================
    // SERIES OPERATIONS
    // ============================================

    series = {
        getAll: (): Series[] => {
            return this.getItem<Series>('mock-series');
        },

        getById: (id: string): Series | undefined => {
            return this.getItem<Series>('mock-series').find(s => s.series_id === id);
        },

        create: (series: Series): Series => {
            const all = this.getItem<Series>('mock-series');
            all.push(series);
            this.setItem('mock-series', all);
            return series;
        },

        update: (id: string, updates: Partial<Series>): Series => {
            const all = this.getItem<Series>('mock-series');
            const index = all.findIndex(s => s.series_id === id);
            if (index === -1) throw new Error('Series not found');

            all[index] = {
                ...all[index],
                ...updates,
                updated_at: new Date().toISOString()
            };
            this.setItem('mock-series', all);
            return all[index];
        },

        delete: (id: string): void => {
            const all = this.getItem<Series>('mock-series');
            this.setItem('mock-series', all.filter(s => s.series_id !== id));

            // Also delete associated episodes
            const episodes = this.getItem<Episode>('mock-episodes');
            this.setItem('mock-episodes', episodes.filter(e => e.series_id !== id));
        }
    };

    // ============================================
    // EPISODE OPERATIONS
    // ============================================

    episodes = {
        getAll: (): Episode[] => {
            return this.getItem<Episode>('mock-episodes');
        },

        getBySeriesId: (seriesId: string): Episode[] => {
            return this.getItem<Episode>('mock-episodes')
                .filter(e => e.series_id === seriesId)
                .sort((a, b) => a.episode_number - b.episode_number);
        },

        getById: (id: string): Episode | undefined => {
            return this.getItem<Episode>('mock-episodes').find(e => e.episode_id === id);
        },

        create: (episode: Episode): Episode => {
            const all = this.getItem<Episode>('mock-episodes');
            all.push(episode);
            this.setItem('mock-episodes', all);
            return episode;
        },

        update: (id: string, updates: Partial<Episode>): Episode => {
            const all = this.getItem<Episode>('mock-episodes');
            const index = all.findIndex(e => e.episode_id === id);
            if (index === -1) throw new Error('Episode not found');

            all[index] = {
                ...all[index],
                ...updates,
                updated_at: new Date().toISOString()
            };
            this.setItem('mock-episodes', all);
            return all[index];
        },

        delete: (id: string): void => {
            const all = this.getItem<Episode>('mock-episodes');
            this.setItem('mock-episodes', all.filter(e => e.episode_id !== id));

            // Also delete full episode data
            this.episodeFull.delete(id);
        }
    };

    // ============================================
    // EPISODE FULL (with pages, panels, etc.)
    // ============================================

    episodeFull = {
        get: (id: string): EpisodeFullResponse | null => {
            const stored = localStorage.getItem(`mock-episode-full-${id}`);
            if (stored) return JSON.parse(stored);
            return null;
        },

        set: (id: string, data: EpisodeFullResponse): void => {
            localStorage.setItem(`mock-episode-full-${id}`, JSON.stringify(data));
        },

        delete: (id: string): void => {
            localStorage.removeItem(`mock-episode-full-${id}`);
        }
    };

    // ============================================
    // DATABASE MANAGEMENT
    // ============================================

    /**
     * Initialize database with sample data if empty
     */
    initialize(): void {
        // Check if running in browser environment
        if (typeof window === 'undefined' || !window.localStorage) return;

        const initialized = localStorage.getItem('mock-initialized');
        if (!initialized) {
            console.log('🌱 Initializing mock database...');

            // Create 3 sample series
            const series = generateMockSeriesList(3);
            this.setItem('mock-series', series);

            // Create 2 episodes for first series
            const episodes = [
                generateMockEpisode(series[0].series_id, 1),
                generateMockEpisode(series[0].series_id, 2)
            ];
            this.setItem('mock-episodes', episodes);

            localStorage.setItem('mock-initialized', 'true');
            console.log('✅ Mock database initialized with:');
            console.log(`   - ${series.length} series`);
            console.log(`   - ${episodes.length} episodes`);
        } else {
            console.log('ℹ️  Mock database already initialized');
        }
    }

    /**
     * Clear all mock data
     */
    clear(): void {
        console.log('🗑️  Clearing mock database...');

        localStorage.removeItem('mock-series');
        localStorage.removeItem('mock-episodes');
        localStorage.removeItem('mock-initialized');

        // Clear all episode-full and job entries
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('mock-episode-full-') ||
                key.startsWith('mock-job-') ||
                key.startsWith('mock-export-')) {
                localStorage.removeItem(key);
            }
        });

        console.log('✅ Mock database cleared');
    }

    /**
     * Get statistics about mock data
     */
    stats(): { series: number; episodes: number; episodeFull: number } {
        const seriesCount = this.series.getAll().length;
        const episodesCount = this.episodes.getAll().length;

        let episodeFullCount = 0;
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('mock-episode-full-')) {
                episodeFullCount++;
            }
        });

        return {
            series: seriesCount,
            episodes: episodesCount,
            episodeFull: episodeFullCount
        };
    }
}

// Export singleton instance
export const MockDB = new MockDatabase();

// Initialize on module load
MockDB.initialize();
