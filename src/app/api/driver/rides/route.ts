import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import type { Ride, DriverProfile } from '@/types';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'driver') {
      return NextResponse.json({ error: 'Only drivers can access this' }, { status: 403 });
    }

    const rides = await query<Ride & { passenger_name: string; passenger_phone: string }>(
      `SELECT r.*, u.full_name as passenger_name, u.phone as passenger_phone
       FROM rides r
       JOIN users u ON r.passenger_id = u.id
       WHERE r.driver_id = $1
       ORDER BY r.requested_at DESC`,
      [session.userId as string]
    );

    return NextResponse.json({ rides });
  } catch (error) {
    console.error('Get driver rides error:', error);
    return NextResponse.json(
      { error: 'Failed to get rides' },
      { status: 500 }
    );
  }
}
