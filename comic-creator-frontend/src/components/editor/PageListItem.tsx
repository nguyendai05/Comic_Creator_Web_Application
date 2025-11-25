import { motion } from 'framer-motion';
import { MoreVertical, Trash2 } from 'lucide-react';
import type { Page } from '@/types';
import { useState } from 'react';

interface PageListItemProps {
    page: Page;
    isActive: boolean;
    onSelect: () => void;
    onDelete: () => void;
}

export function PageListItem({ page, isActive, onSelect, onDelete }: PageListItemProps) {
    const [showMenu, setShowMenu] = useState(false);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Delete page ${page.page_number}?`)) {
            onDelete();
        }
        setShowMenu(false);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`relative rounded-lg p-3 cursor-pointer transition-colors ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            onClick={onSelect}
        >
            {/* Thumbnail */}
            <div className="aspect-[3/4] bg-gray-600 rounded mb-2 flex items-center justify-center relative overflow-hidden">
                {/* TODO: Render actual page thumbnail */}
                <span className="text-gray-400 text-sm">Page {page.page_number}</span>

                {/* Panel count overlay */}
                <div className="absolute bottom-1 right-1 px-2 py-0.5 bg-black/50 rounded text-xs">
                    {page.panels.length} panels
                </div>
            </div>

            {/* Info */}
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white'}`}>
                        Page {page.page_number}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                        {page.panels.length} {page.panels.length === 1 ? 'panel' : 'panels'}
                    </p>
                </div>

                {/* Menu */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className={`p-1 rounded transition-colors ${isActive
                            ? 'hover:bg-blue-500'
                            : 'hover:bg-gray-500'
                        }`}
                >
                    <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown */}
                {showMenu && (
                    <div className="absolute right-2 top-2 z-10 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 min-w-[120px]">
                        <button
                            onClick={handleDelete}
                            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
