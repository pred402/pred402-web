/**
 * Admin API: Get Themes List
 *
 * Fetch all Solana themes from database
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/themes
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

    // Fetch themes from database
    const { db } = await import('@repo/database');

    const themes = await (db as any).solanaTheme.findMany({
      include: {
        options: {
          orderBy: {
            optionIndex: 'asc',
          },
        },
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

    return NextResponse.json({
      success: true,
      data: themes,
    });

  } catch (error) {
    console.error('Fetch themes error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch themes',
      },
      { status: 500 }
    );
  }
}
