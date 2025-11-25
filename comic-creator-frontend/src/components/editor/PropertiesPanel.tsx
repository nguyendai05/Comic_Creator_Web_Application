import { useEditorStore, useSelectedPanel } from '@/stores/editorStore';
import {
    Square,
    Image as ImageIcon,
    Type,
    Wand2
} from 'lucide-react';

export function PropertiesPanel() {
    const selectedPanel = useSelectedPanel();
    const { updatePanel, selectPanel } = useEditorStore();

    if (!selectedPanel) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400 text-center p-8">
                <div>
                    <Square className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No panel selected</p>
                    <p className="text-xs mt-2">Click a panel on the canvas to edit its properties</p>
                </div>
            </div>
        );
    }

    const { position, panel_type, script_text, generation_prompt } = selectedPanel;

    const handlePositionChange = (field: keyof typeof position, value: number) => {
        updatePanel(selectedPanel.panel_id, {
            position: {
                ...position,
                [field]: value
            }
        });
    };

    const handleTypeChange = (type: string) => {
        updatePanel(selectedPanel.panel_id, {
            panel_type: type as any
        });
    };

    const handleScriptChange = (script: string) => {
        updatePanel(selectedPanel.panel_id, {
            script_text: script
        });
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="p-4 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-white font-medium">Panel Properties</h2>
                    <button
                        onClick={() => selectPanel(null)}
                        className="text-xs text-gray-400 hover:text-white"
                    >
                        Deselect
                    </button>
                </div>

                {/* Panel Info */}
                <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Square className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium">Panel {selectedPanel.panel_number}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                        ID: {selectedPanel.panel_id.slice(0, 8)}...
                    </div>
                </div>

                {/* Panel Type */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Panel Type</label>
                    <select
                        value={panel_type || 'standard'}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                        <option value="standard">Standard</option>
                        <option value="splash">Splash Page</option>
                        <option value="inset">Inset</option>
                    </select>
                </div>

                {/* Position & Size */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Position & Size</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">X</label>
                            <input
                                type="number"
                                value={Math.round(position.x)}
                                onChange={(e) => handlePositionChange('x', parseFloat(e.target.value) || 0)}
                                className="w-full bg-gray-700 text-white rounded px-2 py-1.5 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Y</label>
                            <input
                                type="number"
                                value={Math.round(position.y)}
                                onChange={(e) => handlePositionChange('y', parseFloat(e.target.value) || 0)}
                                className="w-full bg-gray-700 text-white rounded px-2 py-1.5 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Width</label>
                            <input
                                type="number"
                                value={Math.round(position.width)}
                                onChange={(e) => handlePositionChange('width', parseFloat(e.target.value) || 0)}
                                className="w-full bg-gray-700 text-white rounded px-2 py-1.5 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Height</label>
                            <input
                                type="number"
                                value={Math.round(position.height)}
                                onChange={(e) => handlePositionChange('height', parseFloat(e.target.value) || 0)}
                                className="w-full bg-gray-700 text-white rounded px-2 py-1.5 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Script */}
                <div>
                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Type className="w-4 h-4" />
                        Script / Description
                    </label>
                    <textarea
                        value={script_text || ''}
                        onChange={(e) => handleScriptChange(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                        rows={4}
                        placeholder="Describe what happens in this panel..."
                    />
                </div>

                {/* Generation Prompt */}
                {generation_prompt && (
                    <div>
                        <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <Wand2 className="w-4 h-4" />
                            AI Generation Prompt
                        </label>
                        <div className="bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-300 border border-gray-600">
                            {generation_prompt}
                        </div>
                    </div>
                )}

                {/* Image Info */}
                {selectedPanel.image_url && (
                    <div>
                        <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <ImageIcon className="w-4 h-4" />
                            Image
                        </label>
                        <div className="bg-gray-700 rounded-lg p-3">
                            <img
                                src={selectedPanel.thumbnail_url || selectedPanel.image_url}
                                alt="Panel preview"
                                className="w-full h-24 object-cover rounded mb-2"
                            />
                            <button className="w-full py-1.5 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors">
                                Change Image
                            </button>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t border-gray-700">
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        <Wand2 className="w-4 h-4" />
                        Generate with AI
                    </button>
                    <button className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm">
                        Upload Image
                    </button>
                </div>
            </div>
        </div>
    );
}
