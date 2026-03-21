import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface DriverResult {
  id: string;
  user_id: string;
  license_plate: string;
  vehicle_model: string | null;
  vehicle_color: string | null;
  current_lat: string;
  current_lng: string;
  full_name: string;
  rating: string;
  phone: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '10');

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const result = await query<DriverResult>(
      `SELECT dp.*, u.full_name, u.rating, u.phone
       FROM driver_profiles dp
       JOIN users u ON dp.user_id = u.id
       WHERE dp.is_available = true AND dp.verified = true
       LIMIT 10`
    );

    const driversWithDistance = result.map(driver => {
      const distance = calculateDistance(
        lat, lng,
        parseFloat(driver.current_lat) || 0,
        parseFloat(driver.current_lng) || 0
      );
      return { ...driver, distance };
    });

    return NextResponse.json({ 
      drivers: driversWithDistance.filter(d => d.distance <= radius) 
    });
  } catch (error) {
    console.error('Get nearby drivers error:', error);
    return NextResponse.json(
      { error: 'Failed to get nearby drivers' },
      { status: 500 }
    );
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
