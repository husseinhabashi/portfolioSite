-- Create tables for secure portfolio system

-- Invites table: stores cryptographically signed invite keys
CREATE TABLE IF NOT EXISTS invites (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  invite_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 hash of email + timestamp + nonce
  signature TEXT NOT NULL, -- ECDSA signature of invite_hash
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE visitors (
  id SERIAL PRIMARY KEY,
  ip VARCHAR(45) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table: tracks all active sessions with fingerprints
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  invite_id INTEGER REFERENCES invites(id) ON DELETE CASCADE,
  session_fingerprint VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 of IP + UA + invite + timestamp
  ip_address VARCHAR(45) NOT NULL, -- IPv4 or IPv6
  user_agent TEXT,
  first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- IP bindings table: enforces IP binding per invite
CREATE TABLE IF NOT EXISTS ip_bindings (
  id SERIAL PRIMARY KEY,
  invite_id INTEGER REFERENCES invites(id) ON DELETE CASCADE UNIQUE,
  bound_ip VARCHAR(45) NOT NULL,
  bound_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs: tracks all access attempts and security events
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'access_granted', 'access_denied', 'ip_mismatch', 'devtools_detected', etc.
  invite_id INTEGER REFERENCES invites(id) ON DELETE SET NULL,
  INSERT INTO audit_logs (event_type, ip_address, user_agent) VALUES ('website_visit', :ip_address, :user_agent)
  session_fingerprint VARCHAR(64),
  ip_address VARCHAR(45),
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leak tracking: tracks asset access with canary tokens
CREATE TABLE IF NOT EXISTS leak_tracking (
  id SERIAL PRIMARY KEY,
  session_fingerprint VARCHAR(64) NOT NULL,
  asset_url TEXT NOT NULL,
  signature VARCHAR(64) NOT NULL, -- Unique signature for this asset access
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Admin keys: stores public keys for admin signature verification
CREATE TABLE IF NOT EXISTS admin_keys (
  id SERIAL PRIMARY KEY,
  public_key TEXT NOT NULL UNIQUE,
  key_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_fingerprint ON sessions(session_fingerprint);
CREATE INDEX IF NOT EXISTS idx_sessions_invite ON sessions(invite_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leak_tracking_signature ON leak_tracking(signature);
CREATE INDEX IF NOT EXISTS idx_invites_hash ON invites(invite_hash);
