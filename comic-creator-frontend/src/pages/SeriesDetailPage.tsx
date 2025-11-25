import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  BookOpen,
  Calendar,
  Tag,
  FileText
} from 'lucide-react';
import { useSeriesStore } from '@/stores/seriesStore';
import { EpisodeCard } from '@/components/series/EpisodeCard';
import { AnimatePresence } from 'framer-motion';

export function SeriesDetailPage() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const navigate = useNavigate();

  const {
    currentSeries,
    episodes,
    isLoading,
    fetchSeriesById,
    fetchEpisodes,
    createEpisode
  } = useSeriesStore();

  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (seriesId) {
      fetchSeriesById(seriesId);
      fetchEpisodes(seriesId);
    }
  }, [seriesId, fetchSeriesById, fetchEpisodes]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleCreateEpisode = async () => {
    if (!seriesId) return;

    setIsCreating(true);
    try {
      const newEpisode = await createEpisode(seriesId, {
        title: `Chapter ${episodes.length + 1}`,
        description: ''
      });

      navigate(`/series/${seriesId}/episode/${newEpisode.episode_id}/edit`);
    } catch (error) {
      console.error('Failed to create episode:', error);
      alert('Failed to create episode');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading && !currentSeries) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentSeries) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Series not found</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {currentSeries.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentSeries.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : currentSeries.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {currentSeries.status}
                </span>
              </div>

              {currentSeries.description && (
                <p className="text-gray-600 mb-4 max-w-3xl">
                  {currentSeries.description}
                </p>
              )}

              <div className="flex items-center gap-6 text-sm text-gray-500">
                {currentSeries.genre && (
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    <span className="capitalize">{currentSeries.genre}</span>
                  </div>
                )}
                {currentSeries.art_style && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="capitalize">{currentSeries.art_style.base}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Updated {new Date(currentSeries.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Episodes</h2>
            <p className="text-gray-600">
              {episodes.length} {episodes.length === 1 ? 'episode' : 'episodes'}
            </p>
          </div>

          <button
            onClick={handleCreateEpisode}
            disabled={isCreating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            {isCreating ? 'Creating...' : 'New Episode'}
          </button>
        </div>

        {episodes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No episodes yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first episode to start working on your comic
            </p>
            <button
              onClick={handleCreateEpisode}
              disabled={isCreating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              {isCreating ? 'Creating...' : 'Create First Episode'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {episodes.map((episode) => (
                <EpisodeCard
                  key={episode.episode_id}
                  episode={episode}
                  seriesId={seriesId!}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
