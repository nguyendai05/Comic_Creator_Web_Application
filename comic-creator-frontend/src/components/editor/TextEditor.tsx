import { useState, useEffect } from 'react';
import {
  Bold,
  Italic,
  Palette
} from 'lucide-react';
import type { TextElement } from '@/types';
import { BubbleStylePicker } from './BubbleStylePicker';

interface TextEditorProps {
  textElement: TextElement | null;
  onUpdate: (updates: Partial<TextElement>) => void;
  onClose: () => void;
}

export function TextEditor({ textElement, onUpdate, onClose }: TextEditorProps) {
  const [content, setContent] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [color, setColor] = useState('#000000');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBubblePicker, setShowBubblePicker] = useState(false);

  useEffect(() => {
    if (textElement) {
      setContent(textElement.content);
      setFontSize(textElement.style?.font_size || 16);
      setFontFamily(textElement.style?.font_family || 'Arial');
      setColor(textElement.style?.color || '#000000');
      setBold(textElement.style?.bold || false);
      setItalic(textElement.style?.italic || false);
    }
  }, [textElement]);

  if (!textElement) return null;

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onUpdate({
      content: newContent
    });
  };

  const handleStyleChange = (styleUpdates: any) => {
    onUpdate({
      style: {
        ...textElement.style,
        ...styleUpdates
      }
    });
  };

  const toggleBold = () => {
    const newBold = !bold;
    setBold(newBold);
    handleStyleChange({ bold: newBold });
  };

  const toggleItalic = () => {
    const newItalic = !italic;
    setItalic(newItalic);
    handleStyleChange({ italic: newItalic });
  };

  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
    handleStyleChange({ font_size: newSize });
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    handleStyleChange({ color: newColor });
  };

  const handleBubbleStyleChange = (bubbleUpdates: any) => {
    handleStyleChange(bubbleUpdates);
    setShowBubblePicker(false);
  };

  const fonts = [
    'Arial',
    'Comic Sans MS',
    'Impact',
    'Times New Roman',
    'Courier New',
    'Georgia'
  ];

  return (
    <div className="bg-gray-800 border-l border-gray-700">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">Text Editor</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Text Type Badge */}
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
            textElement.text_type === 'dialogue'
              ? 'bg-blue-600 text-white'
              : textElement.text_type === 'narration'
              ? 'bg-purple-600 text-white'
              : 'bg-orange-600 text-white'
          }`}>
            {textElement.text_type.toUpperCase()}
          </span>
        </div>

        {/* Content Textarea */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
            rows={4}
            placeholder="Enter text..."
          />
        </div>

        {/* Font Controls */}
        <div className="space-y-3 mb-4">
          {/* Font Family */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Font</label>
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                handleStyleChange({ font_family: e.target.value });
              }}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
            >
              {fonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Size: {fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="48"
              value={fontSize}
              onChange={(e) => handleFontSizeChange(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Text Style Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={toggleBold}
            className={`flex-1 p-2 rounded-lg border transition-colors ${
              bold
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Bold className="w-5 h-5 mx-auto" />
          </button>
          <button
            onClick={toggleItalic}
            className={`flex-1 p-2 rounded-lg border transition-colors ${
              italic
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Italic className="w-5 h-5 mx-auto" />
          </button>
        </div>

        {/* Color Picker */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Text Color</label>
          <div className="flex gap-2">
            <div
              className="w-10 h-10 rounded border-2 border-gray-600 cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="flex-1 bg-gray-700 rounded-lg border border-gray-600"
            />
          </div>
        </div>

        {/* Bubble Style Button (only for dialogue) */}
        {textElement.text_type === 'dialogue' && (
          <div className="mb-4">
            <button
              onClick={() => setShowBubblePicker(!showBubblePicker)}
              className="w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <Palette className="w-4 h-4" />
              Bubble Style
            </button>

            {showBubblePicker && (
              <div className="mt-2">
                <BubbleStylePicker
                  currentStyle={textElement.style}
                  onChange={handleBubbleStyleChange}
                />
              </div>
            )}
          </div>
        )}

        {/* Position & Size */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Position & Size</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">X:</span>
              <span className="text-white ml-1">{textElement.position.x.toFixed(0)}</span>
            </div>
            <div>
              <span className="text-gray-500">Y:</span>
              <span className="text-white ml-1">{textElement.position.y.toFixed(0)}</span>
            </div>
            <div>
              <span className="text-gray-500">W:</span>
              <span className="text-white ml-1">{textElement.position.width.toFixed(0)}</span>
            </div>
            <div>
              <span className="text-gray-500">H:</span>
              <span className="text-white ml-1">{textElement.position.height.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
