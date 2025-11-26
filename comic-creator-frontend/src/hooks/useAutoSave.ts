import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';

interface UseAutoSaveOptions {
    /**
     * Enable/disable auto-save
     * @default true
     */
    enabled?: boolean;

    /**
     * Auto-save interval in milliseconds
     * @default 30000 (30 seconds)
     */
    interval?: number;

    /**
     * Callback when save starts
     */
    onSaveStart?: () => void;

    /**
     * Callback when save succeeds
     */
    onSaveSuccess?: () => void;

    /**
     * Callback when save fails
     */
    onSaveError?: (error: Error) => void;
}

interface UseAutoSaveReturn {
    /**
     * Whether a save operation is in progress
     */
    isSaving: boolean;

    /**
     * Timestamp of last successful save
     */
    lastSaved: Date | null;

    /**
     * Whether there are unsaved changes
     */
    isDirty: boolean;

    /**
     * Manually trigger a save
     */
    saveNow: () => Promise<void>;
}

/**
 * Hook for automatic saving of editor changes
 * 
 * Features:
 * - Debounced auto-save after changes
 * - Manual save via saveNow()
 * - beforeunload warning for unsaved changes
 * - Callbacks for save lifecycle
 * 
 * @example
 * ```tsx
 * useAutoSave({
 *   enabled: true,
 *   interval: 30000,
 *   onSaveSuccess: () => toast.success('Saved!'),
 *   onSaveError: (e) => toast.error(e.message)
 * });
 * ```
 */
export function useAutoSave(options: UseAutoSaveOptions = {}): UseAutoSaveReturn {
    const {
        enabled = true,
        interval = 30000, // 30 seconds
        onSaveStart,
        onSaveSuccess,
        onSaveError
    } = options;

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMountedRef = useRef(true);

    const {
        isDirty,
        isSaving,
        lastSaved,
        saveEpisode
    } = useEditorStore();

    /**
     * Manually trigger a save
     */
    const saveNow = useCallback(async () => {
        // Don't save if nothing changed or already saving
        if (!useEditorStore.getState().isDirty || useEditorStore.getState().isSaving) {
            return;
        }

        try {
            onSaveStart?.();
            await saveEpisode();

            // Only call callback if still mounted
            if (isMountedRef.current) {
                onSaveSuccess?.();
            }
        } catch (error) {
            if (isMountedRef.current) {
                onSaveError?.(error instanceof Error ? error : new Error('Save failed'));
            }
        }
    }, [saveEpisode, onSaveStart, onSaveSuccess, onSaveError]);

    /**
     * Set up auto-save timer when dirty
     */
    useEffect(() => {
        // Skip if disabled or not dirty
        if (!enabled || !isDirty) {
            return;
        }

        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Set new timeout for auto-save
        timeoutRef.current = setTimeout(() => {
            console.log('⏰ Auto-save triggered');
            saveNow();
        }, interval);

        // Cleanup on unmount or when dependencies change
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [enabled, isDirty, interval, saveNow]);

    /**
     * Track mounted state
     */
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    /**
     * Warn user about unsaved changes when leaving
     */
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // Only warn if there are unsaved changes
            if (useEditorStore.getState().isDirty) {
                e.preventDefault();
                // Modern browsers show a generic message
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []); // Empty deps - we read from store directly

    /**
     * Save on visibility change (when tab becomes hidden)
     */
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && useEditorStore.getState().isDirty) {
                console.log('👁️ Tab hidden, triggering save');
                saveNow();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [saveNow]);

    return {
        isSaving,
        lastSaved,
        isDirty,
        saveNow
    };
}

/**
 * Format last saved time for display
 * 
 * @example
 * ```tsx
 * const { lastSaved } = useAutoSave();
 * <span>{formatLastSaved(lastSaved)}</span>
 * // "Just now" | "2m ago" | "1h ago" | "Never"
 * ```
 */
export function formatLastSaved(lastSaved: Date | null): string {
    if (!lastSaved) return 'Never saved';

    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);

    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

    return lastSaved.toLocaleDateString();
}
