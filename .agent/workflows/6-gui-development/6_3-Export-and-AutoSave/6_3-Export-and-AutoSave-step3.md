---
description: 
---

### Step 3: Create ExportDialog Component

```typescript
// File: src/components/editor/ExportDialog.tsx

import { useState, useEffect, useRef } from 'react';
import {X,
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
     