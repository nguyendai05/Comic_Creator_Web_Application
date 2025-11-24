/**
 * Simulates network latency with jitter
 */
export async function mockDelay(ms?: number): Promise<void> {
  const baseDelay = ms || parseInt(import.meta.env.VITE_MOCK_DELAY_MS || '500');
  const jitter = Math.random() * 200 - 100; // ±100ms jitter
  const totalDelay = Math.max(0, baseDelay + jitter);

  return new Promise(resolve => setTimeout(resolve, totalDelay));
}

/**
 * Simulates random API errors (5% chance by default)
 */
export function shouldSimulateError(errorRate: number = 0.05): boolean {
  return Math.random() < errorRate;
}

/**
 * Generates a random UUID
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Gets a random item from an array
 */
export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Gets random items from an array
 */
export function randomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Formats a date to ISO string
 */
export function mockTimestamp(daysAgo: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}
