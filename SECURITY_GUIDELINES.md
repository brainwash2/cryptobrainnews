# CryptoBrainNews Security & Operational Guidelines

## 1. IP Allow-listing (Neon)
To ensure the `NEON_DATABASE_URL` cannot be queried outside your infrastructure:
1. In the Neon Console, navigate to **Settings -> IP Allow**.
2. Vercel Edge IPs are dynamic. If you do not have Vercel Enterprise (Secure Compute Networks), you must leave IPs open (`0.0.0.0/0`).
3. **Defense in Depth**: Because we implemented RLS and the `agent_logger` role, an attacker extracting the connection string cannot dump the database; they are locked out by `agent.current_id` checks.

## 2. Secrets Rotation (Zero Downtime)
If an API Key or Database Password is compromised:
1. Generate a new password in Neon for `agent_logger`.
2. Add the new connection string to Vercel Environment Variables as `NEON_DATABASE_URL_NEXT`.
3. Update `src/lib/neon.ts` to fall back: `process.env.NEON_DATABASE_URL_NEXT || process.env.NEON_DATABASE_URL`.
4. Deploy the site. Once active, revoke the old password in Neon.

## 3. Environment Variable Protection
All modules handling keys (e.g., `src/lib/security.ts`, `src/lib/neon.ts`) explicitly include `import 'server-only';`. This guarantees the Next.js bundler will throw a build error if a developer accidentally imports them into a Client Component.
