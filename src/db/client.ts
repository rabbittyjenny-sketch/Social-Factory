import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// This file is shared between Node (drizzle-kit) and Browser (Vite)
// Browsers cannot connect via TCP (postgres-js), so we guard the initialization.
const isBrowser = typeof window !== 'undefined';
// Use a safe way to access environment variables in Vite
const env = (import.meta as any).env || {};
const dbUrl = env.VITE_DATABASE_URL || '';
const isPlaceholder = !dbUrl || dbUrl.includes('[user]');

let db: any;

if (isBrowser || isPlaceholder) {
  // Browser or no URL: Use a proxy to prevent crashes during module evaluation.
  // The databaseService.ts already has logic to use localStorage when isReady is false.
  db = new Proxy({}, {
    get(_, prop) {
      if (prop === 'then') return undefined;
      return () => {
        console.warn(`⚠️ Database operation "${String(prop)}" called in browser. Using fallback logic.`);
        throw new Error('DATABASE_NOT_AVAILABLE');
      };
    }
  });
} else {
  // Node environment (e.g., when running drizzle-kit push)
  try {
    // Dynamic import to avoid bundling 'postgres' in the browser
    // Note: In Drizzle Kit, this file is executed in Node.
    const postgres = require('postgres');
    const client = postgres(dbUrl);
    db = drizzle(client, { schema });
  } catch (e) {
    console.warn('Database initialization skipped or failed:', e);
  }
}

export { db };
export * from './schema';
