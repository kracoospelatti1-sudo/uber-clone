import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import type { Report } from '@/types';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reports = await query<Report>(
      `SELECT r.*, 
              reporter.full_name as reporter_name,
              reported.full_name as reported_name
       FROM reports r
       JOIN users reporter ON r.reporter_id = reporter.id
       JOIN users reported ON r.reported_id = reported.id
       WHERE r.reporter_id = $1
       ORDER BY r.created_at DESC`,
      [session.userId as string]
    );

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Get my reports error:', error);
    return NextResponse.json(
      { error: 'Failed to get reports' },
      { status: 500 }
    );
  }
}
