import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getOne } from '@/lib/db';
import type { DriverProfile } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const ride = await getOne<{ 
      id: string; 
      driver_id: string | null;
      passenger_id: string;
      status: string;
    }>(
      'SELECT id, driver_id, passenger_id, status FROM rides WHERE id = $1',
      [id]
    );

    if (!ride) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    }

    if (ride.passenger_id !== (session.userId as string) && ride.driver_id !== (session.userId as string)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const trackingData: {
      driver_lat: number | null;
      driver_lng: number | null;
      heading: number | null;
      eta_minutes: number | null;
    } = {
      driver_lat: null,
      driver_lng: null,
      heading: null,
      eta_minutes: null,
    };

    if (ride.driver_id && (ride.status === 'accepted' || ride.status === 'started')) {
      const driverProfile = await getOne<DriverProfile>(
        'SELECT current_lat, current_lng FROM driver_profiles WHERE user_id = $1',
        [ride.driver_id]
      );

      if (driverProfile) {
        trackingData.driver_lat = driverProfile.current_lat;
        trackingData.driver_lng = driverProfile.current_lng;
        trackingData.eta_minutes = ride.status === 'accepted' ? 5 : null;
      }
    }

    return NextResponse.json(trackingData);
  } catch (error) {
    console.error('Get tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to get tracking' },
      { status: 500 }
    );
  }
}
