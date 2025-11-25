# Phase 6: GUI Development Workflows

## 📊 Project Status Summary

### ✅ Completed (Phases 1-5)

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Project Setup, Mock Data | ✅ Done |
| 2 | Authentication (Login/Register) | ✅ Done |
| 3 | Dashboard & Series Management | ✅ Done |
| 4 | Episode List & Navigation | ✅ Done |
| 5 | Editor Layout (Canvas, Pages, Panels) | ✅ Done |

### 🚧 In Progress (Phase 6)

| Sub-Phase | Feature | Priority | Time | Status |
|-----------|---------|----------|------|--------|
| 6.1 | Text System (Speech Bubbles) | HIGH | 4-6h | 🔴 Not Started |
| 6.2 | AI Generation UI | HIGH | 3-4h | 🔴 Not Started |
| 6.3 | Export & Auto-Save | MEDIUM | 2-3h | 🔴 Not Started |
| 6.4 | Keyboard Shortcuts & Polish | LOW | 2h | 🔴 Not Started |

---

## 📁 Workflow Files

```
.agent/workflows/6-gui-development/
├── README.md                           # This file
├── 6_1-Text-System-Implementation.md   # Speech bubbles, TextEditor
├── 6_2-AI-Generation-UI.md             # AI dialog, prompt builder
├── 6_3-Export-and-AutoSave.md          # Export, auto-save, indicators
└── 6_4-Keyboard-Shortcuts-and-Polish.md # Shortcuts, animations
```

---

## 🎯 Implementation Order

```
Phase 6.1 ─────────┐
                   ├──► Phase 6.3 ──► Phase 6.4
Phase 6.2 ─────────┘
```

**Recommended Order:**
1. **6.1 Text System** - Critical for comic, enables text-based storytelling
2. **6.2 AI Generation** - Core feature, enables panel generation
3. **6.3 Export & Auto-Save** - User value delivery
4. **6.4 Polish** - Enhancement, can be done last

---

## 🗂️ Current Code Structure

```
src/
├── components/
│   ├── auth/           ✅ Complete
│   ├── series/         ✅ Complete
│   └── editor/
│       ├── PageListItem.tsx    ✅ Done
│       ├── PanelCanvas.tsx     ✅ Done
│       ├── PanelShape.tsx      ✅ Done (needs text rendering)
│       ├── PanelToolbar.tsx    ✅ Done (needs text button)
│       ├── PropertiesPanel.tsx ✅ Done (needs TextEditor)
│       ├── TextBubble.tsx      🔴 Not Created
│       ├── TextEditor.tsx      🔴 Not Created
│       ├── AIGenerationDialog.tsx 🔴 Not Created
│       ├── ExportDialog.tsx    🔴 Not Created
│       └── SaveIndicator.tsx   🔴 Not Created
├── stores/
│   ├── authStore.ts    ✅ Complete
│   ├── seriesStore.ts  ✅ Complete
│   └── editorStore.ts  ✅ Done (needs selectedTextId)
├── hooks/
│   ├── useAutoSave.ts  🔴 Not Created
│   └── useKeyboardShortcuts.ts 🔴 Not Created
├── lib/
│   └── api/
│       ├── mockApi.ts  ✅ Complete (AI, Export ready)
│       └── ...
└── pages/
    ├── EditorPage.tsx  ✅ Done (needs Export, SaveIndicator)
    └── ...
```

---

## 📝 Key Implementation Notes

### Text System (6.1)
- TextElement already has full interface in `types/index.ts`
- generators.ts already creates mock text elements
- Need to render text on canvas with Konva `<Text>` and bubble shapes
- PropertiesPanel needs to show TextEditor when text selected

### AI Generation (6.2)
- mockApi.ts already has `createAIJob()` and `getAIJob()` simulation
- Job completes after 10 seconds with mock image URL
- Need polling mechanism to track progress
- Dialog should show character selection if characters available

### Export (6.3)
- mockApi.ts already has `createExportJob()` simulation
- Job completes after 5 seconds with mock URL
- Support PDF, PNG, ZIP formats

### Polish (6.4)
- framer-motion already installed
- react-hot-toast available for notifications
- Add keyboard shortcuts for power users

---

## 🚀 Quick Start for Agent

To implement Phase 6.1:
```bash
# 1. Read the workflow
cat .agent/workflows/6-gui-development/6_1-Text-System-Implementation.md

# 2. Create components in order:
# - Update editorStore.ts (add selectedTextId, selectText, addTextToPanel)
# - Create TextBubble.tsx
# - Update PanelShape.tsx (render text elements)
# - Create TextEditor.tsx
# - Update PanelToolbar.tsx (add text button)
# - Update PropertiesPanel.tsx (show TextEditor)

# 3. Test
npm run dev
# Open browser, navigate to editor, test text features
```

---

## ✅ Definition of Done

Phase 6 is complete when:
- [ ] Can add speech bubbles, narration, SFX to panels
- [ ] Text elements draggable and editable
- [ ] Can generate panel images with AI
- [ ] Can export episode as PDF/PNG
- [ ] Auto-save working
- [ ] Keyboard shortcuts functional
- [ ] Smooth animations throughout

---

*Document Version: 1.0*
*Last Updated: November 2025*
