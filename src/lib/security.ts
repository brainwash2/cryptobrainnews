import 'server-only';

/**
 * Hashes an API key using the Web Crypto API (SHA-256).
 * 100% compatible with Vercel Edge runtime (no bcrypt node dependencies).
 */
export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a secure, random API key for agents.
 */
export function generateApiKey(): string {
  return `cbn_live_${crypto.randomUUID().replace(/-/g, '')}`;
}
