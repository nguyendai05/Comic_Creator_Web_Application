---
description: Text System Implementation -> step 4
---

## 🎯 Implementation Steps 4

### Step 4: Create TextEditor Component

```typescript
// File: src/components/editor/TextEditor.tsx

import { useState } from 'react';
import {
  Type,
  MessageSquare,
  BookOpen,
  Zap,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
} from 'lucide-react';
import type { TextElement, Character } from '@/types';

interface TextEditorProps {
  textElement: TextElement;
  characters: Character[];
  onUpdate: (updates: Partial<TextElement>) => void;
  onDelete: () => void;
}

const TEXT_TYPE_ICONS = {
  dialogue: MessageSquare,
  narration: BookOpen,
  sfx: Zap,
};

const BUBBLE_STYLES = [
  { value: 'speech', label: 'Speech', preview: '💬' },
  { value: 'thought', label: 'Thought', preview: '💭' },
  { value: 'rectangle', label: 'Rectangle', preview: '▢' },
  { value: 'none', label: 'None', preview: '—' },
];

const FONT_FAMILIES = [
  'Comic Sans MS',
  'Arial',
  'Georgia',
  'Impact',
  'Verdana',
  'Bangers',
];

export function TextEditor({
  textElement,
  characters,
  onUpdate,
  onDelete,
}: TextEditorProps) {
  const [content, setContent] = useState(textElement.content);
  
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // Debounce update
    setTimeout(() => {
      onUpdate({ content: newContent });
    }, 300);
  };
  
  const handleStyleChange = (key: string, value: any) => {
    onUpdate({
      style: {
        ...textElement.style,
        [key]: value,
      },
    });
  };
  
  const TypeIcon = TEXT_TYPE_ICONS[textElement.text_type];
  
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TypeIcon className="w-5 h-5 text-blue-400" />
          <span className="text-white font-medium capitalize">
            {textElement.text_type} Text
          </span>
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Content */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Content</label>
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm resize-none"
          rows={3}
          placeholder="Enter text..."
        />
      </div>
      
      {/* Text Type */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Text Type</label>
        <div className="grid grid-cols-3 gap-2">
          {(['dialogue', 'narration', 'sfx'] as const).map((type) => {
            const Icon = TEXT_TYPE_ICONS[type];
            return (
              <button
                key={type}
                onClick={() => onUpdate({ text_type: type })}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                  textElement.text_type === type
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs capitalize">{type}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Character (for dialogue) */}
      {textElement.text_type === 'dialogue' && characters.length > 0 && (
        <div>
          <label className="block text-sm text-gray-400 mb-2">Character</label>
          <select
            value={textElement.character_id || ''}
            onChange={(e) => onUpdate({ character_id: e.target.value || undefined })}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
          >
            <option value="">No character</option>
            {characters.map((char) => (
              <option key={char.character_id} value={char.character_id}>
                {char.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Font Settings */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Font</label>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <select
            value={textElement.style.font_family}
            onChange={(e) => handleStyleChange('font_family', e.target.value)}
            className="bg-gray-700 text-white rounded px-2 py-1.5 border border-gray-600 text-sm"
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
          <input
            type="number"
            value={textElement.style.font_size}
            onChange={(e) => handleStyleChange('font_size', parseInt(e.target.value) || 14)}
            className="bg-gray-700 text-white rounded px-2 py-1.5 border border-gray-600 text-sm"
            min={8}
            max={72}
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => handleStyleChange('bold', !textElement.style.bold)}
            className={`p-2 rounded ${
              textElement.style.bold
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleStyleChange('italic', !textElement.style.italic)}
            className={`p-2 rounded ${
              textElement.style.italic
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <input
            type="color"
            value={textElement.style.color}
            onChange={(e) => handleStyleChange('color', e.target.value)}
            className="w-8 h-8 bg-gray-700 rounded cursor-pointer"
          />
        </div>
      </div>
      
      {/* Bubble Style (not for SFX) */}
      {textElement.text_type !== 'sfx' && (
        <div>
          <label className="block text-sm text-gray-400 mb-2">Bubble Style</label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {BUBBLE_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => handleStyleChange('bubble_style', style.value)}
                className={`flex flex-col items-center p-2 rounded border transition-colors ${
                  textElement.style.bubble_style === style.value
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                <span className="text-lg">{style.preview}</span>
                <span className="text-xs">{style.label}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Fill</label>
              <input
                type="color"
                value={textElement.style.bubble_color || '#FFFFFF'}
                onChange={(e) => handleStyleChange('bubble_color', e.target.value)}
                className="w-full h-8 bg-gray-700 rounded cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Border</label>
              <input
                type="color"
                value={textElement.style.bubble_border_color || '#000000'}
                onChange={(e) => handleStyleChange('bubble_border_color', e.target.value)}
                className="w-full h-8 bg-gray-700 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Position (Advanced) */}
      <details className="group">
        <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
          Position & Size
        </summary>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">X</label>
            <input
              type="number"
              value={Math.round(textElement.position.x)}
              onChange={(e) => onUpdate({
                position: { ...textElement.position, x: parseInt(e.target.value) || 0 }
              })}
              className="w-full bg-gray-700 text-white rounded px-2 py-1 border border-gray-600 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Y</label>
            <input
              type="number"
              value={Math.round(textElement.position.y)}
              onChange={(e) => onUpdate({
                position: { ...textElement.position, y: parseInt(e.target.value) || 0 }
              })}
              className="w-full bg-gray-700 text-white rounded px-2 py-1 border border-gray-600 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Width</label>
            <input
              type="number"
              value={Math.round(textElement.position.width)}
              onChange={(e) => onUpdate({
                position: { ...textElement.position, width: parseInt(e.target.value) || 100 }
              })}
              className="w-full bg-gray-700 text-white rounded px-2 py-1 border border-gray-600 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Height</label>
            <input
              type="number"
              value={Math.round(textElement.position.height)}
              onChange={(e) => onUpdate({
                position: { ...textElement.position, height: parseInt(e.target.value) || 40 }
              })}
              className="w-full bg-gray-700 text-white rounded px-2 py-1 border border-gray-600 text-sm"
            />
          </div>
        </div>
      </details>
    </div>
  );
}
```