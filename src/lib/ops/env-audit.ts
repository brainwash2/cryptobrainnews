/**
 * lib/ops/env-audit.ts
 * Environment variable validator.
 *
 * Run at module initialisation in any server entrypoint (cron routes,
 * daily-article.ts) to catch misconfiguration early — before a silent
 * failure surfaces at 6 AM in production.
 *
 * Usage:
 *   import { auditEnv } from '../lib/ops/env-audit';
 *   auditEnv('pipeline');   // throws if any REQUIRED var is missing
 *
 * Severity levels:
 *   REQUIRED — missing = throw (hard stop)
 *   WARN     — missing = console.warn (degraded but runnable)
 *   INFO     — missing = note in audit report only
 *
 * The complete env var reference is embedded below as the
 * authoritative source of truth for .env.local and Vercel dashboard.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

type EnvSeverity = 'REQUIRED' | 'WARN' | 'INFO';
type EnvContext  =
  | 'all'
  | 'pipeline'
  | 'social'
  | 'monetisation'
  | 'newsletter'
  | 'health';

interface EnvSpec {
  key:         string;
  severity:    EnvSeverity;
  contexts:    EnvContext[];
  description: string;
  example:     string;
  secret:      boolean;   // true = never log the value
}

// ─── Complete environment variable manifest ───────────────────────────────────

export const ENV_MANIFEST: EnvSpec[] = [
  // ── Sanity ─────────────────────────────────────────────────────────────────
  {
    key: 'NEXT_PUBLIC_SANITY_PROJECT_ID', severity: 'REQUIRED', contexts: ['all'],
    description: 'Sanity project ID (public)',
    example: 'abc123de', secret: false,
  },
  {
    key: 'NEXT_PUBLIC_SANITY_DATASET', severity: 'REQUIRED', contexts: ['all'],
    description: 'Sanity dataset name',
    example: 'production', secret: false,
  },
  {
    key: 'SANITY_API_TOKEN', severity: 'REQUIRED', contexts: ['pipeline'],
    description: 'Sanity write token — Editor role minimum',
    example: 'sk...', secret: true,
  },

  // ── Upstash Redis ──────────────────────────────────────────────────────────
  {
    key: 'UPSTASH_REDIS_REST_URL', severity: 'REQUIRED', contexts: ['all'],
    description: 'Upstash Redis REST endpoint',
    example: 'https://xxx.upstash.io', secret: false,
  },
  {
    key: 'UPSTASH_REDIS_REST_TOKEN', severity: 'REQUIRED', contexts: ['all'],
    description: 'Upstash Redis REST token',
    example: 'AX...', secret: true,
  },

  // ── AI Pipeline ────────────────────────────────────────────────────────────
  {
    key: 'GROK_API_KEY', severity: 'REQUIRED', contexts: ['pipeline'],
    description: 'xAI Grok API key for summarisation stage',
    example: 'xai-...', secret: true,
  },
  {
    key: 'DEEPSEEK_API_KEY', severity: 'WARN', contexts: ['pipeline'],
    description: 'DeepSeek API key — pipeline degrades without it',
    example: 'sk-...', secret: true,
  },
  {
    key: 'GEMINI_API_KEY', severity: 'WARN', contexts: ['pipeline'],
    description: 'Google Gemini API key — GEO enhancer + polish stage',
    example: 'AIza...', secret: true,
  },

  // ── RSS Feeds ──────────────────────────────────────────────────────────────
  {
    key: 'RSS_FEED_URLS', severity: 'REQUIRED', contexts: ['pipeline'],
    description: 'Comma-separated list of RSS feed URLs to ingest',
    example: 'https://cointelegraph.com/rss,https://decrypt.co/feed', secret: false,
  },
  {
    key: 'MAX_ARTICLES_PER_RUN', severity: 'INFO', contexts: ['pipeline'],
    description: 'Max articles to process per daily run (default: 5)',
    example: '5', secret: false,
  },

  // ── Site ───────────────────────────────────────────────────────────────────
  {
    key: 'NEXT_PUBLIC_SITE_URL', severity: 'REQUIRED', contexts: ['all'],
    description: 'Canonical site URL (no trailing slash)',
    example: 'https://cryptobrainnews.com', secret: false,
  },
  {
    key: 'NEXT_PUBLIC_TWITTER_URL', severity: 'INFO', contexts: ['all'],
    description: 'Twitter/X profile URL for schema sameAs',
    example: 'https://x.com/CryptoBrainNews', secret: false,
  },
  {
    key: 'NEXT_PUBLIC_TWITTER_HANDLE', severity: 'INFO', contexts: ['all'],
    description: 'Twitter/X handle for Twitter Card meta tag',
    example: '@CryptoBrainNews', secret: false,
  },
  {
    key: 'NEXT_PUBLIC_TELEGRAM_URL', severity: 'INFO', contexts: ['all'],
    description: 'Telegram channel URL for schema sameAs',
    example: 'https://t.me/cryptobrainnews', secret: false,
  },

  // ── Telegram ───────────────────────────────────────────────────────────────
  {
    key: 'TELEGRAM_BOT_TOKEN', severity: 'WARN', contexts: ['pipeline', 'social', 'health'],
    description: 'Telegram Bot API token for broadcasting + ops alerts',
    example: '123456:ABC-...', secret: true,
  },
  {
    key: 'TELEGRAM_CHAT_ID', severity: 'WARN', contexts: ['pipeline', 'social'],
    description: 'Telegram channel/chat ID for article broadcasts',
    example: '-1001234567890', secret: false,
  },
  {
    key: 'TELEGRAM_OPS_CHAT_ID', severity: 'WARN', contexts: ['health'],
    description: 'Separate Telegram chat for ops/health alerts (can equal TELEGRAM_CHAT_ID)',
    example: '-1009876543210', secret: false,
  },

  // ── Twitter / X ────────────────────────────────────────────────────────────
  {
    key: 'TWITTER_API_KEY', severity: 'WARN', contexts: ['social'],
    description: 'Twitter API v2 consumer key (OAuth 1.0a)',
    example: 'abc...', secret: true,
  },
  {
    key: 'TWITTER_API_SECRET', severity: 'WARN', contexts: ['social'],
    description: 'Twitter API v2 consumer secret',
    example: 'xyz...', secret: true,
  },
  {
    key: 'TWITTER_ACCESS_TOKEN', severity: 'WARN', contexts: ['social'],
    description: 'Twitter OAuth 1.0a access token (user context)',
    example: '123456-abc...', secret: true,
  },
  {
    key: 'TWITTER_ACCESS_TOKEN_SECRET', severity: 'WARN', contexts: ['social'],
    description: 'Twitter OAuth 1.0a access token secret',
    example: 'xyz...', secret: true,
  },
  {
    key: 'TWITTER_BEARER_TOKEN', severity: 'INFO', contexts: ['social'],
    description: 'Twitter Bearer token (app-only read access)',
    example: 'AAAA...', secret: true,
  },

  // ── Stripe ─────────────────────────────────────────────────────────────────
  {
    key: 'STRIPE_SECRET_KEY', severity: 'WARN', contexts: ['monetisation'],
    description: 'Stripe secret key — server-only, never expose to browser',
    example: 'sk_live_...', secret: true,
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET', severity: 'WARN', contexts: ['monetisation'],
    description: 'Stripe webhook signing secret from dashboard → Webhooks',
    example: 'whsec_...', secret: true,
  },
  {
    key: 'STRIPE_PRO_MONTHLY_PRICE_ID', severity: 'WARN', contexts: ['monetisation'],
    description: 'Stripe Price ID for Pro monthly ($19/mo)',
    example: 'price_1...', secret: false,
  },
  {
    key: 'STRIPE_PRO_YEARLY_PRICE_ID', severity: 'WARN', contexts: ['monetisation'],
    description: 'Stripe Price ID for Pro yearly ($190/yr)',
    example: 'price_1...', secret: false,
  },

  // ── Newsletter (Resend) ────────────────────────────────────────────────────
  {
    key: 'RESEND_API_KEY', severity: 'WARN', contexts: ['newsletter'],
    description: 'Resend API key for transactional + newsletter sends',
    example: 're_...', secret: true,
  },
  {
    key: 'NEWSLETTER_FROM', severity: 'INFO', contexts: ['newsletter'],
    description: 'From address for newsletter sends',
    example: 'news@cryptobrainnews.com', secret: false,
  },

  // ── Affiliate ──────────────────────────────────────────────────────────────
  {
    key: 'AFFILIATE_LEDGER_REF', severity: 'WARN', contexts: ['monetisation'],
    description: 'Ledger affiliate referral code',
    example: 'CBN2024', secret: false,
  },
  {
    key: 'AFFILIATE_BINANCE_REF', severity: 'WARN', contexts: ['monetisation'],
    description: 'Binance referral code',
    example: 'XXXXXXXX', secret: false,
  },
  {
    key: 'AFFILIATE_BYBIT_REF', severity: 'WARN', contexts: ['monetisation'],
    description: 'Bybit affiliate ID',
    example: '12345', secret: false,
  },

  // ── Auth / Security ────────────────────────────────────────────────────────
  {
    key: 'JWT_SECRET', severity: 'REQUIRED', contexts: ['all'],
    description: 'HS256 secret for session JWT signing (min 32 bytes)',
    example: '<random 64-char hex>', secret: true,
  },
  {
    key: 'CRON_SECRET', severity: 'REQUIRED', contexts: ['all'],
    description: 'Shared secret for Vercel Cron route auth',
    example: '<random 32-char hex>', secret: true,
  },
  {
    key: 'SESSION_COOKIE_NAME', severity: 'INFO', contexts: ['all'],
    description: 'Name of the session cookie (default: cbn_session)',
    example: 'cbn_session', secret: false,
  },
  {
    key: 'IP_HASH_SALT', severity: 'WARN', contexts: ['monetisation'],
    description: 'Salt for GDPR-compliant IP hashing in affiliate analytics',
    example: '<random 32-char hex>', secret: true,
  },

  // ── Dead letter ────────────────────────────────────────────────────────────
  {
    key: 'DEAD_LETTER_DIR', severity: 'INFO', contexts: ['pipeline'],
    description: 'Directory for dead-letter JSON files (default: scripts/dead-letter)',
    example: 'scripts/dead-letter', secret: false,
  },
];

// ─── Auditor ──────────────────────────────────────────────────────────────────

export interface AuditResult {
  context:  EnvContext;
  missing:  Array<{ key: string; severity: EnvSeverity; description: string }>;
  present:  string[];
  warnings: string[];
  errors:   string[];
  passed:   boolean;
}

export function auditEnv(context: EnvContext = 'all'): AuditResult {
  const relevant = ENV_MANIFEST.filter(
    (s) => s.contexts.includes('all') || s.contexts.includes(context),
  );

  const result: AuditResult = {
    context,
    missing:  [],
    present:  [],
    warnings: [],
    errors:   [],
    passed:   true,
  };

  for (const spec of relevant) {
    const val = process.env[spec.key];

    if (!val) {
      result.missing.push({ key: spec.key, severity: spec.severity, description: spec.description });

      if (spec.severity === 'REQUIRED') {
        result.errors.push(`REQUIRED env var missing: ${spec.key} — ${spec.description}`);
        result.passed = false;
      } else if (spec.severity === 'WARN') {
        result.warnings.push(`WARN env var missing: ${spec.key} — ${spec.description}`);
      }
    } else {
      // Never log secret values
      result.present.push(spec.secret ? `${spec.key}=<redacted>` : `${spec.key}=${val}`);
    }
  }

  // Throw on any REQUIRED miss — hard fail at startup
  if (!result.passed) {
    throw new Error(
      `[env-audit] ${context} context failed:\n` +
      result.errors.map((e) => `  ✗ ${e}`).join('\n'),
    );
  }

  // Emit warnings to stdout (captured by Vercel logs)
  for (const w of result.warnings) {
    process.stdout.write(JSON.stringify({ level: 'warn', msg: w }) + '\n');
  }

  return result;
}

/**
 * Generate a .env.example file content from the manifest.
 * Run: npx ts-node -e "require('./lib/ops/env-audit').printEnvExample()"
 */
export function printEnvExample(): void {
  const lines: string[] = [
    '# CryptoBrainNews — environment variables',
    '# Generated from lib/ops/env-audit.ts — do not edit manually',
    '# Copy to .env.local and fill in values',
    '',
  ];

  let lastContext = '';
  for (const spec of ENV_MANIFEST) {
    const ctx = spec.contexts.filter((c) => c !== 'all')[0] ?? 'all';
    if (ctx !== lastContext) {
      lines.push(`# ── ${ctx.toUpperCase()} ` + '─'.repeat(60 - ctx.length));
      lastContext = ctx;
    }
    lines.push(`# ${spec.description}`);
    lines.push(`# Severity: ${spec.severity}  |  Example: ${spec.example}`);
    lines.push(`${spec.key}=`);
    lines.push('');
  }

  process.stdout.write(lines.join('\n'));
}
