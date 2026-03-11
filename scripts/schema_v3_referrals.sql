-- ==============================================================================
-- Phase 28: Gitcoin-Gated Referral Program
-- Target: Neon PostgreSQL (Run as Database Owner)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_pubkey VARCHAR(255) NOT NULL,
    referred_pubkey VARCHAR(255) UNIQUE NOT NULL, -- Prevents double claiming
    gitcoin_score INTEGER NOT NULL,
    reward_sats INTEGER NOT NULL DEFAULT 5000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup on the operator dashboard
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_pubkey);

-- Grant least-privilege access to our API role
GRANT SELECT, INSERT ON referrals TO agent_logger;

-- RLS: Operators can only read their own referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operator can read own referrals" ON referrals
FOR SELECT TO agent_logger
USING (lower(referrer_pubkey) = lower(current_setting('operator.current_pubkey', true)));

CREATE POLICY "System can insert referrals" ON referrals
FOR INSERT TO agent_logger
WITH CHECK (true);
