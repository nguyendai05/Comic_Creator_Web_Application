import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Undo,
    Redo,
    Eye,
    Settings,
    Loader2,
    Plus,
    AlertCircle
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { PageListItem } from '@/components/editor/PageListItem';
import { PanelCanvas } from '@/components/editor/PanelCanvas';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { AnimatePresence } from 'framer-motion';

export function EditorPage() {
    const { seriesId, episodeId } = useParams<{ seriesId: string; episodeId: string }>();
    const navigate = useNavigate();

    const {
        episode,
        pages,
        currentPageId,
        isLoading,
        isSaving,
        error,
        isDirty,
        lastSaved,
        loadEpisode,
        saveEpisode,
        selectPage,
        addPage,
        deletePage
    } = useEditorStore();

    // Load episode on mount
    useEffect(() => {
        if (episodeId) {
            loadEpisode(episodeId);
        }
    }, [episodeId, loadEpisode]);

    const handleBack = () => {
        if (isDirty) {
            if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
                return;
            }
        }
        navigate(`/series/${seriesId}`);
    };

    const handleSave = async () => {
        try {
            await saveEpisode();
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

    const formatLastSaved = () => {
        if (!lastSaved) return 'Not saved';

        const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
        if (seconds < 60) return 'Saved just now';
        if (seconds < 3600) return `Saved ${Math.floor(seconds / 60)}m ago`;
        return `Saved ${Math.floor(seconds / 3600)}h ago`;
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-white">Loading episode...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-white text-xl font-semibold mb-2">Failed to load episode</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => episodeId && loadEpisode(episodeId)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Retry
                        </button>
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!episode) {
        return null;
    }

    return (
        <div className="h-screen flex flex-col bg-gray-900">
            {/* Top Toolbar */}
            <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title="Back to series"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="h-6 w-px bg-gray-700" />

                    <div>
                        <h1 className="text-white font-medium">{episode.title}</h1>
                        <p className="text-xs text-gray-400">
                            {isDirty ? '● Unsaved changes' : formatLastSaved()}
                        </p>
                    </div>
                </div>

                {/* Center Section - Tools */}
                <div className="flex items-center gap-2">
                    <button
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                        title="Undo"
                        disabled
                    >
                        <Undo className="w-5 h-5" />
                    </button>
                    <button
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                        title="Redo"
                        disabled
                    >
                        <Redo className="w-5 h-5" />
                    </button>

                    <div className="h-6 w-px bg-gray-700 mx-2" />

                    <button
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title="Preview"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !isDirty}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save
                            </>
                        )}
                    </button>

                    <button
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title="Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Page List */}
                <aside className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-white font-medium">Pages</h2>
                            <span className="text-sm text-gray-400">{pages.length}</span>
                        </div>

                        {/* Page List */}
                        <div className="space-y-2 mb-4">
                            <AnimatePresence mode="popLayout">
                                {pages.map((page) => (
                                    <PageListItem
                                        key={page.page_id}
                                        page={page}
                                        isActive={page.page_id === currentPageId}
                                        onSelect={() => selectPage(page.page_id)}
                                        onDelete={() => deletePage(page.page_id)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Add Page Button */}
                        <button
                            onClick={addPage}
                            className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Page
                        </button>
                    </div>
                </aside>

                {/* Center - Canvas Area */}
                <main className="flex-1 bg-gray-900 overflow-hidden">
                    <PanelCanvas />
                </main>

                {/* Right Sidebar - Properties */}
                <aside className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
                    <PropertiesPanel />
                </aside>
            </div>
        </div>
    );
}
