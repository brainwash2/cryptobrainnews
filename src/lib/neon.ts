import 'server-only';
import { neon } from '@neondatabase/serverless';

if (!process.env.NEON_DATABASE_URL) {
  console.warn('[Neon] Missing NEON_DATABASE_URL environment variable.');
}

// The neon() function automatically manages connections over HTTP/WebSockets
// This is 100% compatible with Vercel's Edge runtime.
export const sql = neon(process.env.NEON_DATABASE_URL || 'postgres://placeholder');
