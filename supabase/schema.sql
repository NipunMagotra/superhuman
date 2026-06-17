-- Enable the pgvector extension to work with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable uuid-ossp extension for random UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for cached Gmail messages
CREATE TABLE IF NOT EXISTS cached_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gmail_id TEXT UNIQUE NOT NULL,
    thread_id TEXT NOT NULL,
    from_address TEXT,
    from_name TEXT,
    to_addresses JSONB DEFAULT '[]'::jsonb,
    subject TEXT,
    snippet TEXT,
    body_text TEXT,
    body_html TEXT,
    labels TEXT[] DEFAULT '{}'::text[],
    is_read BOOLEAN DEFAULT false,
    is_starred BOOLEAN DEFAULT false,
    priority_score REAL DEFAULT 0.0,
    received_at TIMESTAMPTZ,
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for cached Google Calendar events
CREATE TABLE IF NOT EXISTS cached_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gcal_id TEXT UNIQUE NOT NULL,
    summary TEXT,
    description TEXT,
    location TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    attendees JSONB DEFAULT '[]'::jsonb,
    status TEXT, -- 'confirmed', 'tentative', 'cancelled'
    html_link TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for user settings
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme TEXT DEFAULT 'dark',
    keyboard_shortcuts_enabled BOOLEAN DEFAULT true,
    priority_filtering_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cached_emails_updated_at ON cached_emails;
CREATE TRIGGER update_cached_emails_updated_at
    BEFORE UPDATE ON cached_emails
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cached_events_updated_at ON cached_events;
CREATE TRIGGER update_cached_events_updated_at
    BEFORE UPDATE ON cached_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function for matching emails using vector similarity (cosine distance)
CREATE OR REPLACE FUNCTION match_emails (
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  gmail_id TEXT,
  thread_id TEXT,
  from_address TEXT,
  from_name TEXT,
  to_addresses JSONB,
  subject TEXT,
  snippet TEXT,
  body_text TEXT,
  labels TEXT[],
  is_read BOOLEAN,
  is_starred BOOLEAN,
  priority_score REAL,
  received_at TIMESTAMPTZ,
  similarity FLOAT
)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cached_emails.id,
    cached_emails.gmail_id,
    cached_emails.thread_id,
    cached_emails.from_address,
    cached_emails.from_name,
    cached_emails.to_addresses,
    cached_emails.subject,
    cached_emails.snippet,
    cached_emails.body_text,
    cached_emails.labels,
    cached_emails.is_read,
    cached_emails.is_starred,
    cached_emails.priority_score,
    cached_emails.received_at,
    1 - (cached_emails.embedding <=> query_embedding) AS similarity
  FROM cached_emails
  WHERE 1 - (cached_emails.embedding <=> query_embedding) > match_threshold
  ORDER BY cached_emails.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_emails_gmail_id ON cached_emails(gmail_id);
CREATE INDEX IF NOT EXISTS idx_emails_thread_id ON cached_emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_received_at ON cached_emails(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_priority_score ON cached_emails(priority_score DESC);

CREATE INDEX IF NOT EXISTS idx_events_gcal_id ON cached_events(gcal_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON cached_events(start_time ASC);

-- HNSW Vector Index (requires vector extension)
-- Note: cosine similarity uses <=> operator. We must specify vector_cosine_ops.
CREATE INDEX IF NOT EXISTS idx_emails_embedding_hnsw ON cached_emails USING hnsw (embedding vector_cosine_ops);

-- =========================================================================
-- Corsair Integration Tables (Required by Corsair SDK)
-- =========================================================================

-- Table for Corsair integrations
CREATE TABLE IF NOT EXISTS corsair_integrations (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    name TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    dek TEXT
);

-- Table for Corsair accounts
CREATE TABLE IF NOT EXISTS corsair_accounts (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    tenant_id TEXT NOT NULL,
    integration_id TEXT NOT NULL REFERENCES corsair_integrations(id) ON DELETE CASCADE,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    dek TEXT
);

-- Table for Corsair entities
CREATE TABLE IF NOT EXISTS corsair_entities (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    account_id TEXT NOT NULL REFERENCES corsair_accounts(id) ON DELETE CASCADE,
    entity_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    version TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Table for Corsair events
CREATE TABLE IF NOT EXISTS corsair_events (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    account_id TEXT NOT NULL REFERENCES corsair_accounts(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT
);

-- Table for Corsair permissions
CREATE TABLE IF NOT EXISTS corsair_permissions (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    token TEXT NOT NULL,
    plugin TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    args TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    expires_at TEXT NOT NULL,
    error TEXT
);

CREATE INDEX IF NOT EXISTS idx_corsair_accounts_tenant ON corsair_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_corsair_entities_account ON corsair_entities(account_id);
CREATE INDEX IF NOT EXISTS idx_corsair_events_account ON corsair_events(account_id);
CREATE INDEX IF NOT EXISTS idx_corsair_permissions_token ON corsair_permissions(token);
