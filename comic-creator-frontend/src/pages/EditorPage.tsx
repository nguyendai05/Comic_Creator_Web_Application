import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Undo,
  Redo,
  Eye,
  Settings,
  Loader2
} from 'lucide-react';

export function EditorPage() {
  const { seriesId, episodeId } = useParams<{ seriesId: string; episodeId: string }>();
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    console.log('📝 Editor opened:', { seriesId, episodeId });
    // TODO: Load episode data
  }, [seriesId, episodeId]);

  const handleBack = () => {
    navigate(`/series/${seriesId}`);
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));

    setLastSaved(new Date());
    setIsSaving(false);
    console.log('💾 Saved!');
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Not saved';

    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (seconds < 60) return 'Saved just now';
    if (seconds < 3600) return `Saved ${Math.floor(seconds / 60)}m ago`;
    return `Saved ${Math.floor(seconds / 3600)}h ago`;
  };

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
            <h1 className="text-white font-medium">Episode Editor</h1>
            <p className="text-xs text-gray-400">{formatLastSaved()}</p>
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
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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
            <h2 className="text-white font-medium mb-4">Pages</h2>

            {/* Placeholder */}
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((page) => (
                <div
                  key={page}
                  className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors"
                >
                  <div className="aspect-[3/4] bg-gray-600 rounded mb-2 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Page {page}</span>
                  </div>
                  <p className="text-white text-sm">Page {page}</p>
                  <p className="text-gray-400 text-xs">4 panels</p>
                </div>
              ))}
            </div>

            {/* Add Page Button */}
            <button className="w-full mt-4 p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors">
              + Add Page
            </button>
          </div>
        </aside>

        {/* Center - Canvas Area */}
        <main className="flex-1 bg-gray-900 overflow-auto">
          <div className="h-full flex items-center justify-center p-8">
            {/* Canvas Placeholder */}
            <div className="bg-white rounded-lg shadow-2xl" style={{ width: 800, height: 1000 }}>
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-xl mb-2">Canvas Area</p>
                  <p className="text-sm">Panels will be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Properties */}
        <aside className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-white font-medium mb-4">Properties</h2>

            {/* Placeholder */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Panel Type</label>
                <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600">
                  <option>Standard</option>
                  <option>Splash</option>
                  <option>Inset</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="X"
                    className="bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
                  />
                  <input
                    type="number"
                    placeholder="Y"
                    className="bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
                  />
                  <input
                    type="number"
                    placeholder="Width"
                    className="bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
                  />
                  <input
                    type="number"
                    placeholder="Height"
                    className="bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Script</label>
                <textarea
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
                  rows={4}
                  placeholder="Panel description..."
                />
              </div>

              <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Generate with AI
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
