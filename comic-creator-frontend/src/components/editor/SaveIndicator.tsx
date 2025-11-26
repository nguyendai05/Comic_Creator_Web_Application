import { useEditorStore } from '@/stores/editorStore';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SaveIndicator() {
    const { isDirty, isSaving, lastSaved } = useEditorStore();

    const formatTime = (date: Date | null) => {
        if (!date) return 'Never';
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    return (
        <div className="flex items-center gap-2 text-sm mr-2">
            <AnimatePresence mode="wait">
                {isSaving ? (
                    <motion.div
                        key="saving"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-1.5 text-blue-400"
                    >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                    </motion.div>
                ) : isDirty ? (
                    <motion.div
                        key="unsaved"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-1.5 text-yellow-400"
                    >
                        <CloudOff className="w-4 h-4" />
                        <span>Unsaved changes</span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="saved"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-1.5 text-gray-400"
                    >
                        <Cloud className="w-4 h-4" />
                        <span>Saved {formatTime(lastSaved)}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
