---
description: AI Generation UI (Dialog, Prompt Builder, Progress) -> Implementation Steps 2
---

### Step 2: Update PropertiesPanel to Open Dialog

```typescript
// File: src/components/editor/PropertiesPanel.tsx
// Add import:
import { AIGenerationDialog } from './AIGenerationDialog';

// Add state:
const [showAIDialog, setShowAIDialog] = useState(false);
const characters = useEditorStore((s) => s.characters);

// Update Generate with AI button:
<button
  onClick={() => setShowAIDialog(true)}
  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
>
  <Wand2 className="w-4 h-4" />
  Generate with AI
</button>

// Add dialog at end of component (before closing tag):
{selectedPanel && (
  <AIGenerationDialog
    isOpen={showAIDialog}
    onClose={() => setShowAIDialog(false)}
    panel={selectedPanel}
    characters={characters}
  />
)}
```