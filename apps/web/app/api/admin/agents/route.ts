/**
 * Admin API: Get Agents List
 *
 * Fetch all agents from database
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/agents
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication using Better Auth
    const { auth } = await import('@repo/auth');
    const { headers: nextHeaders } = await import('next/headers');
    const session = await auth.api.getSession({ headers: await nextHeaders() });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    // Fetch agents from database
    const { db } = await import('@repo/database');

    const agents = await (db as any).agent.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Don't expose private keys in response
    const sanitizedAgents = agents.map((agent: any) => ({
      ...agent,
      privateKey: '***REDACTED***',
    }));

    return NextResponse.json({
      success: true,
      data: sanitizedAgents,
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
