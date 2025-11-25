import { useState, useEffect } from 'react';
import type { TextElement, Character } from '@/types';
import {
  Bold,
  Italic,
  Trash2,
  Type,
  MessageSquare,
  Cloud,
  Square,
  Zap,
  ArrowDownLeft,
  ArrowDown,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpLeft,
  ArrowUp,
  ArrowUpRight
} from 'lucide-react';

interface TextEditorProps {
  textElement: TextElement;
  characters: Character[];
  onUpdate: (updates: Partial<TextElement>) => void;
  onDelete: () => void;
}

const FONTS = [
  'Arial',
  'Comic Sans MS',
  'Courier New',
  'Georgia',
  'Helvetica',
  'Impact',
  'Times New Roman',
  'Verdana',
];

const COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#00FFFF', '#FF00FF', '#C0C0C0', '#808080',
  '#800000', '#808000', '#008000', '#800080', '#008080', '#000080'
];

export function TextEditor({
  textElement,
  characters,
  onUpdate,
  onDelete
}: TextEditorProps) {
  const [localContent, setLocalContent] = useState(textElement.content);

  // Sync local content when external prop changes
  useEffect(() => {
    setLocalContent(textElement.content);
  }, [textElement.content]);

  // Debounce content update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localContent !== textElement.content) {
        onUpdate({ content: localContent });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localContent, onUpdate, textElement.content]);

  const handleStyleUpdate = (key: keyof typeof textElement.style, value: any) => {
    onUpdate({
      style: {
        ...textElement.style,
        [key]: value
      }
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-6 text-sm">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="font-semibold text-gray-800">Text Editor</h3>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
          title="Delete Text"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Content Input */}
      <div className="space-y-2">
        <label className="block font-medium text-gray-700">Content</label>
        <textarea
          value={localContent}
          onChange={(e) => setLocalContent(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
          placeholder="Enter text..."
        />
      </div>

      {/* Type & Character */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-500">Type</label>
          <select
            value={textElement.text_type}
            onChange={(e) => onUpdate({ text_type: e.target.value as any })}
            className="w-full p-1.5 border border-gray-300 rounded text-sm"
          >
            <option value="dialogue">Dialogue</option>
            <option value="narration">Narration</option>
            <option value="sfx">SFX</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-500">Character</label>
          <select
            value={textElement.character_id || ''}
            onChange={(e) => onUpdate({ character_id: e.target.value || undefined })}
            className="w-full p-1.5 border border-gray-300 rounded text-sm"
          >
            <option value="">Select...</option>
            {characters.map(char => (
              <option key={char.character_id} value={char.character_id}>
                {char.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Font Styling */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="font-medium text-gray-700 flex items-center gap-2">
          <Type size={14} /> Font
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <select
              value={textElement.style.font_family}
              onChange={(e) => handleStyleUpdate('font_family', e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded text-sm"
            >
              {FONTS.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={textElement.style.font_size}
              onChange={(e) => handleStyleUpdate('font_size', Number(e.target.value))}
              className="w-16 p-1.5 border border-gray-300 rounded text-sm"
              min="8"
              max="120"
            />
            <span className="text-xs text-gray-500">px</span>
          </div>

          <div className="flex gap-1 justify-end">
            <button
              onClick={() => handleStyleUpdate('bold', !textElement.style.bold)}
              className={`p-1.5 rounded border ${textElement.style.bold ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => handleStyleUpdate('italic', !textElement.style.italic)}
              className={`p-1.5 rounded border ${textElement.style.italic ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
              title="Italic"
            >
              <Italic size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-500">Color</label>
          <div className="flex flex-wrap gap-1">
            {COLORS.slice(0, 8).map(color => (
              <button
                key={color}
                onClick={() => handleStyleUpdate('color', color)}
                className={`w-6 h-6 rounded-full border ${textElement.style.color === color ? 'ring-2 ring-blue-500 ring-offset-1' : 'border-gray-300'}`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            <input
              type="color"
              value={textElement.style.color}
              onChange={(e) => handleStyleUpdate('color', e.target.value)}
              className="w-6 h-6 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Bubble Style */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="font-medium text-gray-700">Bubble Style</h4>

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'speech', label: 'Speech', icon: MessageSquare },
            { id: 'thought', label: 'Thought', icon: Cloud },
            { id: 'narration', label: 'Narration', icon: Square },
            { id: 'sfx', label: 'SFX', icon: Zap },
          ].map(style => (
            <button
              key={style.id}
              onClick={() => {
                if (style.id === 'narration' || style.id === 'sfx') {
                  onUpdate({ text_type: style.id as any });
                } else {
                  onUpdate({
                    text_type: 'dialogue',
                    style: { ...textElement.style, bubble_style: style.id }
                  });
                }
              }}
              className={`flex items-center gap-2 p-2 rounded border text-sm ${(textElement.text_type === style.id) ||
                (textElement.text_type === 'dialogue' && textElement.style.bubble_style === style.id && (style.id === 'speech' || style.id === 'thought'))
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
            >
              <style.icon size={14} />
              {style.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">Fill</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textElement.style.bubble_color || '#FFFFFF'}
                onChange={(e) => handleStyleUpdate('bubble_color', e.target.value)}
                className="w-8 h-8 p-0 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-xs text-gray-500 uppercase">{textElement.style.bubble_color || '#FFFFFF'}</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">Border</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textElement.style.bubble_border_color || '#000000'}
                onChange={(e) => handleStyleUpdate('bubble_border_color', e.target.value)}
                className="w-8 h-8 p-0 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-xs text-gray-500 uppercase">{textElement.style.bubble_border_color || '#000000'}</span>
            </div>
          </div>
        </div>

        {textElement.text_type === 'dialogue' && textElement.style.bubble_style !== 'thought' && (
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-medium text-gray-500">Tail Position</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'top-left', icon: ArrowUpLeft },
                { id: 'top', icon: ArrowUp },
                { id: 'top-right', icon: ArrowUpRight },
                { id: 'left', icon: ArrowLeft },
                { id: 'right', icon: ArrowRight },
                { id: 'bottom-left', icon: ArrowDownLeft },
                { id: 'bottom', icon: ArrowDown },
                { id: 'bottom-right', icon: ArrowDownRight },
              ].map(pos => (
                <button
                  key={pos.id}
                  onClick={() => handleStyleUpdate('tail_position', pos.id)}
                  className={`p-1.5 flex justify-center items-center rounded border ${textElement.style.tail_position === pos.id
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  title={pos.id}
                >
                  <pos.icon size={14} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
