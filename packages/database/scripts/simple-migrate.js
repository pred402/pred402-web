/**
 * Simple migration using pg directly (bypasses Prisma connection pool issue)
 */

const { Client } = require('pg');

// Parse connection string from .env.local
const connectionString = process.env.DATABASE_URL;

const sql = `
-- Create SolanaTheme table
CREATE TABLE IF NOT EXISTS "solana_themes" (
    "id" TEXT NOT NULL,
    "theme_id" INTEGER NOT NULL,
    "theme_pda" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata_uri" TEXT NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "resolution_time" TIMESTAMP(3) NOT NULL,
    "total_options" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "tx_signature" TEXT NOT NULL,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "solana_themes_pkey" PRIMARY KEY ("id")
);

-- Create SolanaThemeOption table
CREATE TABLE IF NOT EXISTS "solana_theme_options" (
    "id" TEXT NOT NULL,
    "theme_id" TEXT NOT NULL,
    "option_index" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "label_uri" TEXT NOT NULL,
    "option_state_pda" TEXT NOT NULL,
    "option_vault_pda" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "solana_theme_options_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "solana_themes_theme_id_key" ON "solana_themes"("theme_id");
CREATE UNIQUE INDEX IF NOT EXISTS "solana_themes_theme_pda_key" ON "solana_themes"("theme_pda");
CREATE UNIQUE INDEX IF NOT EXISTS "solana_theme_options_theme_id_option_index_key" ON "solana_theme_options"("theme_id", "option_index");

-- Create regular indexes
CREATE INDEX IF NOT EXISTS "solana_themes_theme_id_idx" ON "solana_themes"("theme_id");
CREATE INDEX IF NOT EXISTS "solana_themes_status_idx" ON "solana_themes"("status");
CREATE INDEX IF NOT EXISTS "solana_theme_options_theme_id_idx" ON "solana_theme_options"("theme_id");

-- Add foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'solana_themes_created_by_id_fkey'
  ) THEN
    ALTER TABLE "solana_themes" ADD CONSTRAINT "solana_themes_created_by_id_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'solana_theme_options_theme_id_fkey'
  ) THEN
    ALTER TABLE "solana_theme_options" ADD CONSTRAINT "solana_theme_options_theme_id_fkey"
    FOREIGN KEY ("theme_id") REFERENCES "solana_themes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
`;

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✓ Connected');

    console.log('\nExecuting migration SQL...');
    await client.query(sql);
    console.log('✓ Migration completed successfully!');

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'solana_%'
      ORDER BY table_name;
    `);

    console.log('\n✓ Tables created:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
