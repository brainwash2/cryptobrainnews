-- ==============================================================================
-- CryptoBrainNews: Agent Identity & Execution Logging Schema (Neon v2)
-- Designed for high-throughput, highly concurrent agent micro-transactions.
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Agent Identities Table (KYA - Know Your Agent)
CREATE TABLE IF NOT EXISTS agent_identities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_name VARCHAR(255) NOT NULL,
    pubkey VARCHAR(255) UNIQUE NOT NULL, 
    api_key VARCHAR(255) UNIQUE NOT NULL, 
    webhook_url VARCHAR(1024),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Execution Logs Table (L402 Micro-transactions)
CREATE TABLE IF NOT EXISTS execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agent_identities(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    target_protocol VARCHAR(255) NOT NULL,
    cost_sats INTEGER NOT NULL,
    payment_hash VARCHAR(255) UNIQUE NOT NULL, 
    status VARCHAR(50) NOT NULL DEFAULT 'pending', 
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. High-Performance Indexes for the Analytics Dashboard
CREATE INDEX IF NOT EXISTS idx_exec_logs_agent_id ON execution_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_exec_logs_created_at ON execution_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exec_logs_status_time ON execution_logs(status, created_at DESC);
