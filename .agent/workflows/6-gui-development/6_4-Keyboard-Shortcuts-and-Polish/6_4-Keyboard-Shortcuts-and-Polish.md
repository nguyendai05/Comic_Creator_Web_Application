---
description: Phase 6.4 - Keyboard Shortcuts & Polish
priority: LOW - Enhancement
estimated_time: 2 hours
depends_on: Phase 6.1, 6.2, 6.3
---

# Phase 6.4: Keyboard Shortcuts & Polish

## 📊 Current State Analysis

### ✅ Already Implemented
- Basic editor functionality
- Panel/Text selection
- CRUD operations
- Save functionality

### ❌ Missing Features
1. Keyboard shortcuts
2. Smooth animations
3. Loading states/skeletons
4. Better visual feedback

---

## 🎯 Implementation Steps

### Step 1: Create useKeyboardShortcuts Hook

```typescript
// File: src/hooks/useKeyboardShortcuts.ts

import { useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import toast from 'react-hot-toast';

export function useKeyboardShortcuts() {
  const {
    selectedPanelId,
    selectedTextId,
    deletePanel,
    deleteText,
    duplicatePanel,
    selectPanel,
    selectText,
    saveEpisode,
    episode,
  } = useEditorStore();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      
      const isMod = e.metaKey || e.ctrlKey;
      
      // Ctrl/Cmd + S - Save
      if (isMod && e.key === 's') {
        e.preventDefault();
        if (episode) {
          saveEpisode();
          toast.success('Saved!', { duration: 1500 });
        }
        return;
      }
      
      // Delete/Backspace - Delete selected item
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedTextId) {
          deleteText(selectedTextId);
          selectText(null);
          toast.success('Text deleted', { duration: 1500 });
        } else if (selectedPanelId) {
          const confirmDelete = window.confirm('Delete this panel?');
          if (confirmDelete) {
            deletePanel(selectedPanelId);
            selectPanel(null);
            toast.success('Panel deleted', { duration: 1500 });
          }
        }
        return;
      }
      
      // Ctrl/Cmd + D - Duplicate panel
      if (isMod && e.key === 'd') {
        e.preventDefault();
        if (selectedPanelId) {
          duplicatePanel(selectedPanelId);
          toast.success('Panel duplicated', { duration: 1500 });
        }
        return;
      }
      
      // Escape - Deselect
      if (e.key === 'Escape') {
        if (selectedTextId) {
          selectText(null);
        } else if (selectedPanelId) {
          selectPanel(null);
        }
        return;
      }
      
      // Arrow keys - Nudge position (when panel/text selected)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedPanelId || selectedTextId) {
          e.preventDefault();
          const nudge = e.shiftKey ? 10 : 1;
          const delta = {
            ArrowUp: { x: 0, y: -nudge },
            ArrowDown: { x: 0, y: nudge },
            ArrowLeft: { x: -nudge, y: 0 },
            ArrowRight: { x: nudge, y: 0 },
          }[e.key];
          
          if (delta) {
            if (selectedTextId) {
              const { updateText } = useEditorStore.getState();
              // Get current text position and update
              // This would need access to current text element
            } else if (selectedPanelId) {
              const { updatePanel, pages, currentPageId } = useEditorStore.getState();
              const currentPage = pages.find(p => p.page_id === currentPageId);
              const panel = currentPage?.panels.find(p => p.panel_id === selectedPanelId);
              
              if (panel) {
                updatePanel(selectedPanelId, {
                  position: {
                    ...panel.position,
                    x: panel.position.x + delta.x,
                    y: panel.position.y + delta.y,
                  },
                });
              }
            }
          }
        }
        return;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedPanelId,
    selectedTextId,
    episode,
    deletePanel,
    deleteText,
    duplicatePanel,
    selectPanel,
    selectText,
    saveEpisode,
  ]);
}
```

### Step 2: Create KeyboardShortcutsHelp Component

```typescript
// File: src/components/editor/KeyboardShortcutsHelp.tsx

import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['Ctrl/⌘', 'S'], action: 'Save' },
  { keys: ['Ctrl/⌘', 'D'], action: 'Duplicate panel' },
  { keys: ['Delete'], action: 'Delete selected' },
  { keys: ['Escape'], action: 'Deselect' },
  { keys: ['Arrow Keys'], action: 'Nudge position (1px)' },
  { keys: ['Shift', 'Arrow'], action: 'Nudge position (10px)' },
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        title="Keyboard Shortcuts"
      >
        <Keyboard className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {SHORTCUTS.map(({ keys, action }, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-gray-300">{action}</span>
                    <div className="flex gap-1">
                      {keys.map((key, j) => (
                        <span key={j}>
                          <kbd className="px-2 py-1 bg-gray-700 text-gray-200 rounded text-sm font-mono">
                            {key}
                          </kbd>
                          {j < keys.length - 1 && (
                            <span className="text-gray-500 mx-1">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

### Step 3: Add Loading Skeleton for Canvas

```typescript
// File: src/components/editor/CanvasSkeleton.tsx

import { motion } from 'framer-motion';

export function CanvasSkeleton() {
  return (
    <div className="h-full flex items-center justify-center bg-gray-900">
      <div className="w-[600px] h-[800px] bg-gray-800 rounded-lg overflow-hidden relative">
        {/* Skeleton panels */}
        <motion.div
          className="absolute top-8 left-8 w-[250px] h-[200px] bg-gray-700 rounded"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
        <motion.div
          className="absolute top-8 right-8 w-[250px] h-[200px] bg-gray-700 rounded"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
        />
        <motion.div
          className="absolute top-[240px] left-8 right-8 h-[250px] bg-gray-700 rounded"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
        />
        <motion.div
          className="absolute bottom-8 left-8 w-[180px] h-[180px] bg-gray-700 rounded"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }}
        />
        <motion.div
          className="absolute bottom-8 left-[220px] w-[180px] h-[180px] bg-gray-700 rounded"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.8 }}
        />
        
        {/* Loading text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
            <p className="text-gray-400">Loading canvas...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Add Smooth Animations to Components

```typescript
// Update PanelShape.tsx - Add selection animation
// Wrap the Group in motion from framer-motion

import { motion } from 'framer-motion';

// In render, add animation wrapper:
<motion.div
  initial={false}
  animate={{
    scale: isSelected ? 1 : 1,
    boxShadow: isSelected 
      ? '0 0 0 3px rgba(59, 130, 246, 0.5)'
      : 'none',
  }}
  transition={{ duration: 0.15 }}
>
  {/* Group content */}
</motion.div>
```

```typescript
// Update PageListItem.tsx - Add hover/selection animation

import { motion } from 'framer-motion';

export function PageListItem({ page, isActive, onSelect, onDelete }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`...`}
      onClick={onSelect}
    >
      {/* Content */}
    </motion.div>
  );
}
```

### Step 5: Add Toast Notifications Styling

```typescript
// File: src/lib/toastConfig.ts

import toast, { Toaster } from 'react-hot-toast';

export const toastConfig = {
  style: {
    background: '#1F2937',
    color: '#fff',
    borderRadius: '8px',
    border: '1px solid #374151',
  },
  success: {
    iconTheme: {
      primary: '#10B981',
      secondary: '#fff',
    },
  },
  error: {
    iconTheme: {
      primary: '#EF4444',
      secondary: '#fff',
    },
  },
};

// Add to App.tsx:
// <Toaster position="bottom-right" toastOptions={toastConfig} />
```

### Step 6: Update EditorPage to Use Shortcuts

```typescript
// File: src/pages/EditorPage.tsx
// Add import:
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '@/components/editor/KeyboardShortcutsHelp';

// Inside EditorPage:
useKeyboardShortcuts();

// Add to header toolbar:
<KeyboardShortcutsHelp />
```

### Step 7: Update hooks/index.ts

```typescript
// File: src/hooks/index.ts

export { useAutoSave } from './useAutoSave';
export { useKeyboardShortcuts } from './useKeyboardShortcuts';
```

---

## 📋 Testing Checklist

### Keyboard Shortcuts
- [ ] Ctrl+S → saves episode
- [ ] Delete → deletes selected panel/text
- [ ] Ctrl+D → duplicates panel
- [ ] Escape → deselects
- [ ] Arrow keys → nudges position
- [ ] Shift+Arrow → nudges 10px
- [ ] Shortcuts don't trigger when typing in inputs

### Visual Polish
- [ ] Panel selection has smooth animation
- [ ] Page list items animate on add/remove
- [ ] Toast notifications styled correctly
- [ ] Loading skeleton appears when loading
- [ ] Keyboard shortcuts help accessible

---

## 🔗 Dependencies

This phase depends on:
- All previous phases completed
- framer-motion installed
- react-hot-toast installed

This phase completes:
- Full editor polish
- Professional UX
