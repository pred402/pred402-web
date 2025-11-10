/**
 * API: Get Active Agents
 *
 * Returns list of active AI agents
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { db } = await import('@repo/database');

    // Use raw SQL to bypass prepared statement cache issues
    const agents = await (db as any).$queryRaw`
      SELECT
        id,
        agent_id as "agentId",
        agent_pda as "agentPda",
        slug,
        name,
        description,
        avatar_url as "avatarUrl",
        authority_pubkey as "authorityPubkey",
        is_active as "isActive",
        created_at as "createdAt"
      FROM agents
      WHERE is_active = true
        AND agent_id IS NOT NULL
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      success: true,
      data: agents,
    });

  } catch (error) {
    console.error('Fetch agents error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch agents',
      },
      { status: 500 }
    );
  }
}
