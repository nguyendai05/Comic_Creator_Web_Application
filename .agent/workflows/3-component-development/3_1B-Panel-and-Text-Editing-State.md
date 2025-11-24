---
description: Component Development Workflows -> Episode Editor panel & text editing
---

```typescript
// stores/editorStore.ts (continuation – focus on local editing)
import { create } from 'zustand';
import { api } from '@/lib/api/apiClient';
import toast from 'react-hot-toast';

export const useEditorStore = create<EditorState>((set, get) => ({
  // ...initial state and loadEpisode from Workflow 3.1A

  selectPanel: (panelId: string | null) => {
    set({ selectedPanelId: panelId });
  },
  
  updatePanel: (panelId: string, updates: Partial<Panel>) => {
    set((state) => {
      const panel = state.panelsById[panelId];
      if (!panel) return state;
      
      return {
        panelsById: {
          ...state.panelsById,
          [panelId]: { ...panel, ...updates },
        },
        dirty: true,
      };
    });
  },
  
  addPage: () => {
    const state = get();
    if (!state.episode) return;
    
    const newPageNumber = state.pages.length + 1;
    
    const newPage: Page = {
      page_id: crypto.randomUUID(),
      episode_id: state.episode.episode_id,
      page_number: newPageNumber,
      layout_type: 'traditional',
      layout_data: { columns: 2, gutter: 10 },
      panels: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    set((state) => ({
      pages: [...state.pages, newPage],
      dirty: true,
    }));
    
    toast.success('Page added');
  },
  
  addPanel: (pageId: string) => {
    const state = get();
    const page = state.pages.find((p) => p.page_id === pageId);
    if (!page || !state.episode) return;
    
    const newPanelNumber = page.panels.length + 1;
    
    const newPanel: Panel = {
      panel_id: crypto.randomUUID(),
      page_id: pageId,
      panel_number: newPanelNumber,
      panel_type: 'standard',
      position: {
        x: ((newPanelNumber - 1) % 2) * 50,
        y: Math.floor((newPanelNumber - 1) / 2) * 50,
        width: 50,
        height: 50,
        z_index: newPanelNumber,
      },
      image_url: null,
      thumbnail_url: null,
      generation_prompt: null,
      generation_config: null,
      script_text: null,
      text_elements: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    set((state) => ({
      panelsById: {
        ...state.panelsById,
        [newPanel.panel_id]: newPanel,
      },
      pages: state.pages.map((p) =>
        p.page_id === pageId ? { ...p, panels: [...p.panels, newPanel] } : p,
      ),
      dirty: true,
    }));
    
    toast.success('Panel added');
  },
  
  addTextElement: (panelId: string, element: Omit<TextElement, 'text_id'>) => {
    const textId = crypto.randomUUID();
    
    const newElement: TextElement = {
      ...element,
      text_id: textId,
      panel_id: panelId,
      created_at: new Date().toISOString(),
    };
    
    set((state) => ({
      textElementsById: {
        ...state.textElementsById,
        [textId]: newElement,
      },
      panelsById: {
        ...state.panelsById,
        [panelId]: {
          ...state.panelsById[panelId],
          text_elements: [
            ...(state.panelsById[panelId].text_elements || []),
            newElement,
          ],
        },
      },
      dirty: true,
    }));
    
    toast.success('Text added');
  },
  
  updateTextElement: (textId: string, updates: Partial<TextElement>) => {
    set((state) => {
      const element = state.textElementsById[textId];
      if (!element) return state;
      
      const updated = { ...element, ...updates };
      
      return {
        textElementsById: {
          ...state.textElementsById,
          [textId]: updated,
        },
        panelsById: {
          ...state.panelsById,
          [element.panel_id]: {
            ...state.panelsById[element.panel_id],
            text_elements: state.panelsById[element.panel_id].text_elements?.map(
              (te) => (te.text_id === textId ? updated : te),
            ),
          },
        },
        dirty: true,
      };
    });
  },
  
  deleteTextElement: (textId: string) => {
    set((state) => {
      const element = state.textElementsById[textId];
      if (!element) return state;
      
      const { [textId]: _, ...restElements } = state.textElementsById;
      
      return {
        textElementsById: restElements,
        panelsById: {
          ...state.panelsById,
          [element.panel_id]: {
            ...state.panelsById[element.panel_id],
            text_elements: state.panelsById[
              element.panel_id
            ].text_elements?.filter((te) => te.text_id !== textId),
          },
        },
        dirty: true,
      };
    });
    
    toast.success('Text deleted');
  },

  // saveChanges & generatePanel are added in Workflow 3.1C
}));
```