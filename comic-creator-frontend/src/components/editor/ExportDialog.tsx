import { useState } from 'react';
import {
    X,
    Download,
    FileText,
    Image as ImageIcon,
    Archive,
    Check,
    AlertCircle
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import type { Episode, Page } from '@/types';
import { api } from '@/lib/api';

interface ExportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    episodeId: string;
    episode: Episode;
    pages: Page[];
}

interface ExportOptions {
    format: 'pdf' | 'png' | 'zip';
    includeText: boolean;
    highRes: boolean;
    includeBleed: boolean;
    pageRange: 'all' | 'current' | 'custom';
    customPages: string;
}

type ExportStep = 'options' | 'exporting' | 'complete';

export function ExportDialog({
    isOpen,
    onClose,
    episodeId,
    episode,
    pages
}: ExportDialogProps) {
    const [step, setStep] = useState<ExportStep>('options');
    const [progress, setProgress] = useState(0);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [options, setOptions] = useState<ExportOptions>({
        format: 'pdf',
        includeText: true,
        highRes: false,
        includeBleed: false,
        pageRange: 'all',
        customPages: ''
    });

    const handleExport = async () => {
        setStep('exporting');
        setProgress(0);
        setError(null);

        try {
            const job = await api.createExportJob(episodeId, options.format as 'pdf' | 'png', options);

            // Poll for completion
            const pollInterval = setInterval(async () => {
                try {
                    const status = await api.getExportJob(job.export_id);

                    if (status.status === 'success' && status.result_url) {
                        clearInterval(pollInterval);
                        setDownloadUrl(status.result_url);
                        setStep('complete');
                    } else if (status.status === 'failed') {
                        clearInterval(pollInterval);
                        setError('Export failed. Please try again.');
                        setStep('options');
                    } else {
                        setProgress(status.progress || 0);
                    }
                } catch (err) {
                    clearInterval(pollInterval);
                    setError('Failed to check export status');
                    setStep('options');
                }
            }, 1000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start export');
            setStep('options');
        }
    };

    const handleDownload = () => {
        if (downloadUrl) {
            // Create a temporary link to trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `episode-${episode.episode_number}-${options.format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            onClose();
        }
    };

    const reset = () => {
        setStep('options');
        setProgress(0);
        setDownloadUrl(null);
        setError(null);
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 w-[500px] z-50 flex flex-col animate-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-800">
                        <div className="flex items-center gap-2">
                            <Download className="w-5 h-5 text-blue-400" />
                            <Dialog.Title className="font-semibold text-lg">Export Episode</Dialog.Title>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        {step === 'options' && (
                            <div className="space-y-6">
                                {/* Format Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-300">Format</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => setOptions(o => ({ ...o, format: 'pdf' }))}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${options.format === 'pdf'
                                                ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                                }`}
                                        >
                                            <FileText className="w-6 h-6" />
                                            <span className="text-sm">PDF</span>
                                        </button>
                                        <button
                                            onClick={() => setOptions(o => ({ ...o, format: 'png' }))}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${options.format === 'png'
                                                ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                                }`}
                                        >
                                            <ImageIcon className="w-6 h-6" />
                                            <span className="text-sm">PNG</span>
                                        </button>
                                        <button
                                            onClick={() => setOptions(o => ({ ...o, format: 'zip' }))}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${options.format === 'zip'
                                                ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                                }`}
                                        >
                                            <Archive className="w-6 h-6" />
                                            <span className="text-sm">ZIP</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-300">Options</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={options.includeText}
                                                onChange={(e) => setOptions(o => ({ ...o, includeText: e.target.checked }))}
                                                className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                                            />
                                            Include text elements
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={options.highRes}
                                                onChange={(e) => setOptions(o => ({ ...o, highRes: e.target.checked }))}
                                                className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                                            />
                                            High resolution (300 DPI)
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={options.includeBleed}
                                                onChange={(e) => setOptions(o => ({ ...o, includeBleed: e.target.checked }))}
                                                className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                                            />
                                            Include bleed area
                                        </label>
                                    </div>
                                </div>

                                {/* Page Range */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-300">Page Range</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="pageRange"
                                                checked={options.pageRange === 'all'}
                                                onChange={() => setOptions(o => ({ ...o, pageRange: 'all' }))}
                                                className="border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                                            />
                                            All Pages ({pages.length})
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="pageRange"
                                                checked={options.pageRange === 'current'}
                                                onChange={() => setOptions(o => ({ ...o, pageRange: 'current' }))}
                                                className="border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                                            />
                                            Current Page Only
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="pageRange"
                                                    checked={options.pageRange === 'custom'}
                                                    onChange={() => setOptions(o => ({ ...o, pageRange: 'custom' }))}
                                                    className="border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                                                />
                                                Custom:
                                            </label>
                                            <input
                                                type="text"
                                                value={options.customPages}
                                                onChange={(e) => setOptions(o => ({ ...o, pageRange: 'custom', customPages: e.target.value }))}
                                                placeholder="e.g. 1-3, 5"
                                                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm w-32 focus:border-blue-500 focus:outline-none"
                                                disabled={options.pageRange !== 'custom'}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-2 text-red-400 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Estimated size: ~5.2 MB</span>
                                    <button
                                        onClick={handleExport}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Export
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'exporting' && (
                            <div className="text-center py-8 space-y-6">
                                <div className="relative w-20 h-20 mx-auto">
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        <circle
                                            className="text-gray-800 stroke-current"
                                            strokeWidth="8"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                        />
                                        <circle
                                            className="text-blue-500 progress-ring__circle stroke-current transition-all duration-300 ease-in-out"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                            strokeDasharray={`${progress * 2.51} 251.2`}
                                            transform="rotate(-90 50 50)"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                                        {progress}%
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium">Exporting Episode...</h3>
                                    <p className="text-sm text-gray-400">Processing pages and assets</p>
                                </div>

                                <button
                                    onClick={() => setStep('options')}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {step === 'complete' && (
                            <div className="text-center py-8 space-y-6">
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                    <Check className="w-10 h-10 text-green-500" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-medium">Export Complete!</h3>
                                    <p className="text-gray-400">Your file is ready for download.</p>
                                    <div className="bg-gray-800 rounded p-3 mt-4 inline-block text-sm text-gray-300 font-mono">
                                        episode-{episode.episode_number}.{options.format}
                                    </div>
                                </div>

                                <div className="flex justify-center gap-3 pt-4">
                                    <button
                                        onClick={reset}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                    >
                                        Export Again
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download File
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
