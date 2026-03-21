import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'driver') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isAvailable, lat, lng } = await request.json();

    await query(
      `INSERT INTO driver_profiles (user_id, license_plate, is_available, current_lat, current_lng, verified)
       VALUES ($1, 'PENDING', $2, $3, $4, false)
       ON CONFLICT (user_id) DO UPDATE SET
         is_available = $2,
         current_lat = $3,
         current_lng = $4`,
      [session.userId, isAvailable || false, lat || null, lng || null]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update driver status error:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
