/**
 * Single source of truth for the backend API base URL (issue #212).
 *
 * Every consumer previously repeated `process.env.NEXT_PUBLIC_API_URL ||
 * 'http://localhost:8000'`, which made the fallback impossible to validate in
 * one place — and let a production build ship pointing at localhost or a dead
 * host unnoticed (next.config.ts now guards that at build time).
 *
 * NEXT_PUBLIC_* vars are inlined at build time, so this module must reference
 * the env var literally.
 */
export function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}
