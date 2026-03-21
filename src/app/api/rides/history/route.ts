import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import type { Ride } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let queryText = `
      SELECT r.*, 
             u.full_name as driver_name,
             u.phone as driver_phone,
             dp.license_plate, dp.vehicle_model, dp.vehicle_color
       FROM rides r
       LEFT JOIN users u ON r.driver_id = u.id
       LEFT JOIN driver_profiles dp ON u.id = dp.user_id
       WHERE r.passenger_id = $1
    `;
    const params: (string | number | null)[] = [session.userId as string];

    if (startDate) {
      params.push(startDate);
      queryText += ` AND r.requested_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      queryText += ` AND r.requested_at <= $${params.length}`;
    }

    queryText += ' ORDER BY r.requested_at DESC';

    const rides = await query<Ride & { 
      driver_name: string | null;
      driver_phone: string | null;
      license_plate: string | null;
      vehicle_model: string | null;
      vehicle_color: string | null;
    }>(queryText, params);

    return NextResponse.json({ rides });
  } catch (error) {
    console.error('Get ride history error:', error);
    return NextResponse.json(
      { error: 'Failed to get ride history' },
      { status: 500 }
    );
  }
}
