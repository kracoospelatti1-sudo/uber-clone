import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getOne } from '@/lib/db';

interface RideEtaData {
  pickup_lat: number;
  pickup_lng: number;
  status: string;
  driver_lat: number | null;
  driver_lng: number | null;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const ride = await getOne<RideEtaData>(
      `SELECT r.pickup_lat, r.pickup_lng, r.status,
              dp.current_lat as driver_lat, dp.current_lng as driver_lng
       FROM rides r
       LEFT JOIN users u ON r.driver_id = u.id
       LEFT JOIN driver_profiles dp ON u.id = dp.user_id
       WHERE r.id = $1 AND (r.passenger_id = $2 OR r.driver_id = $2)`,
      [id, session.userId as string]
    );

    if (!ride) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    }

    if (!ride.driver_lat || !ride.driver_lng || ride.status !== 'accepted') {
      return NextResponse.json({ eta_minutes: null, distance_km: null });
    }

    const distanceKm = haversineKm(
      ride.driver_lat,
      ride.driver_lng,
      ride.pickup_lat,
      ride.pickup_lng
    );

    // Assume average urban speed of 30 km/h
    const etaMinutes = Math.ceil((distanceKm / 30) * 60);

    return NextResponse.json({
      eta_minutes: etaMinutes,
      distance_km: Math.round(distanceKm * 10) / 10,
      driver_lat: ride.driver_lat,
      driver_lng: ride.driver_lng,
    });
  } catch (error) {
    console.error('ETA error:', error);
    return NextResponse.json({ error: 'Failed to calculate ETA' }, { status: 500 });
  }
}
