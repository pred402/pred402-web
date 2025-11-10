/**
 * Remove old Event, Market, AgentReport tables and recreate Agent table
 */

const { Client } = require('pg');
const connectionString = process.env.DATABASE_URL;

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Connected to database\n');

    console.log('Dropping old tables...');

    // Drop tables in correct order (foreign keys first)
    await client.query('DROP TABLE IF EXISTS "user_investments" CASCADE;');
    console.log('✓ Dropped user_investments');

    await client.query('DROP TABLE IF EXISTS "agent_orders" CASCADE;');
    console.log('✓ Dropped agent_orders');

    await client.query('DROP TABLE IF EXISTS "agent_report_market_probabilities" CASCADE;');
    console.log('✓ Dropped agent_report_market_probabilities');

    await client.query('DROP TABLE IF EXISTS "agent_reports" CASCADE;');
    console.log('✓ Dropped agent_reports');

    await client.query('DROP TABLE IF EXISTS "markets" CASCADE;');
    console.log('✓ Dropped markets');

    await client.query('DROP TABLE IF EXISTS "events" CASCADE;');
    console.log('✓ Dropped events');

    await client.query('DROP TABLE IF EXISTS "agents" CASCADE;');
    console.log('✓ Dropped old agents table');

    console.log('\nCreating new agents table...');
    await client.query(`
      CREATE TABLE "agents" (
        "id" TEXT NOT NULL,
        "agent_id" INTEGER UNIQUE,
        "agent_pda" TEXT UNIQUE,
        "slug" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "avatar_url" TEXT,
        "private_key" TEXT NOT NULL,
        "authority_pubkey" TEXT NOT NULL,
        "metadata_uri" TEXT,
        "config_id" INTEGER NOT NULL DEFAULT 1,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "tx_signature" TEXT,
        "created_by_id" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✓ Created new agents table');

    console.log('\nCreating indexes...');
    await client.query('CREATE INDEX "agents_agent_id_idx" ON "agents"("agent_id");');
    await client.query('CREATE INDEX "agents_slug_idx" ON "agents"("slug");');
    console.log('✓ Created indexes');

    console.log('\nAdding foreign key...');
    await client.query(`
      ALTER TABLE "agents" ADD CONSTRAINT "agents_created_by_id_fkey"
      FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    `);
    console.log('✓ Added foreign key');

    console.log('\n✅ Migration completed successfully!');
    console.log('\nOld tables removed:');
    console.log('  - events');
    console.log('  - markets');
    console.log('  - agent_reports');
    console.log('  - agent_report_market_probabilities');
    console.log('  - agent_orders');
    console.log('  - user_investments');
    console.log('\nNew agents table created with privateKey field.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
