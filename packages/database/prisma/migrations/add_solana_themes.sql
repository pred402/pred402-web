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
ALTER TABLE "solana_themes" ADD CONSTRAINT "solana_themes_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "solana_theme_options" ADD CONSTRAINT "solana_theme_options_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "solana_themes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
