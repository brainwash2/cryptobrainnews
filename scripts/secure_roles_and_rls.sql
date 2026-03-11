-- ==============================================================================
-- Phase 22: Security Hardening (Run this as the Database Owner in Neon)
-- ==============================================================================

-- 1. Create a restricted role for API interactions
-- Note: Replace 'SECURE_PASSWORD' with a strong generated password in Neon.
CREATE ROLE agent_logger WITH LOGIN PASSWORD '2S5N85UH0IEjSPCvgXBpYi+U';

-- 2. Grant least-privilege access
GRANT USAGE ON SCHEMA public TO agent_logger;
GRANT SELECT, INSERT ON agent_identities TO agent_logger;
GRANT SELECT, INSERT ON execution_logs TO agent_logger;

-- 3. Enable Row-Level Security (RLS)
ALTER TABLE agent_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Agents can read their own identity
CREATE POLICY "Agent can read own identity" ON agent_identities
FOR SELECT TO agent_logger
USING (id::text = current_setting('agent.current_id', true));

-- 5. RLS Policy: Agents can insert and read their own logs
CREATE POLICY "Agent can insert own logs" ON execution_logs
FOR INSERT TO agent_logger
WITH CHECK (agent_id::text = current_setting('agent.current_id', true));

CREATE POLICY "Agent can read own logs" ON execution_logs
FOR SELECT TO agent_logger
USING (agent_id::text = current_setting('agent.current_id', true));
