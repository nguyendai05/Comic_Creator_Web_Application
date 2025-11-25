import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Edit,
  Calendar,
  FileText
} from 'lucide-react';
import type { Episode } from '@/types';

interface EpisodeCardProps {
  episode: Episode;
  seriesId: string;
}

export function EpisodeCard({ episode, seriesId }: EpisodeCardProps) {
  const navigate = useNavigate();

  const handleOpenEditor = () => {
    navigate(`/series/${seriesId}/episode/${episode.episode_id}/edit`);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleOpenEditor}
    >
      <div className="flex items-start gap-4">
        <div className="w-24 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex-shrink-0 overflow-hidden">
          {episode.thumbnail_url ? (
            <img
              src={episode.thumbnail_url}
              alt={episode.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-500">
                  Episode {episode.episode_number}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(episode.status)}`}>
                  {episode.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {episode.title}
              </h3>
            </div>
          </div>

          {episode.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {episode.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{episode.page_count} pages</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(episode.updated_at)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenEditor}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>
    </motion.div>
  );
}
