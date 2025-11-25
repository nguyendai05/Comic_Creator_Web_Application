import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useSeriesStore } from '@/stores/seriesStore';
import type { Series, CreateSeriesData } from '@/types';

interface SeriesFormDialogProps {
  open: boolean;
  onClose: () => void;
  series?: Series | null;
}

const GENRES = [
  'action', 'comedy', 'drama', 'fantasy', 'sci-fi',
  'romance', 'horror', 'slice-of-life', 'mystery', 'thriller'
];

const ART_STYLES = [
  { value: 'manga', label: 'Manga' },
  { value: 'western', label: 'Western' },
  { value: 'webtoon', label: 'Webtoon' }
];

export function SeriesFormDialog({ open, onClose, series }: SeriesFormDialogProps) {
  const { createSeries, updateSeries, isLoading, error, clearError } = useSeriesStore();

  const isEditMode = !!series;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [artStyle, setArtStyle] = useState<'manga' | 'western' | 'webtoon'>('manga');
  const [tags, setTags] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (series) {
      setTitle(series.title);
      setDescription(series.description || '');
      setGenre(series.genre || '');
      setArtStyle(series.art_style?.base || 'manga');
      setTags(series.tags?.join(', ') || '');
    } else {
      setTitle('');
      setDescription('');
      setGenre('');
      setArtStyle('manga');
      setTags('');
    }
    clearError();
    setValidationError('');
  }, [series, open, clearError]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    clearError();
    setValidationError('');

    if (!title.trim()) {
      setValidationError('Title is required');
      return;
    }

    if (title.length < 3) {
      setValidationError('Title must be at least 3 characters');
      return;
    }

    const data: CreateSeriesData = {
      title: title.trim(),
      description: description.trim() || undefined,
      genre: genre || undefined,
      art_style: {
        base: artStyle,
        color_palette: ['#000000', '#FFFFFF', '#FF0000']
      },
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined
    };

    try {
      if (isEditMode) {
        await updateSeries(series.series_id, data);
      } else {
        await createSeries(data);
      }

      onClose();
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const displayError = validationError || error;

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 animate-in fade-in" />

        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Series' : 'Create New Series'}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="My Awesome Comic"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="A brief description of your series..."
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                  Genre
                </label>
                <select
                  id="genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">Select a genre</option>
                  {GENRES.map((g) => (
                    <option key={g} value={g}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Art Style
                </label>
                <div className="flex gap-3">
                  {ART_STYLES.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => setArtStyle(style.value as any)}
                      className={`flex-1 px-4 py-2 border-2 rounded-lg transition-colors ${
                        artStyle === style.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      disabled={isLoading}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="adventure, mystery, supernatural (comma-separated)"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate tags with commas
                </p>
              </div>

              {displayError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{displayError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEditMode ? 'Update Series' : 'Create Series'
                  )}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
