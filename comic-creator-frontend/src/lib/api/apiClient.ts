import { mockApi } from './mockApi';
import { realApi } from './realApi';

/**
 * Determine which API to use based on environment
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * Main API client - switches between mock and real based on env
 */
// @ts-ignore - realApi is incomplete for now
export const api = (USE_MOCK ? mockApi : realApi) as typeof mockApi;

/**
 * Check if currently using mock API
 */
export const isMockMode = (): boolean => USE_MOCK;

/**
 * Get current API base URL
 */
export const getApiBaseUrl = (): string => {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
};

// Log current mode on startup
if (import.meta.env.DEV) {
    const mode = USE_MOCK ? '🧪 MOCK DATA' : '🌐 REAL API';
    const url = getApiBaseUrl();

    console.log(`
╔════════════════════════════════════════╗
║   Comic Creator API Configuration      ║
╠════════════════════════════════════════╣
║ Mode: ${mode}                     ║
║ URL:  ${url.padEnd(32)} ║
╚════════════════════════════════════════╝
  `);
}
