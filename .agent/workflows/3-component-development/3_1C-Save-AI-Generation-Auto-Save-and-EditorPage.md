---
description: Component Development Workflows -> Episode Editor save, AI generation & page
---

```typescript
// stores/editorStore.ts (continuation – persistence & AI)
import { create } from 'zustand';
import { api } from '@/lib/api/apiClient';
import toast from 'react-hot-toast';

export const useEditorStore = create<EditorState>((set, get) => ({
  // ...initial state and editing actions from 3.1A & 3.1B

  saveChanges: async () => {
    const state = get();
    if (!state.dirty || state.saving) return;
    
    set({ saving: true });
    
    try {
      console.log('💾 Saving changes...');
      
      // In mock mode, just simulate save
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // In real mode, would send updates to API
      // const updates = collectChanges(state);
      // await api.updateEpisode(state.episode!.episode_id, updates);
      
      set({
        dirty: false,
        saving: false,
        lastSavedAt: new Date().toISOString(),
      });
      
      console.log('✅ Changes saved');
      toast.success('Changes saved');
      
    } catch (error) {
      console.error('❌ Save failed:', error);
      set({ saving: false });
      toast.error('Failed to save changes');
      throw error;
    }
  },
  
  generatePanel: async (panelId: string, input: PanelGenerationInput) => {
    try {
      console.log('🎨 Starting panel generation...');
      toast.loading('Generating panel...', { id: 'gen-toast' });
      
      // Create AI job
      const job = await api.createAIJob({
        job_type: 'panel_generation',
        panel_id: panelId,
        input,
      });
      
      console.log('📋 Job created:', job.job_id);
      
      // Poll for completion
      const maxAttempts = 30;
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        const status = await api.getAIJob(job.job_id);
        console.log(`🔄 Job status: ${status.status}`, status.progress);
        
        if (status.status === 'success') {
          // Update panel with generated image
          get().updatePanel(panelId, {
            image_url: status.result.image_url,
            thumbnail_url: status.result.thumbnail_url,
            generation_prompt: status.result.prompt_used,
          });
          
          console.log('✅ Panel generated successfully');
          toast.success('Panel generated!', { id: 'gen-toast' });
          return;
        }
        
        if (status.status === 'failed') {
          throw new Error('Generation failed');
        }
        
        // Update progress
        if (status.progress) {
          toast.loading(`Generating... ${status.progress}%`, {
            id: 'gen-toast',
          });
        }
        
        attempts++;
      }
      
      throw new Error('Generation timeout');
      
    } catch (error) {
      console.error('❌ Generation failed:', error);
      toast.error('Generation failed', { id: 'gen-toast' });
      throw error;
    }
  },
}));
```

```typescript
// hooks/useAutoSave.ts
import { useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';

export function useAutoSave(delay: number = 5000) {
  const { dirty, saving, saveChanges } = useEditorStore();
  
  useEffect(() => {
    if (!dirty || saving) return;
    
    console.log('⏱️  Auto-save timer started');
    const timer = setTimeout(() => {
      console.log('💾 Auto-saving...');
      saveChanges();
    }, delay);
    
    return () => {
      console.log('⏱️  Auto-save timer cancelled');
      clearTimeout(timer);
    };
  }, [dirty, saving, saveChanges, delay]);
}
```

```typescript
// pages/EditorPage.tsx
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEditorStore } from '@/stores/editorStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { PageList } from '@/components/editor/PageList';
import { PanelCanvas } from '@/components/editor/PanelCanvas';
import { PanelToolbar } from '@/components/editor/PanelToolbar';
import { TextEditor } from '@/components/editor/TextEditor';

export function EditorPage() {
  const { episodeId } = useParams<{ episodeId: string }>();
  const {
    episode,
    pages,
    selectedPanelId,
    loading,
    error,
    loadEpisode,
  } = useEditorStore();
  
  // Enable auto-save
  useAutoSave(5000);
  
  // Load episode on mount
  useEffect(() => {
    if (episodeId) {
      loadEpisode(episodeId);
    }
  }, [episodeId, loadEpisode]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading episode...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => episodeId && loadEpisode(episodeId)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (!episode) {
    return null;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar: Page List */}
      <aside className="w-64 bg-white border-r overflow-y-auto">
        <PageList pages={pages} />
      </aside>
      
      {/* Center: Canvas */}
      <main className="flex-1 flex flex-col">
        <PanelToolbar />
        <div className="flex-1 overflow-hidden">
          <PanelCanvas />
        </div>
      </main>
      
      {/* Right Sidebar: Properties */}
      {selectedPanelId && (
        <aside className="w-80 bg-white border-l overflow-y-auto">
          <TextEditor panelId={selectedPanelId} />
        </aside>
      )}
    </div>
  );
}
```