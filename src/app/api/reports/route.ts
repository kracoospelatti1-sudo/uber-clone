import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import type { Report } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportedId, rideId, reason, description } = await request.json();

    if (!reportedId || !reason) {
      return NextResponse.json({ error: 'Reported user and reason are required' }, { status: 400 });
    }

    const validReasons = ['inappropriate_behavior', 'vehicle_condition', 'safety', 'other'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
    }

    const result = await query<Report>(
      `INSERT INTO reports (reporter_id, reported_id, ride_id, reason, description, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [session.userId as string, reportedId, rideId || null, reason, description || null]
    );

    return NextResponse.json({ report: result[0] });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
