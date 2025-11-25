import { useState } from 'react';
import {
    Plus,
    Trash2,
    Copy,
    Square,
    Maximize,
    Grid3x3,
    MessageSquare
} from 'lucide-react';
import { useEditorStore, useCurrentPage } from '@/stores/editorStore';
import { TextTypePicker } from './TextTypePicker';

export function PanelToolbar() {
    const currentPage = useCurrentPage();
    const [showTextTypePicker, setShowTextTypePicker] = useState(false);
    const { selectedPanelId, deletePanel, addTextToPanel } = useEditorStore();

    const selectedPanel = currentPage?.panels.find(p => p.panel_id === selectedPanelId);

    const handleAddPanel = (template?: 'small' | 'medium' | 'large' | 'splash') => {
        if (!currentPage) return;

        const templates = {
            small: { width: 200, height: 200 },
            medium: { width: 300, height: 300 },
            large: { width: 400, height: 400 },
            splash: { width: 760, height: 560 }
        };

        const size = templates[template || 'medium'];
        const existingPanels = currentPage.panels;
        const offset = (existingPanels.length % 4) * 20;

        useEditorStore.getState().addPanel(currentPage.page_id, {
            panel_number: existingPanels.length + 1,
            panel_type: template === 'splash' ? 'splash' : 'standard',
            position: {
                x: 50 + offset,
                y: 100 + offset,
                width: size.width,
                height: size.height,
                z_index: existingPanels.length + 1
            },
            image_url: undefined,
            thumbnail_url: undefined,
            generation_prompt: undefined,
            script_text: '',
            text_elements: []
        });
    };

    const handleDeletePanel = () => {
        if (!selectedPanel) return;

        if (confirm(`Delete panel ${selectedPanel.panel_number}?`)) {
            deletePanel(selectedPanel.panel_id);
            console.log('🗑️  Deleted panel:', selectedPanel.panel_id);
        }
    };

    const handleDuplicatePanel = () => {
        if (!selectedPanel) return;
        useEditorStore.getState().duplicatePanel(selectedPanel.panel_id);
    };

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-2 flex items-center gap-2 z-10">
            {/* Add Panel Dropdown */}
            <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Panel
                </button>

                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <button
                        onClick={() => handleAddPanel('small')}
                        className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                    >
                        <Square className="w-4 h-4" />
                        Small (200×200)
                    </button>
                    <button
                        onClick={() => handleAddPanel('medium')}
                        className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                    >
                        <Grid3x3 className="w-4 h-4" />
                        Medium (300×300)
                    </button>
                    <button
                        onClick={() => handleAddPanel('large')}
                        className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                    >
                        <Square className="w-4 h-4" />
                        Large (400×400)
                    </button>
                    <div className="border-t border-gray-700 my-1" />
                    <button
                        onClick={() => handleAddPanel('splash')}
                        className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                    >
                        <Maximize className="w-4 h-4" />
                        Splash Page
                    </button>
                </div>
            </div>

            <div className="h-6 w-px bg-gray-700" />

            {/* Add Text Button */}
            <div className="relative">
                <button
                    onClick={() => setShowTextTypePicker(!showTextTypePicker)}
                    disabled={!selectedPanelId}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    title="Add Text"
                >
                    <MessageSquare className="w-4 h-4" />
                    Add Text
                </button>

                {showTextTypePicker && selectedPanelId && (
                    <TextTypePicker
                        onSelect={(type, bubbleStyle) => {
                            addTextToPanel(selectedPanelId, type, bubbleStyle);
                            setShowTextTypePicker(false);
                        }}
                        onClose={() => setShowTextTypePicker(false)}
                    />
                )}
            </div>

            <div className="h-6 w-px bg-gray-700" />

            {/* Delete Panel */}
            <button
                onClick={handleDeletePanel}
                disabled={!selectedPanel}
                className="px-3 py-2 bg-gray-700 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Delete selected panel"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            {/* Duplicate Panel */}
            <button
                onClick={handleDuplicatePanel}
                disabled={!selectedPanel}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Duplicate selected panel"
            >
                <Copy className="w-4 h-4" />
            </button>

            {/* Panel Count */}
            <div className="ml-2 px-3 py-2 bg-gray-900 rounded text-sm text-gray-400">
                {currentPage?.panels.length || 0} panels
            </div>
        </div>
    );
}
