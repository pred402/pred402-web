/**
 * Clear all themes data (for testing)
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

    console.log('Deleting all theme options...');
    const optionsResult = await client.query('DELETE FROM solana_theme_options;');
    console.log(`✓ Deleted ${optionsResult.rowCount} options`);

    console.log('Deleting all themes...');
    const themesResult = await client.query('DELETE FROM solana_themes;');
    console.log(`✓ Deleted ${themesResult.rowCount} themes`);

    console.log('\n✅ All themes cleared! You can now create new themes with correct data.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

main();
