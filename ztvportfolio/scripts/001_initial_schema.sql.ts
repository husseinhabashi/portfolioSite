// Run with: npm run db:setup
import { config } from "dotenv"
import { neon } from "@neondatabase/serverless"

// Load .env.local file
const result = config({ path: ".env.local" })

if (result.error) {
  console.error("❌ Error loading .env.local file:", result.error.message)
  console.log("\n💡 Make sure .env.local exists in the project root directory")
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in environment variables")
  console.log("\n💡 Troubleshooting steps:")
  console.log("  1. Check that .env.local exists in the project root")
  console.log("  2. Verify DATABASE_URL is set in .env.local")
  console.log("  3. Make sure there are no extra spaces or quotes")
  console.log("  4. Format should be: DATABASE_URL=postgresql://...")
  console.log("\nCurrent working directory:", process.cwd())
  process.exit(1)
}

console.log("✅ DATABASE_URL loaded successfully")
console.log("📍 Database host:", new URL(process.env.DATABASE_URL).host)

const sql = neon(process.env.DATABASE_URL)

async function setupDatabase() {
  try {
    console.log("🔧 Setting up database schema...")

    console.log("🗑️ Dropping existing tables if they exist...")
    await sql`DROP TABLE IF EXISTS leak_tracking CASCADE`
    await sql`DROP TABLE IF EXISTS audit_logs CASCADE`
    await sql`DROP TABLE IF EXISTS sessions CASCADE`
    await sql`DROP TABLE IF EXISTS ip_bindings CASCADE`
    await sql`DROP TABLE IF EXISTS admin_keys CASCADE`
    await sql`DROP TABLE IF EXISTS invites CASCADE`
    console.log("✅ Existing tables dropped")

    console.log("📝 Creating tables...")

    // Invites table
    await sql`
       TABLE invites (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        invite_hash VARCHAR(64) NOT NULL UNIQUE,
        signature TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `

    // Sessions table
    await sql`
      CREATE TABLE sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(64) NOT NULL UNIQUE,
        invite_hash VARCHAR(64) NOT NULL,
        fingerprint VARCHAR(64) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        user_agent TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (invite_hash) REFERENCES invites(invite_hash)
      )
    `

    // IP bindings table
    await sql`
      CREATE TABLE ip_bindings (
        id SERIAL PRIMARY KEY,
        invite_hash VARCHAR(64) NOT NULL UNIQUE,
        ip_address VARCHAR(45) NOT NULL,
        bound_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invite_hash) REFERENCES invites(invite_hash)
      )
    `

    // Audit logs table
    await sql`
      CREATE TABLE audit_logs (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        session_id VARCHAR(64),
        invite_hash VARCHAR(64),
        invite_id INTEGER REFERENCES invites(id) ON DELETE SET NULL,
        ip_address VARCHAR(45) NOT NULL,
        user_agent TEXT,
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Leak tracking table
    await sql`
      CREATE TABLE leak_tracking (
        id SERIAL PRIMARY KEY,
        canary_token VARCHAR(64) NOT NULL UNIQUE,
        session_id VARCHAR(64) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        accessed_at TIMESTAMP,
        access_count INTEGER DEFAULT 0,
        access_ips TEXT[],
        FOREIGN KEY (session_id) REFERENCES sessions(session_id)
      )
    `

    // Admin keys table
    await sql`
      CREATE TABLE admin_keys (
        id SERIAL PRIMARY KEY,
        public_key TEXT NOT NULL UNIQUE,
        key_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used TIMESTAMP,
        active BOOLEAN DEFAULT TRUE
      )
    `

    console.log("✅ Tables created")
    console.log("📊 Creating indexes...")

    // Create indexes
    await sql`CREATE INDEX idx_sessions_invite_hash ON sessions(invite_hash)`
    await sql`CREATE INDEX idx_sessions_session_id ON sessions(session_id)`
    await sql`CREATE INDEX idx_audit_logs_session_id ON audit_logs(session_id)`
    await sql`CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type)`
    await sql`CREATE INDEX idx_leak_tracking_canary ON leak_tracking(canary_token)`
    await sql`CREATE INDEX idx_leak_tracking_session ON leak_tracking(session_id)`

    console.log("✅ Indexes created")
    console.log("\n🎉 Database schema created successfully!")
    console.log("\nTables created:")
    console.log("  - invites")
    console.log("  - sessions")
    console.log("  - ip_bindings")
    console.log("  - audit_logs")
    console.log("  - leak_tracking")
    console.log("  - admin_keys")
    console.log("\nNext steps:")
    console.log("  1. Run: npm run setup:keys")
    console.log("  2. Run: npm run setup:invite <email>")
    console.log("  3. Run: npm run dev")
  } catch (error) {
    console.error("❌ Error setting up database:", error)
    process.exit(1)
  }
}

setupDatabase()
