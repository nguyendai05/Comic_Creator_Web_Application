# Comic Creator Testing Guide

This guide outlines the manual tests to verify the functionality of the Comic Creator Editor, specifically focusing on the newly implemented Auto-Save and Save Indicator features.

## 1. Auto-Save System

### Prerequisites
- Open the application in your browser (`http://localhost:5173`).
- Log in and navigate to an Episode Editor.

### Test Cases

| Test Case | Action | Expected Result |
|-----------|--------|-----------------|
| **Trigger Auto-Save** | Make a change (e.g., move a panel, add text) and wait 30 seconds. | 1. "Unsaved changes" indicator appears immediately.<br>2. After 30s, indicator changes to "Saving...".<br>3. Finally, indicator shows "Saved [time] ago".<br>4. A success toast notification appears. |
| **Manual Save** | Make a change and press `Ctrl+S` (or `Cmd+S`). | Save happens immediately, bypassing the timer. Indicator updates to "Saved". |
| **Tab Visibility** | Make a change, then switch to a different browser tab. | The app should detect visibility change and trigger a save immediately. |
| **Navigation Protection** | Make a change and try to close the tab or refresh without saving. | Browser should show a "Leave site?" confirmation dialog. |

## 2. Text System

| Test Case | Action | Expected Result |
|-----------|--------|-----------------|
| **Add Speech Bubble** | Select a panel, click "Add Text" -> "Dialogue". | A speech bubble appears in the center of the panel. |
| **Edit Text** | Double-click the bubble or use the Properties Panel. | Text updates in real-time. |
| **Styling** | Change font size, color, or bubble style in Properties Panel. | The bubble appearance updates accordingly. |

## 3. AI Generation (Mock)

| Test Case | Action | Expected Result |
|-----------|--------|-----------------|
| **Generate Panel** | Select a panel, click "Generate with AI", enter prompt, click Generate. | 1. Progress bar shows.<br>2. After delay, a mock image appears in the panel.<br>3. Credits are deducted (visible in dashboard). |

## 4. Export

| Test Case | Action | Expected Result |
|-----------|--------|-----------------|
| **Export PDF** | Click "Export", select PDF, click Download. | A mock export process runs, and a "Download" success message appears. |

## Troubleshooting

- **Auto-save not triggering?** Check the console logs for `⏰ Auto-save triggered`.
- **Save failed?** Ensure the mock API is responding (check network tab).
