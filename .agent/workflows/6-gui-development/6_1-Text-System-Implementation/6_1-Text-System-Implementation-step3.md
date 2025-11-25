---
description: Text System Implementation -> step 3
---

## 🎯 Implementation Steps 3

### Step 3: Update PanelShape to Render Text Elements

```typescript
// File: src/components/editor/PanelShape.tsx
// Add to imports:
import { TextBubble } from './TextBubble';
import { useEditorStore } from '@/stores/editorStore';

// Inside PanelShape component, add:
const { selectedTextId, selectText, updateText, deleteText } = useEditorStore();

// After the panel rendering (before closing </Group>), add:
{/* Text Elements */}
{panel.text_elements?.map((textEl) => (
  <TextBubble
    key={textEl.text_id}
    textElement={textEl}
    isSelected={textEl.text_id === selectedTextId}
    onSelect={() => {
      selectText(textEl.text_id);
      // Also select the panel
      onClick();
    }}
    onUpdate={(updates) => updateText(textEl.text_id, updates)}
    onDelete={() => deleteText(textEl.text_id)}
    panelPosition={{ x: panel.position.x, y: panel.position.y }}
  />
))}
```
