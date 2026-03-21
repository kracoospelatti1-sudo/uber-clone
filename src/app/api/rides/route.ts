import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pickupAddress, pickupLat, pickupLng, dropoffAddress, dropoffLat, dropoffLng, estimatedTime, distanceKm } = await request.json();

    if (!pickupAddress || !dropoffAddress) {
      return NextResponse.json(
        { error: 'Pickup and dropoff addresses are required' },
        { status: 400 }
      );
    }

    const BASE_FARE = 5;
    const PER_KM = 2;
    const PER_MINUTE = 0.5;
    const fare = BASE_FARE + (distanceKm * PER_KM) + ((estimatedTime || 15) * PER_MINUTE);

    const result = await query(
      `INSERT INTO rides (passenger_id, pickup_address, pickup_lat, pickup_lng, dropoff_address, dropoff_lat, dropoff_lng, fare, distance_km, estimated_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'requested')
       RETURNING *`,
      [session.userId, pickupAddress, pickupLat, pickupLng, dropoffAddress, dropoffLat, dropoffLng, Math.round(fare * 100) / 100, distanceKm, estimatedTime]
    );

    return NextResponse.json({ ride: result[0] });
  } catch (error) {
    console.error('Request ride error:', error);
    return NextResponse.json(
      { error: 'Failed to request ride' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let queryText = `
      SELECT r.*, 
             u.full_name as driver_name,
             u.phone as driver_phone
      FROM rides r
      LEFT JOIN users u ON r.driver_id = u.id
      WHERE r.passenger_id = $1
    `;
    const params: unknown[] = [session.userId];

    if (status) {
      queryText += ' AND r.status = $2';
      params.push(status);
    }

    queryText += ' ORDER BY r.requested_at DESC';

    const rides = await query(queryText, params);
    return NextResponse.json({ rides });
  } catch (error) {
    console.error('Get rides error:', error);
    return NextResponse.json(
      { error: 'Failed to get rides' },
      { status: 500 }
    );
  }
}
