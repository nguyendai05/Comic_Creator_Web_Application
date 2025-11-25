import { MessageSquare, Cloud, Square, Zap, X } from 'lucide-react';
import type { TextElement } from '@/types';

interface TextTypePickerProps {
    onSelect: (type: TextElement['text_type'], bubbleStyle?: string) => void;
    onClose: () => void;
}

export function TextTypePicker({ onSelect, onClose }: TextTypePickerProps) {
    return (
        <div className="absolute top-full left-0 mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-2 w-64 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex justify-between items-center mb-2 px-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Add Text</span>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <X size={14} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => onSelect('dialogue')}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-blue-600 rounded-lg transition-colors group"
                >
                    <MessageSquare className="w-6 h-6 text-blue-400 group-hover:text-white" />
                    <span className="text-xs text-gray-200 group-hover:text-white">Speech</span>
                </button>

                <button
                    onClick={() => onSelect('dialogue', 'thought')}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-blue-600 rounded-lg transition-colors group"
                >
                    <Cloud className="w-6 h-6 text-blue-400 group-hover:text-white" />
                    <span className="text-xs text-gray-200 group-hover:text-white">Thought</span>
                </button>

                <button
                    onClick={() => onSelect('narration')}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-blue-600 rounded-lg transition-colors group"
                >
                    <Square className="w-6 h-6 text-yellow-400 group-hover:text-white" />
                    <span className="text-xs text-gray-200 group-hover:text-white">Narration</span>
                </button>

                <button
                    onClick={() => onSelect('sfx')}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-blue-600 rounded-lg transition-colors group"
                >
                    <Zap className="w-6 h-6 text-red-400 group-hover:text-white" />
                    <span className="text-xs text-gray-200 group-hover:text-white">SFX</span>
                </button>
            </div>
        </div>
    );
}
