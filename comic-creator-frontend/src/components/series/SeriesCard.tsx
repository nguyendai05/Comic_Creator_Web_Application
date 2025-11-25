import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Calendar
} from 'lucide-react';
import type { Series } from '@/types';
import { useSeriesStore } from '@/stores/seriesStore';

interface SeriesCardProps {
  series: Series;
  onEdit?: (series: Series) => void;
}

export function SeriesCard({ series, onEdit }: SeriesCardProps) {
  const navigate = useNavigate();
  const { deleteSeries } = useSeriesStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleView = () => {
    navigate(`/series/${series.series_id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(series);
    setShowMenu(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm(`Delete "${series.title}"? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSeries(series.series_id);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete series');
      setIsDeleting(false);
    }
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-shadow hover:shadow-xl"
      onClick={handleView}
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        {series.cover_image_url ? (
          <img
            src={series.cover_image_url}
            alt={series.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(series.status)}`}>
            {series.status}
          </span>
        </div>

        {/* Menu Button */}
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-700" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={handleView}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
          {series.title}
        </h3>

        {/* Description */}
        {series.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {series.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          {series.genre && (
            <span className="px-2 py-1 bg-gray-100 rounded">
              {series.genre}
            </span>
          )}
          {series.art_style && (
            <span className="px-2 py-1 bg-gray-100 rounded">
              {series.art_style.base}
            </span>
          )}
        </div>

        {/* Tags */}
        {series.tags && series.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {series.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {series.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded">
                +{series.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(series.updated_at)}
          </div>
          {series.is_public && (
            <span className="text-xs text-green-600 font-medium">
              Public
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
