/**
 * Manual migration script for Solana Themes tables
 * Run with: node packages/database/scripts/migrate-solana-themes.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating Solana Themes tables...');

  try {
    // Create SolanaTheme table
    await prisma.$executeRawUnsafe(`
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
    `);
    console.log('✓ Created solana_themes table');

    // Create SolanaThemeOption table
    await prisma.$executeRawUnsafe(`
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
    `);
    console.log('✓ Created solana_theme_options table');

    // Create indexes
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "solana_themes_theme_id_key" ON "solana_themes"("theme_id");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "solana_themes_theme_pda_key" ON "solana_themes"("theme_pda");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "solana_theme_options_theme_id_option_index_key" ON "solana_theme_options"("theme_id", "option_index");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "solana_themes_theme_id_idx" ON "solana_themes"("theme_id");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "solana_themes_status_idx" ON "solana_themes"("status");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "solana_theme_options_theme_id_idx" ON "solana_theme_options"("theme_id");
    `);
    console.log('✓ Created indexes');

    // Add foreign keys (using DO block to avoid errors if already exists)
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'solana_themes_created_by_id_fkey'
        ) THEN
          ALTER TABLE "solana_themes" ADD CONSTRAINT "solana_themes_created_by_id_fkey"
          FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'solana_theme_options_theme_id_fkey'
        ) THEN
          ALTER TABLE "solana_theme_options" ADD CONSTRAINT "solana_theme_options_theme_id_fkey"
          FOREIGN KEY ("theme_id") REFERENCES "solana_themes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
    console.log('✓ Created foreign keys');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
