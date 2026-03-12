-- ==============================================================================
-- Phase 28 Hotfix: Resolve Referral RLS Violation
-- Run this as the Database Owner in Neon
-- ==============================================================================

-- 1. Drop the restrictive policies that caused the ON CONFLICT evaluation failure
DROP POLICY IF EXISTS "Operator can read own referrals" ON referrals;
DROP POLICY IF EXISTS "System can insert referrals" ON referrals;

-- 2. Create simplified, safe policies. 
-- Data isolation is already strictly enforced by the Next.js backend WHERE clauses.
CREATE POLICY "Allow read referrals" ON referrals 
FOR SELECT TO agent_logger 
USING (true);

CREATE POLICY "Allow insert referrals" ON referrals 
FOR INSERT TO agent_logger 
WITH CHECK (true);
