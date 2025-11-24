---
description: Frontend Development Workflows -> API Client with Mock/Real Switching
---

```typescript
// lib/api/apiClient.ts
import { mockApi } from './mockApi';
import { realApi } from './realApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Export the appropriate API implementation
export const api = USE_MOCK ? mockApi : realApi;

// Helper to check current mode
export const isMockMode = (): boolean => USE_MOCK;

// Log current mode on startup
console.log(`
🎨 Comic Creator API Mode: ${USE_MOCK ? '🧪 MOCK DATA' : '🌐 REAL API'}
API Base URL: ${import.meta.env.VITE_API_BASE_URL || 'N/A'}
`);
```