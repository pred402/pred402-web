/**
 * Check existing themes data
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

    // Check themes
    const themes = await client.query(`
      SELECT id, theme_id, title, created_at
      FROM solana_themes
      ORDER BY created_at DESC
      LIMIT 5;
    `);

    console.log('Recent themes:');
    console.log(themes.rows);
    console.log('');

    // Check options
    if (themes.rows.length > 0) {
      const options = await client.query(`
        SELECT theme_id, option_index, label, label_uri
        FROM solana_theme_options
        WHERE theme_id = $1
        ORDER BY option_index;
      `, [themes.rows[0].id]);

      console.log('Options for latest theme:');
      console.log(options.rows);
      console.log('');

      // Check if label contains URL
      const hasUrlInLabel = options.rows.some(opt =>
        opt.label && opt.label.startsWith('http')
      );

      if (hasUrlInLabel) {
        console.log('⚠️  WARNING: Some options have URL in label field!');
        console.log('This is incorrect. Labels should be like "Option A", not URLs.\n');

        console.log('Would you like to clear all themes to start fresh?');
        console.log('Run: node packages/database/scripts/clear-themes.js');
      } else {
        console.log('✓ Labels look correct!');
      }
    } else {
      console.log('No themes found in database.');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

main();
