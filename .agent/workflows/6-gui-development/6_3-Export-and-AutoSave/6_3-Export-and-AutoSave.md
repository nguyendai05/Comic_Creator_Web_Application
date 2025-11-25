---
description: Phase 6.3 - Export Dialog & Auto-Save System
---

# Phase 6.3: Export Dialog & Auto-Save System

## 📊 Current State Analysis

### ✅ Already Implemented
- `mockApi.ts`: `createExportJob()`, `getExportJob()` với simulation
- `editorStore.ts`: `saveEpisode()`, `isDirty`, `isSaving`, `lastSaved` state
- `EditorPage.tsx`: Manual save button với loading state
- `types/index.ts`: `ExportJob` interface

### ❌ Missing Components
1. `ExportDialog.tsx` - Modal for export options
2. `useAutoSave.ts` - Hook for auto-save functionality
3. `SaveIndicator.tsx` - Visual indicator for save status
4. Export button in EditorPage header

---

## 🎯 Implementation Steps

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

### Step 3: Create ExportDialog Component

```typescript
// File: src/components/editor/ExportDialog.tsx

import { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  FileImage,
  FileText,
  Archive,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { Episode, Page, ExportJob } from '@/types';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  episode: Episode;
  pages: Page[];
}

type ExportFormat = 'pdf' | 'png' | 'zip';
type PageRange = 'all' | 'current' | 'custom';

export function ExportDialog({
  isOpen,
  onClose,
  episode,
  pages,
}: ExportDialogProps) {
  // Options state
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [pageRange, setPageRange] = useState<PageRange>('all');
  const [customRange, setCustomRange] = useState('');
  const [includeText, setIncludeText] = useState(true);
  const [highRes, setHighRes] = useState(false);
  
  // Export state
  const [step, setStep] = useState<'options' | 'exporting' | 'complete' | 'error'>('options');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);
  
  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStep('options');
      setProgress(0);
      setDownloadUrl(null);
      setError(null);
    }
  }, [isOpen]);
  
  const handleExport = async () => {
    setStep('exporting');
    setProgress(0);
    setError(null);
    
    try {
      const exportConfig = {
        page_range: pageRange,
        custom_pages: pageRange === 'custom' ? customRange : undefined,
        include_text: includeText,
        high_res: highRes,
        dpi: highRes ? 300 : 150,
      };
      
      const job = await api.createExportJob(episode.episode_id, format, exportConfig);
      console.log('📦 Export job created:', job.export_id);
      
      // Poll for completion
      pollIntervalRef.current = setInterval(async () => {
        try {
          const status = await api.getExportJob(job.export_id);
          
          if (status.progress) {
            setProgress(status.progress);
          }
          
          if (status.status === 'success' && status.result_url) {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
            }
            setDownloadUrl(status.result_url);
            setProgress(100);
            setStep('complete');
          } else if (status.status === 'failed') {
            throw new Error(status.error_message || 'Export failed');
          }
        } catch (err) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setError(err instanceof Error ? err.message : 'Export failed');
          setStep('error');
        }
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start export');
      setStep('error');
    }
  };
  
  const handleDownload = () => {
    if (downloadUrl) {
      // In real app, would trigger download
      // For mock, just log
      console.log('📥 Downloading:', downloadUrl);
      window.open(downloadUrl, '_blank');
    }
  };
  
  const handleReset = () => {
    setStep('options');
    setProgress(0);
    setDownloadUrl(null);
    setError(null);
  };
  
  const getFormatIcon = (f: ExportFormat) => {
    switch (f) {
      case 'pdf': return FileText;
      case 'png': return FileImage;
      case 'zip': return Archive;
    }
  };
  
  const estimatedSize = () => {
    const pageCount = pageRange === 'all' ? pages.length : pageRange === 'current' ? 1 : 
      customRange.split(',').reduce((acc, part) => {
        const [start, end] = part.split('-').map(Number);
        return acc + (end ? end - start + 1 : 1);
      }, 0);
    
    const baseSize = highRes ? 2.5 : 1;
    return (pageCount * baseSize).toFixed(1);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Export Episode</h2>
          </div>
          <button
            onClick={onClose}
            disabled={step === 'exporting'}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {step === 'options' && (
            <div className="space-y-5">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['pdf', 'png', 'zip'] as ExportFormat[]).map((f) => {
                    const Icon = getFormatIcon(f);
                    return (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                          format === f
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm uppercase">{f}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Page Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Page Range
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={pageRange === 'all'}
                      onChange={() => setPageRange('all')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-white">All pages ({pages.length})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={pageRange === 'current'}
                      onChange={() => setPageRange('current')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-white">Current page only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={pageRange === 'custom'}
                      onChange={() => setPageRange('custom')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-white">Custom range</span>
                  </label>
                  {pageRange === 'custom' && (
                    <input
                      type="text"
                      value={customRange}
                      onChange={(e) => setCustomRange(e.target.value)}
                      placeholder="e.g., 1-5, 7, 9-12"
                      className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 text-sm ml-6"
                    />
                  )}
                </div>
              </div>
              
              {/* Options */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeText}
                    onChange={(e) => setIncludeText(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-white">Include text elements</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highRes}
                    onChange={(e) => setHighRes(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-white">High resolution (300 DPI)</span>
                </label>
              </div>
              
              {/* Estimated Size */}
              <div className="p-3 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-400">
                  Estimated file size: <span className="text-white font-medium">{estimatedSize()} MB</span>
                </p>
              </div>
            </div>
          )}
          
          {step === 'exporting' && (
            <div className="py-8 text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-white font-medium mb-2">Exporting...</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400">{progress}% complete</p>
            </div>
          )}
          
          {step === 'complete' && (
            <div className="py-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">Export Complete!</p>
              <p className="text-sm text-gray-400 mb-4">
                {episode.title}.{format}
              </p>
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          )}
          
          {step === 'error' && (
            <div className="py-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">Export Failed</p>
              <p className="text-sm text-red-400 mb-4">{error}</p>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {step === 'options' && (
          <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        )}
        
        {(step === 'complete' || step === 'error') && (
          <div className="px-6 py-4 border-t border-gray-700 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Step 4: Update EditorPage with Auto-Save and Export

```typescript
// File: src/pages/EditorPage.tsx
// Add imports:
import { Download } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { SaveIndicator } from '@/components/editor/SaveIndicator';
import { ExportDialog } from '@/components/editor/ExportDialog';

// Inside EditorPage component:
const [showExportDialog, setShowExportDialog] = useState(false);

// Enable auto-save
useAutoSave({ delay: 5000, enabled: true });

// Update header - replace status text with SaveIndicator:
<div>
  <h1 className="text-white font-medium">{episode.title}</h1>
  <SaveIndicator />
</div>

// Add Export button next to Save button:
<button
  onClick={() => setShowExportDialog(true)}
  className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
>
  <Download className="w-4 h-4" />
  Export
</button>

// Add ExportDialog at end of component:
{episode && (
  <ExportDialog
    isOpen={showExportDialog}
    onClose={() => setShowExportDialog(false)}
    episode={episode}
    pages={pages}
  />
)}
```

### Step 5: Update hooks/index.ts

```typescript
// File: src/hooks/index.ts

export { useAutoSave } from './useAutoSave';
```

---

## 📋 Testing Checklist

### Auto-Save
- [ ] Make changes → "Unsaved changes" indicator appears
- [ ] Wait 5 seconds → "Saving..." appears
- [ ] After save → "Saved just now" appears
- [ ] Refresh page → changes persisted

### Export
- [ ] Click Export button → dialog opens
- [ ] Select format (PDF/PNG/ZIP)
- [ ] Select page range
- [ ] Toggle options
- [ ] Click Export → progress shows
- [ ] On complete → download available
- [ ] Error handling → shows error message
