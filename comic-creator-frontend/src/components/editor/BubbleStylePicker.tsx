import { Check } from 'lucide-react';

interface BubbleStylePickerProps {
  currentStyle: any;
  onChange: (updates: any) => void;
}

const BUBBLE_STYLES = [
  {
    id: 'round',
    name: 'Round',
    description: 'Standard speech bubble',
    preview: '💬'
  },
  {
    id: 'spiky',
    name: 'Spiky',
    description: 'Shouting/emphasis',
    preview: '💥'
  },
  {
    id: 'cloud',
    name: 'Cloud',
    description: 'Thought bubble',
    preview: '💭'
  },
  {
    id: 'square',
    name: 'Square',
    description: 'Box bubble',
    preview: '▢'
  }
];

const PRESET_COLORS = [
  { bg: '#FFFFFF', border: '#000000', name: 'White' },
  { bg: '#FEF3C7', border: '#92400E', name: 'Yellow' },
  { bg: '#DBEAFE', border: '#1E40AF', name: 'Blue' },
  { bg: '#FCE7F3', border: '#9F1239', name: 'Pink' },
  { bg: '#F3F4F6', border: '#374151', name: 'Gray' },
  { bg: '#000000', border: '#FFFFFF', name: 'Black' }
];

export function BubbleStylePicker({ currentStyle, onChange }: BubbleStylePickerProps) {
  const currentBubbleStyle = currentStyle?.bubble_style || 'round';
  const currentBubbleColor = currentStyle?.bubble_color || '#FFFFFF';
  const currentBorderColor = currentStyle?.bubble_border_color || '#000000';
  const currentBorderWidth = currentStyle?.bubble_border_width || 2;

  const handleStyleChange = (styleId: string) => {
    onChange({
      bubble_style: styleId
    });
  };

  const handleColorChange = (bg: string, border: string) => {
    onChange({
      bubble_color: bg,
      bubble_border_color: border
    });
  };

  const handleBorderWidthChange = (width: number) => {
    onChange({
      bubble_border_width: width
    });
  };

  return (
    <div className="space-y-4">
      {/* Bubble Shape */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Bubble Shape</label>
        <div className="grid grid-cols-2 gap-2">
          {BUBBLE_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleChange(style.id)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                currentBubbleStyle === style.id
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="text-2xl mb-1">{style.preview}</div>
              <div className="text-xs font-medium">{style.name}</div>
              <div className="text-xs opacity-75">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Color Presets */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Color Preset</label>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_COLORS.map((preset) => {
            const isSelected =
              currentBubbleColor === preset.bg &&
              currentBorderColor === preset.border;

            return (
              <button
                key={preset.name}
                onClick={() => handleColorChange(preset.bg, preset.border)}
                className="relative p-3 rounded-lg border-2 transition-colors hover:scale-105"
                style={{
                  backgroundColor: preset.bg,
                  borderColor: preset.border
                }}
              >
                {isSelected && (
                  <div className="absolute top-1 right-1">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div
                  className="text-xs font-medium mt-2"
                  style={{
                    color: preset.bg === '#000000' ? '#FFFFFF' : '#000000'
                  }}
                >
                  {preset.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Fill Color</label>
          <input
            type="color"
            value={currentBubbleColor}
            onChange={(e) =>
              handleColorChange(e.target.value, currentBorderColor)
            }
            className="w-full h-10 bg-gray-700 rounded border border-gray-600 cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Border Color</label>
          <input
            type="color"
            value={currentBorderColor}
            onChange={(e) =>
              handleColorChange(currentBubbleColor, e.target.value)
            }
            className="w-full h-10 bg-gray-700 rounded border border-gray-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Border Width */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Border Width: {currentBorderWidth}px
        </label>
        <input
          type="range"
          min="1"
          max="6"
          value={currentBorderWidth}
          onChange={(e) => handleBorderWidthChange(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
