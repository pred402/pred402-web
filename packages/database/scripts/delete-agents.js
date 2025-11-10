import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '../../.env.local' });

const prisma = new PrismaClient();

async function deleteAgents() {
  console.log('🗑️  Deleting all agents...\n');

  try {
    const result = await prisma.agent.deleteMany({});
    console.log(`✅ Deleted ${result.count} agents`);
    console.log('\nYou can now recreate them in the admin panel.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAgents();
