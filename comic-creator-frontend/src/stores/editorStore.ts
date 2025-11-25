import { create } from 'zustand';
import { api } from '@/lib/api';
import type {
    Episode,
    Page,
    Panel,
    TextElement,
    Character
} from '@/types';

interface EditorState {
    // Episode Data
    episode: Episode | null;
    pages: Page[];
    characters: Character[];

    // Current Selection
    currentPageId: string | null;
    selectedPanelId: string | null;
    selectedTextId: string | null;

    // UI State
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    isDirty: boolean; // Has unsaved changes
    lastSaved: Date | null;

    // Actions
    loadEpisode: (episodeId: string) => Promise<void>;
    saveEpisode: () => Promise<void>;

    // Selection
    selectPage: (pageId: string) => void;
    selectPanel: (panelId: string | null) => void;
    selectText: (textId: string | null) => void;

    // Page Operations
    addPage: () => void;
    deletePage: (pageId: string) => void;

    // Panel Operations
    addPanel: (pageId: string, panel: Omit<Panel, 'panel_id' | 'page_id' | 'created_at' | 'updated_at'>) => void;
    updatePanel: (panelId: string, updates: Partial<Panel>) => void;
    deletePanel: (panelId: string) => void;
    duplicatePanel: (panelId: string) => void;

    // Text Operations
    addText: (panelId: string, text: Omit<TextElement, 'text_id' | 'panel_id' | 'created_at'>) => void;
    addTextToPanel: (panelId: string, type: TextElement['text_type'], bubbleStyle?: string) => void;
    updateText: (textId: string, updates: Partial<TextElement>) => void;
    deleteText: (textId: string) => void;

    // Utility
    clearError: () => void;
    markDirty: () => void;
    getCurrentPage: () => Page | null;
    getCurrentPanel: () => Panel | null;
}

export const useEditorStore = create<EditorState>((set, get) => ({
    // Initial state
    episode: null,
    pages: [],
    characters: [],
    currentPageId: null,
    selectedPanelId: null,
    selectedTextId: null,
    isLoading: false,
    isSaving: false,
    error: null,
    isDirty: false,
    lastSaved: null,

    // Load episode with all nested data
    loadEpisode: async (episodeId: string) => {
        set({ isLoading: true, error: null });

        try {
            console.log('📖 Loading episode:', episodeId);
            const data = await api.getEpisodeFull(episodeId);

            set({
                episode: data.episode,
                pages: data.pages,
                characters: data.characters,
                currentPageId: data.pages[0]?.page_id || null,
                selectedPanelId: null,
                selectedTextId: null,
                isLoading: false,
                isDirty: false,
                error: null
            });

            console.log('✅ Episode loaded:', {
                pages: data.pages.length,
                characters: data.characters.length
            });

        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to load episode';

            console.error('❌ Failed to load episode:', errorMessage);

            set({
                isLoading: false,
                error: errorMessage
            });

            throw error;
        }
    },

    // Save episode changes
    saveEpisode: async () => {
        const { episode, isDirty } = get();

        if (!episode || !isDirty) {
            console.log('ℹ️ No changes to save');
            return;
        }

        set({ isSaving: true, error: null });

        try {
            console.log('💾 Saving episode...');

            // TODO: Implement actual save logic
            // For now, just simulate
            await new Promise(resolve => setTimeout(resolve, 1000));

            set({
                isSaving: false,
                isDirty: false,
                lastSaved: new Date(),
                error: null
            });

            console.log('✅ Episode saved');

        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to save episode';

            console.error('❌ Failed to save:', errorMessage);

            set({
                isSaving: false,
                error: errorMessage
            });

            throw error;
        }
    },

    // Select page
    selectPage: (pageId: string) => {
        set({
            currentPageId: pageId,
            selectedPanelId: null,
            selectedTextId: null
        });
    },

    // Select panel
    selectPanel: (panelId: string | null) => {
        set({
            selectedPanelId: panelId,
            selectedTextId: null
        });
    },

    // Select text
    selectText: (textId: string | null) => {
        set({ selectedTextId: textId });
    },

    // Add new page
    addPage: () => {
        const { episode, pages } = get();
        if (!episode) return;

        const newPage: Page = {
            page_id: crypto.randomUUID(),
            episode_id: episode.episode_id,
            page_number: pages.length + 1,
            layout_type: 'traditional',
            panels: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        set((state) => ({
            pages: [...state.pages, newPage],
            currentPageId: newPage.page_id,
            isDirty: true
        }));

        console.log('📄 Added page:', newPage.page_number);
    },

    // Delete page
    deletePage: (pageId: string) => {
        set((state) => {
            const newPages = state.pages.filter(p => p.page_id !== pageId);

            // Renumber pages
            const renumbered = newPages.map((page, index) => ({
                ...page,
                page_number: index + 1
            }));

            return {
                pages: renumbered,
                currentPageId: renumbered[0]?.page_id || null,
                selectedPanelId: null,
                isDirty: true
            };
        });

        console.log('🗑️  Deleted page:', pageId);
    },

    addPanel: (pageId: string, panelData: any) => {
        const newPanel: Panel = {
            ...panelData,
            panel_id: crypto.randomUUID(),
            page_id: pageId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        set((state) => ({
            pages: state.pages.map(page =>
                page.page_id === pageId
                    ? { ...page, panels: [...page.panels, newPanel] }
                    : page
            ),
            selectedPanelId: newPanel.panel_id,
            isDirty: true
        }));
    },

    // Update panel
    updatePanel: (panelId: string, updates: Partial<Panel>) => {
        set((state) => ({
            pages: state.pages.map(page => ({
                ...page,
                panels: page.panels.map(panel =>
                    panel.panel_id === panelId
                        ? { ...panel, ...updates, updated_at: new Date().toISOString() }
                        : panel
                )
            })),
            isDirty: true
        }));

        console.log('📝 Updated panel:', panelId);
    },

    // Delete panel
    deletePanel: (panelId: string) => {
        set((state) => ({
            pages: state.pages.map(page => ({
                ...page,
                panels: page.panels.filter(p => p.panel_id !== panelId)
            })),
            selectedPanelId: state.selectedPanelId === panelId ? null : state.selectedPanelId,
            isDirty: true
        }));

        console.log('🗑️  Deleted panel:', panelId);
    },

    duplicatePanel: (panelId: string) => {
        const { getCurrentPage } = get();
        const currentPage = getCurrentPage();

        if (!currentPage) return;

        const panel = currentPage.panels.find(p => p.panel_id === panelId);
        if (!panel) return;

        const newPanel: Panel = {
            ...panel,
            panel_id: crypto.randomUUID(),
            panel_number: currentPage.panels.length + 1,
            position: {
                ...panel.position,
                x: panel.position.x + 20,
                y: panel.position.y + 20,
                z_index: currentPage.panels.length + 1
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        set((state) => ({
            pages: state.pages.map(page =>
                page.page_id === currentPage.page_id
                    ? { ...page, panels: [...page.panels, newPanel] }
                    : page
            ),
            selectedPanelId: newPanel.panel_id,
            isDirty: true
        }));
    },

    // Add text element
    addText: (panelId: string, text: Omit<TextElement, 'text_id' | 'panel_id' | 'created_at'>) => {
        const newText: TextElement = {
            ...text,
            text_id: crypto.randomUUID(),
            panel_id: panelId,
            created_at: new Date().toISOString()
        };

        set((state) => ({
            pages: state.pages.map(page => ({
                ...page,
                panels: page.panels.map(panel =>
                    panel.panel_id === panelId
                        ? {
                            ...panel,
                            text_elements: [...(panel.text_elements || []), newText]
                        }
                        : panel
                )
            })),
            selectedTextId: newText.text_id,
            isDirty: true
        }));

        console.log('📝 Added text:', newText.text_id);
    },

    addTextToPanel: (panelId: string, type: TextElement['text_type'], bubbleStyle?: string) => {
        const panel = get().getCurrentPanel();
        if (!panel) return;

        const style = getDefaultStyleForType(type, bubbleStyle);

        const newText: Omit<TextElement, 'text_id' | 'panel_id' | 'created_at'> = {
            text_type: type,
            content: type === 'sfx' ? 'BOOM!' : 'Enter text...',
            position: {
                x: panel.position.width / 2 - 50,
                y: panel.position.height / 2 - 20,
                width: 100,
                height: 40,
            },
            style: style,
        };

        get().addText(panelId, newText);
    },

    // Update text element
    updateText: (textId: string, updates: Partial<TextElement>) => {
        set((state) => ({
            pages: state.pages.map(page => ({
                ...page,
                panels: page.panels.map(panel => ({
                    ...panel,
                    text_elements: panel.text_elements?.map(text =>
                        text.text_id === textId
                            ? { ...text, ...updates }
                            : text
                    )
                }))
            })),
            isDirty: true
        }));

        console.log('📝 Updated text:', textId);
    },

    // Delete text element
    deleteText: (textId: string) => {
        set((state) => ({
            pages: state.pages.map(page => ({
                ...page,
                panels: page.panels.map(panel => ({
                    ...panel,
                    text_elements: panel.text_elements?.filter(t => t.text_id !== textId)
                }))
            })),
            selectedTextId: state.selectedTextId === textId ? null : state.selectedTextId,
            isDirty: true
        }));

        console.log('🗑️  Deleted text:', textId);
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    },

    // Mark as dirty (has unsaved changes)
    markDirty: () => {
        set({ isDirty: true });
    },

    // Get current page
    getCurrentPage: () => {
        const { pages, currentPageId } = get();
        return pages.find(p => p.page_id === currentPageId) || null;
    },

    // Get current panel
    getCurrentPanel: () => {
        const { selectedPanelId } = get();
        const currentPage = get().getCurrentPage();

        if (!currentPage || !selectedPanelId) return null;

        return currentPage.panels.find(p => p.panel_id === selectedPanelId) || null;
    }
}));

function getDefaultStyleForType(type: string, bubbleStyle?: string) {
    if (bubbleStyle === 'thought') {
        return {
            font_family: 'Comic Sans MS',
            font_size: 14,
            color: '#000000',
            font_style: 'italic',
            bubble_style: 'thought',
            bubble_color: '#FFFFFF',
            bubble_border_color: '#000000',
            bubble_border_width: 2,
        };
    }

    switch (type) {
        case 'dialogue':
            return {
                font_family: 'Comic Sans MS',
                font_size: 14,
                color: '#000000',
                bubble_style: 'speech',
                bubble_color: '#FFFFFF',
                bubble_border_color: '#000000',
                bubble_border_width: 2,
                tail_position: 'bottom' as const,
            };
        case 'narration':
            return {
                font_family: 'Georgia',
                font_size: 12,
                color: '#333333',
                bubble_style: 'narration',
                bubble_color: '#FFF9E6',
                bubble_border_color: '#D4A574',
                bubble_border_width: 1,
            };
        case 'sfx':
            return {
                font_family: 'Impact',
                font_size: 24,
                color: '#FF0000',
                bold: true,
                bubble_style: 'sfx',
                bubble_color: 'transparent',
                bubble_border_color: 'transparent',
            };
        default:
            return {
                font_family: 'Arial',
                font_size: 14,
                color: '#000000',
            };
    }
}

// Helper hooks
export const useCurrentPage = () => {
    return useEditorStore((state) => {
        const page = state.pages.find(p => p.page_id === state.currentPageId);
        return page || null;
    });
};

export const useSelectedPanel = () => {
    return useEditorStore((state) => {
        const page = state.pages.find(p => p.page_id === state.currentPageId);
        if (!page || !state.selectedPanelId) return null;

        return page.panels.find(p => p.panel_id === state.selectedPanelId) || null;
    });
};

export const usePanels = () => {
    return useEditorStore((state) => {
        const page = state.pages.find(p => p.page_id === state.currentPageId);
        return page?.panels || [];
    });
};
