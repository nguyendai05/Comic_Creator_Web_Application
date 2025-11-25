---
description: Text System Implementation -> Step 1
---

## 🎯 Implementation Steps 1

### Step 1: Add Text Selection State to EditorStore

```typescript
// File: src/stores/editorStore.ts
// Add to interface EditorState:

interface EditorState {
  // ... existing state
  selectedTextId: string | null;
  
  // ... existing actions
  selectText: (textId: string | null) => void;
  addTextToPanel: (panelId: string, type: TextElement['text_type']) => void;
}

// Add implementations:
selectText: (textId: string | null) => {
  set({ selectedTextId: textId });
},

addTextToPanel: (panelId: string, type: TextElement['text_type']) => {
  const { pages, currentPageId, addText, selectText } = get();
  const currentPage = pages.find(p => p.page_id === currentPageId);
  if (!currentPage) return;
  
  const panel = currentPage.panels.find(p => p.panel_id === panelId);
  if (!panel) return;
  
  const defaultStyles = {
    dialogue: {
      font_family: 'Comic Sans MS',
      font_size: 14,
      color: '#000000',
      bubble_style: 'speech',
      bubble_color: '#FFFFFF',
      bubble_border_color: '#000000',
      bubble_border_width: 2,
    },
    narration: {
      font_family: 'Georgia',
      font_size: 12,
      color: '#333333',
      bubble_style: 'rectangle',
      bubble_color: '#FFF9E6',
      bubble_border_color: '#D4A574',
      bubble_border_width: 1,
    },
    sfx: {
      font_family: 'Impact',
      font_size: 24,
      color: '#FF0000',
      bold: true,
      bubble_style: 'none',
    },
  };
  
  const newText: Omit<TextElement, 'text_id' | 'panel_id' | 'created_at'> = {
    text_type: type,
    content: type === 'sfx' ? 'BOOM!' : 'Enter text...',
    position: {
      x: panel.position.width / 2 - 60,
      y: panel.position.height / 2 - 20,
      width: 120,
      height: 40,
    },
    style: defaultStyles[type],
  };
  
  addText(panelId, newText);
},

// Add helper hook:
export const useSelectedText = () => {
  return useEditorStore((state) => {
    if (!state.selectedTextId) return null;
    
    for (const page of state.pages) {
      for (const panel of page.panels) {
        const text = panel.text_elements?.find(t => t.text_id === state.selectedTextId);
        if (text) return text;
      }
    }
    return null;
  });
};
```