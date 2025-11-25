import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Series, Episode, CreateSeriesData, CreateEpisodeData } from '@/types';

interface SeriesState {
  // State
  series: Series[];
  currentSeries: Series | null;
  episodes: Episode[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSeries: () => Promise<void>;
  fetchSeriesById: (seriesId: string) => Promise<void>;
  createSeries: (data: CreateSeriesData) => Promise<Series>;
  updateSeries: (seriesId: string, updates: Partial<Series>) => Promise<void>;
  deleteSeries: (seriesId: string) => Promise<void>;

  // Episodes
  fetchEpisodes: (seriesId: string) => Promise<void>;
  createEpisode: (seriesId: string, data: CreateEpisodeData) => Promise<Episode>;

  // Utility
  clearError: () => void;
  setCurrentSeries: (series: Series | null) => void;
}

export const useSeriesStore = create<SeriesState>((set) => ({
  // Initial state
  series: [],
  currentSeries: null,
  episodes: [],
  isLoading: false,
  error: null,

  // Fetch all series
  fetchSeries: async () => {
    set({ isLoading: true, error: null });

    try {
      console.log('📚 Fetching all series...');
      const series = await api.getSeries();

      set({
        series,
        isLoading: false,
        error: null
      });

      console.log('✅ Fetched', series.length, 'series');
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to fetch series';

      console.error('❌ Failed to fetch series:', errorMessage);

      set({
        isLoading: false,
        error: errorMessage
      });

      throw error;
    }
  },

  // Fetch single series by ID
  fetchSeriesById: async (seriesId: string) => {
    set({ isLoading: true, error: null });

    try {
      console.log('📖 Fetching series:', seriesId);
      const series = await api.getSeriesById(seriesId);

      set({
        currentSeries: series,
        isLoading: false,
        error: null
      });

      console.log('✅ Fetched series:', series.title);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to fetch series';

      console.error('❌ Failed to fetch series:', errorMessage);

      set({
        isLoading: false,
        error: errorMessage
      });

      throw error;
    }
  },

  // Create new series
  createSeries: async (data: CreateSeriesData) => {
    set({ isLoading: true, error: null });

    try {
      console.log('📝 Creating series:', data.title);
      const newSeries = await api.createSeries(data);

      // Add to series list
      set((state) => ({
        series: [newSeries, ...state.series],
        currentSeries: newSeries,
        isLoading: false,
        error: null
      }));

      console.log('✅ Series created:', newSeries.series_id);
      return newSeries;

    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to create series';

      console.error('❌ Failed to create series:', errorMessage);

      set({
        isLoading: false,
        error: errorMessage
      });

      throw error;
    }
  },

  // Update series
  updateSeries: async (seriesId: string, updates: Partial<Series>) => {
    set({ isLoading: true, error: null });

    try {
      console.log('📝 Updating series:', seriesId);
      const updatedSeries = await api.updateSeries(seriesId, updates);

      // Update in series list
      set((state) => ({
        series: state.series.map(s =>
          s.series_id === seriesId ? updatedSeries : s
        ),
        currentSeries: state.currentSeries?.series_id === seriesId
          ? updatedSeries
          : state.currentSeries,
        isLoading: false,
        error: null
      }));

      console.log('✅ Series updated');

    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to update series';

      console.error('❌ Failed to update series:', errorMessage);

      set({
        isLoading: false,
        error: errorMessage
      });

      throw error;
    }
  },

  // Delete series
  deleteSeries: async (seriesId: string) => {
    set({ isLoading: true, error: null });

    try {
      console.log('🗑️  Deleting series:', seriesId);
      await api.deleteSeries(seriesId);

      // Remove from series list
      set((state) => ({
        series: state.series.filter(s => s.series_id !== seriesId),
        currentSeries: state.currentSeries?.series_id === seriesId
          ? null
          : state.currentSeries,
        isLoading: false,
        error: null
      }));

      console.log('✅ Series deleted');

    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to delete series';

      console.error('❌ Failed to delete series:', errorMessage);

      set({
        isLoading: false,
        error: errorMessage
      });

      throw error;
    }
  },

  // Fetch episodes for a series
  fetchEpisodes: async (seriesId: string) => {
    set({ isLoading: true, error: null });

    try {
      console.log('📚 Fetching episodes for series:', seriesId);
      const episodes = await api.getEpisodesBySeriesId(seriesId);

      set({
        episodes,
        isLoading: false,
        error: null
      });

      console.log('✅ Fetched', episodes.length, 'episodes');

    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to fetch episodes';

      console.error('❌ Failed to fetch episodes:', errorMessage);

      set({
        isLoading: false,
        error: errorMessage
      });

      throw error;
    }
  },

  // Create episode
  createEpisode: async (seriesId: string, data: CreateEpisodeData) => {
    set({ isLoading: true, error: null });

    try {
      console.log('📝 Creating episode:', data.title);
      const newEpisode = await api.createEpisode(seriesId, data);

      // Add to episodes list
      set((state) => ({
        episodes: [...state.episodes, newEpisode],
        isLoading: false,
        error: null
      }));

      console.log('✅ Episode created:', newEpisode.episode_id);
      return newEpisode;

    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to create episode';

      console.error('❌ Failed to create episode:', errorMessage);

      set({
        isLoading: false,
        error: errorMessage
      });

      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Set current series
  setCurrentSeries: (series: Series | null) => {
    set({ currentSeries: series });
  }
}));

// Helper hooks
export const useSeriesList = () => {
  return useSeriesStore((state) => state.series);
};

export const useCurrentSeries = () => {
  return useSeriesStore((state) => state.currentSeries);
};

export const useEpisodesList = () => {
  return useSeriesStore((state) => state.episodes);
};
