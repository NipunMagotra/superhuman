-- Corsair Integration Tables (Required by Corsair SDK)

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
