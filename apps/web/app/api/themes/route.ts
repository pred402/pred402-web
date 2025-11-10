/**
 * API: Get Active Themes
 *
 * Returns list of active prediction themes with their options
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { db } = await import('@repo/database');

    // Fetch active themes with their options, ordered by creation date (newest first)
    const themes = await (db as any).solanaTheme.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        options: {
          orderBy: {
            optionIndex: 'asc',
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
