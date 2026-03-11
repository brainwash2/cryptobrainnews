-- ==============================================================================
-- Phase 23 Hotfix: Resolve Authentication Paradox
-- Run this as the Database Owner in Neon
-- ==============================================================================

-- 1. Drop the restrictive policy that prevents the initial lookup
DROP POLICY IF EXISTS "Agent can read own identity" ON agent_identities;

-- 2. Create a new policy allowing the agent_logger to perform lookups.
-- Security Note: Because the api_key column stores a one-way SHA-256 hash, 
-- allowing SELECT access to this table is safe and standard for authentication.
CREATE POLICY "Allow identity lookup" ON agent_identities
FOR SELECT TO agent_logger
USING (true);
