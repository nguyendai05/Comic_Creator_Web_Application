import {
  MessageSquare,
  FileText,
  Zap,
  Trash2,
  Copy
} from 'lucide-react';

interface TextToolbarProps {
  selectedTextId: string | null;
  onAddText: (type: 'dialogue' | 'narration' | 'sfx') => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function TextToolbar({
  selectedTextId,
  onAddText,
  onDuplicate,
  onDelete
}: TextToolbarProps) {
  const hasSelection = !!selectedTextId;

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Add Text Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 mr-2">Add:</span>

          <button
            onClick={() => onAddText('dialogue')}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            title="Add dialogue bubble"
          >
            <MessageSquare className="w-4 h-4" />
            Dialogue
          </button>

          <button
            onClick={() => onAddText('narration')}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            title="Add narration box"
          >
            <FileText className="w-4 h-4" />
            Narration
          </button>

          <button
            onClick={() => onAddText('sfx')}
            className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
            title="Add SFX text"
          >
            <Zap className="w-4 h-4" />
            SFX
          </button>
        </div>

        {/* Selection Actions */}
        {hasSelection && (
          <div className="flex items-center gap-2">
            <div className="h-6 w-px bg-gray-700 mx-2" />

            <button
              onClick={onDuplicate}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>

            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-2 text-xs text-gray-500">
        {hasSelection ? (
          <span>Selected text element - Use toolbar to edit or delete</span>
        ) : (
          <span>Click "Add" buttons to create text elements, then drag and resize on canvas</span>
        )}
      </div>
    </div>
  );
}
