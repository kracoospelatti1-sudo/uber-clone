import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { Ride } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const result = await query<Ride>(
      `SELECT r.*, 
              p.full_name as passenger_name,
              d.full_name as driver_name,
              dp.license_plate, dp.vehicle_model, dp.vehicle_color
       FROM rides r
       LEFT JOIN users p ON r.passenger_id = p.id
       LEFT JOIN users d ON r.driver_id = d.id
       LEFT JOIN driver_profiles dp ON d.id = dp.user_id
       WHERE r.id = $1 AND (r.passenger_id = $2 OR r.driver_id = $2)`,
      [id, session.userId as string]
    );

    if (result.length === 0) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    }

    return NextResponse.json({ ride: result[0] });
  } catch (error) {
    console.error('Get ride error:', error);
    return NextResponse.json(
      { error: 'Failed to get ride' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await request.json();

    const rideResult = await query<Pick<Ride, 'id' | 'status' | 'driver_id' | 'passenger_id' | 'fare'>>('SELECT id, status, driver_id, passenger_id, fare FROM rides WHERE id = $1', [id]);
    if (rideResult.length === 0) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    }

    const ride = rideResult[0];
    let updateQuery = '';
    let now = new Date().toISOString();

    switch (action) {
      case 'accept':
        if (ride.status !== 'requested') {
          return NextResponse.json({ error: 'Ride cannot be accepted' }, { status: 400 });
        }
        updateQuery = `UPDATE rides SET driver_id = $1, status = 'accepted', accepted_at = $2 WHERE id = $3 RETURNING *`;
        const acceptResult = await query(updateQuery, [session.userId as string, now, id]);
        return NextResponse.json({ ride: acceptResult[0] });

      case 'start':
        if (ride.driver_id !== (session.userId as string) || ride.status !== 'accepted') {
          return NextResponse.json({ error: 'Cannot start ride' }, { status: 400 });
        }
        updateQuery = `UPDATE rides SET status = 'started', started_at = $1 WHERE id = $2 RETURNING *`;
        const startResult = await query(updateQuery, [now, id]);
        return NextResponse.json({ ride: startResult[0] });

      case 'complete':
        if (ride.driver_id !== (session.userId as string) || ride.status !== 'started') {
          return NextResponse.json({ error: 'Cannot complete ride' }, { status: 400 });
        }
        updateQuery = `UPDATE rides SET status = 'completed', completed_at = $1 WHERE id = $2 RETURNING *`;
        const completeResult = await query(updateQuery, [now, id]);
        
        await query(
          `INSERT INTO payments (ride_id, passenger_id, amount, status) VALUES ($1, $2, $3, 'completed')`,
          [id, ride.passenger_id, ride.fare]
        );
        
        return NextResponse.json({ ride: completeResult[0] });

      case 'cancel':
        if (ride.status === 'completed' || ride.status === 'cancelled') {
          return NextResponse.json({ error: 'Cannot cancel this ride' }, { status: 400 });
        }
        updateQuery = `UPDATE rides SET status = 'cancelled' WHERE id = $1 RETURNING *`;
        const cancelResult = await query(updateQuery, [id]);
        return NextResponse.json({ ride: cancelResult[0] });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Update ride error:', error);
    return NextResponse.json(
      { error: 'Failed to update ride' },
      { status: 500 }
    );
  }
}
