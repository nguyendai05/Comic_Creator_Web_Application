---
description: Text System Implementation -> step 5
---

## 🎯 Implementation Steps 5

### Step 5: Update PanelToolbar to Add Text Button

```typescript
// File: src/components/editor/PanelToolbar.tsx
// Add to imports:
import { MessageSquare, BookOpen, Zap } from 'lucide-react';

// Add state for text type picker:
const [showTextPicker, setShowTextPicker] = useState(false);
const { addTextToPanel } = useEditorStore();

// Add to JSX (after Duplicate Panel button):
<div className="h-6 w-px bg-gray-700" />

{/* Add Text */}
<div className="relative">
  <button
    onClick={() => setShowTextPicker(!showTextPicker)}
    disabled={!selectedPanel}
    className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    title="Add text element"
  >
    <MessageSquare className="w-4 h-4" />
    Add Text
  </button>
  
  {showTextPicker && selectedPanel && (
    <div className="absolute top-full left-0 mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 w-48 z-20">
      <button
        onClick={() => {
          addTextToPanel(selectedPanel.panel_id, 'dialogue');
          setShowTextPicker(false);
        }}
        className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
      >
        <MessageSquare className="w-4 h-4 text-blue-400" />
        Speech Bubble
      </button>
      <button
        onClick={() => {
          addTextToPanel(selectedPanel.panel_id, 'narration');
          setShowTextPicker(false);
        }}
        className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
      >
        <BookOpen className="w-4 h-4 text-yellow-400" />
        Narration Box
      </button>
      <button
        onClick={() => {
          addTextToPanel(selectedPanel.panel_id, 'sfx');
          setShowTextPicker(false);
        }}
        className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
      >
        <Zap className="w-4 h-4 text-red-400" />
        Sound Effect (SFX)
      </button>
    </div>
  )}
</div>
```