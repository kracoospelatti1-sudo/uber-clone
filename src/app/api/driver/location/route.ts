import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'driver') {
      return NextResponse.json({ error: 'Only drivers can update location' }, { status: 403 });
    }

    const { lat, lng, heading } = await request.json();

    if (lat === undefined || lng === undefined) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
    }

    await query(
      `UPDATE driver_profiles 
       SET current_lat = $1, current_lng = $2
       WHERE user_id = $3`,
      [lat, lng, session.userId as string]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update driver location error:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}
