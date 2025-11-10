/**
 * Clean null bytes from database text fields
 * Run with: node packages/database/scripts/clean-null-bytes.js
 */

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '../../.env.local' });

const prisma = new PrismaClient();

async function cleanNullBytes() {
  console.log('🧹 Cleaning null bytes from database...\n');

  try {
    // Clean agents table
    console.log('Cleaning agents table...');
    const result1 = await prisma.$executeRaw`
      UPDATE agents
      SET 
        name = REPLACE(name, E'\\x00', ''),
        description = REPLACE(COALESCE(description, ''), E'\\x00', ''),
        slug = REPLACE(slug, E'\\x00', '')
      WHERE 
        name LIKE '%' || E'\\x00' || '%'
        OR description LIKE '%' || E'\\x00' || '%'
        OR slug LIKE '%' || E'\\x00' || '%'
    `;
    console.log(`  ✓ Updated ${result1} agent records\n`);

    // Clean solana_themes table
    console.log('Cleaning solana_themes table...');
    const result2 = await prisma.$executeRaw`
      UPDATE solana_themes
      SET 
        title = REPLACE(title, E'\\x00', ''),
        description = REPLACE(COALESCE(description, ''), E'\\x00', '')
      WHERE 
        title LIKE '%' || E'\\x00' || '%'
        OR description LIKE '%' || E'\\x00' || '%'
    `;
    console.log(`  ✓ Updated ${result2} theme records\n`);

    // Clean solana_theme_options table
    console.log('Cleaning solana_theme_options table...');
    const result3 = await prisma.$executeRaw`
      UPDATE solana_theme_options
      SET label = REPLACE(label, E'\\x00', '')
      WHERE label LIKE '%' || E'\\x00' || '%'
    `;
    console.log(`  ✓ Updated ${result3} option records\n`);

    console.log('✅ Cleanup complete!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanNullBytes();
