import { useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';

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
    } = useEditorStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore shortcuts if user is typing in an input or textarea
            if (
                document.activeElement instanceof HTMLInputElement ||
                document.activeElement instanceof HTMLTextAreaElement
            ) {
                return;
            }

            const isMod = e.metaKey || e.ctrlKey;

            // Save: Ctrl/Cmd + S
            if (isMod && e.key === 's') {
                e.preventDefault();
                saveEpisode();
                return;
            }

            // Delete: Delete or Backspace
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedTextId) {
                    deleteText(selectedTextId);
                } else if (selectedPanelId) {
                    deletePanel(selectedPanelId);
                }
                return;
            }

            // Duplicate: Ctrl/Cmd + D
            if (isMod && e.key === 'd') {
                e.preventDefault();
                if (selectedPanelId) {
                    duplicatePanel(selectedPanelId);
                }
                return;
            }

            // Escape: Deselect all
            if (e.key === 'Escape') {
                selectPanel(null);
                selectText(null);
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        selectedPanelId,
        selectedTextId,
        deletePanel,
        deleteText,
        duplicatePanel,
        selectPanel,
        selectText,
        saveEpisode
    ]);
}
