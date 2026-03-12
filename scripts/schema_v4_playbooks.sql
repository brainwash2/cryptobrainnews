-- ==============================================================================
-- Phase 30: Multi-Agent Orchestration Playbooks
-- Target: Neon PostgreSQL (Run as Database Owner)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS playbooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_pubkey VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    schema_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_playbooks_operator ON playbooks(operator_pubkey);

-- Grant least-privilege access to our API role
GRANT SELECT, INSERT ON playbooks TO agent_logger;

-- Secure RLS Policies (Data isolation is enforced by backend SIWE checks)
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read playbooks" ON playbooks 
FOR SELECT TO agent_logger 
USING (true);

CREATE POLICY "Allow insert playbooks" ON playbooks 
FOR INSERT TO agent_logger 
WITH CHECK (true);
