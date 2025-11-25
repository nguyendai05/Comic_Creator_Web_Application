---
description: Text System Implementation -> step 6
---

## 🎯 Implementation Steps 6

### Step 6: Update PropertiesPanel to Show TextEditor

```typescript
// File: src/components/editor/PropertiesPanel.tsx
// Add imports:
import { TextEditor } from './TextEditor';
import { useSelectedText } from '@/stores/editorStore';

// Inside PropertiesPanel component:
const selectedText = useSelectedText();
const { characters, updateText, deleteText, selectText } = useEditorStore();

// Update return statement:
return (
  <div className="h-full overflow-y-auto">
    {selectedText ? (
      <>
        {/* Back to Panel button */}
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={() => selectText(null)}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
          >
            ← Back to Panel
          </button>
        </div>
        <TextEditor
          textElement={selectedText}
          characters={characters}
          onUpdate={(updates) => updateText(selectedText.text_id, updates)}
          onDelete={() => {
            deleteText(selectedText.text_id);
            selectText(null);
          }}
        />
      </>
    ) : selectedPanel ? (
      // ... existing panel properties JSX
    ) : (
      // ... existing empty state
    )}
  </div>
);
```

---

## 📋 Testing Checklist

- [ ] Click panel → panel selected
- [ ] Click "Add Text" → dropdown shows
- [ ] Select text type → text element created at panel center
- [ ] Text visible on canvas with correct bubble style
- [ ] Click text → text selected, PropertiesPanel shows TextEditor
- [ ] Edit content → updates on canvas
- [ ] Change text type → bubble style changes
- [ ] Change font/size/color → text updates
- [ ] Drag text → position updates
- [ ] Resize text → dimensions update
- [ ] Delete text → text removed
- [ ] Click panel background → deselect text