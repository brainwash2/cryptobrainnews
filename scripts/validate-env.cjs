#!/usr/bin/env node
/**
 * Environment Variable Validator for CryptoBrainNews (CommonJS version)
 * Usage: node scripts/validate-env.cjs
 * 
 * Checks .env.local (or .env) for required and optional variables.
 * Exits with code 1 if any required variable is missing.
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load .env.local or .env
const envPath = path.resolve(process.cwd(), '.env.local');
const fallbackPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log(`📄 Loaded ${envPath}`);
} else if (fs.existsSync(fallbackPath)) {
  require('dotenv').config({ path: fallbackPath });
  console.log(`📄 Loaded ${fallbackPath}`);
} else {
  console.warn('⚠️ No .env.local or .env file found. Using process environment only.');
}

// ─── Required variables (app will fail without these) ──────────────────────
const REQUIRED = [
  'NEON_DATABASE_URL',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SANITY_DATASET',
  'SANITY_API_TOKEN',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHANNEL_ID',
  'CRON_SECRET',
  'RESEND_API_KEY',
  'RESEND_AUDIENCE_ID',
  'RESEND_DOMAIN',
  'GROQ_API_KEY',
];

// ─── Optional but recommended (core features degrade without them) ─────────
const OPTIONAL = [
  'GITCOIN_SCORER_API_KEY',
  'GITCOIN_SCORER_ID',
  'ALBY_API_KEY',
  'ETHERSCAN_API_KEY',
  'ALCHEMY_API_KEY',
  'DUNE_API_KEY',
  'ADMIN_SECRET',
  'NEXT_PUBLIC_SITE_URL',
];

// ─── Deprecated / unused (can be ignored) ─────────────────────────────────
const DEPRECATED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SANITY_API_WRITE_TOKEN',
  'BLOCKNATIVE_API_KEY',
  'COINGECKO_API_KEY',
  'RESERVOIR_API_KEY',
];

function checkVariable(name, isRequired) {
  const value = process.env[name];
  const exists = value !== undefined && value.trim() !== '';
  
  if (isRequired && !exists) {
    console.error(`❌ MISSING (required): ${name}`);
    return false;
  } else if (!isRequired && !exists) {
    console.warn(`⚠️  Missing (optional): ${name}`);
    return true;
  } else if (exists) {
    let display = value;
    if (value.length > 20) {
      display = value.slice(0, 10) + '…' + value.slice(-6);
    }
    console.log(`✅ ${name}: ${display}`);
    return true;
  }
  return true;
}

let hasMissingRequired = false;

console.log('\n🔍 Validating CryptoBrainNews environment variables...\n');

console.log('📌 Required variables:');
for (const v of REQUIRED) {
  if (!checkVariable(v, true)) hasMissingRequired = true;
}

console.log('\n📌 Optional variables (features may degrade):');
for (const v of OPTIONAL) {
  checkVariable(v, false);
}

console.log('\n📌 Deprecated variables (can be removed):');
for (const v of DEPRECATED) {
  if (process.env[v]) {
    console.log(`⚠️  Deprecated variable present: ${v} – safe to remove`);
  } else {
    console.log(`✅ ${v} (not set, OK)`);
  }
}

console.log('');
if (hasMissingRequired) {
  console.error('❌ One or more required environment variables are missing.');
  console.error('   Please add them to .env.local and/or Vercel Environment Variables.');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set.');
  console.log('   Optional variables can be added as needed.');
  process.exit(0);
}
