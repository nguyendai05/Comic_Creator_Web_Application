---
description: Export-and-AutoSave -> Implementation Steps 1,2
---

## 🎯 Implementation Steps 1,2

### Step 1: Create useAutoSave Hook

```typescript
// File: src/hooks/useAutoSave.ts

import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/stores/editorStore';

interface UseAutoSaveOptions {
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave(options: UseAutoSaveOptions = {}) {
  const { delay = 5000, enabled = true } = options;
  
  const { isDirty, isSaving, saveEpisode, episode } = useEditorStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Don't auto-save if disabled, not dirty, already saving, or no episode
    if (!enabled || !isDirty || isSaving || !episode) {
      return;
    }
    
    console.log('⏱️ Auto-save timer started');
    
    timerRef.current = setTimeout(async () => {
      console.log('💾 Auto-saving...');
      try {
        await saveEpisode();
        console.log('✅ Auto-save complete');
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
      }
    }, delay);
    
    return () => {
      if (timerRef.current) {
        console.log('⏱️ Auto-save timer cancelled');
        clearTimeout(timerRef.current);
      }
    };
  }, [isDirty, isSaving, enabled, delay, saveEpisode, episode]);
  
  // Return control functions
  return {
    cancelAutoSave: () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    },
  };
}
```

### Step 2: Create SaveIndicator Component

```typescript
// File: src/components/editor/SaveIndicator.tsx

import { Check, Loader2, AlertCircle, Circle } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';

export function SaveIndicator() {
  const { isDirty, isSaving, lastSaved, error, saveEpisode } = useEditorStore();
  
  const formatTimeAgo = (date: Date | null) => {
    if (!date) return '';
    
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };
  
  // Error state
  if (error) {
    return (
      <button
        onClick={() => saveEpisode()}
        className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
      >
        <AlertCircle className="w-4 h-4" />
        <span className="text-xs">Save failed - click to retry</span>
      </button>
    );
  }
  
  // Saving state
  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-xs">Saving...</span>
      </div>
    );
  }
  
  // Unsaved changes
  if (isDirty) {
    return (
      <div className="flex items-center gap-2 text-yellow-400">
        <Circle className="w-2 h-2 fill-yellow-400" />
        <span className="text-xs">Unsaved changes</span>
      </div>
    );
  }
  
  // Saved state
  return (
    <div className="flex items-center gap-2 text-green-400">
      <Check className="w-4 h-4" />
      <span className="text-xs">
        Saved {formatTimeAgo(lastSaved)}
      </span>
    </div>
  );
}
```