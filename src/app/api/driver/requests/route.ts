/**
 * API: Solicitudes pendientes para conductor
 * Ultima actualizacion: 2026-03-21
 */

import { NextResponse } from 'next/server';
import { query, getOne } from '@/lib/db';
import { getSession, isDriverVerified } from '@/lib/auth';
import type { Ride, User } from '@/types';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar que es conductor verificado
    const verified = await isDriverVerified(session.userId as string);
    if (!verified) {
      return NextResponse.json({ error: 'Driver not verified' }, { status: 403 });
    }

    // Obtener viajes solicitados (sin conductor aun)
    const rides = await query<Ride & { passenger_name: string }>(
      `SELECT r.*, u.full_name as passenger_name
       FROM rides r
       JOIN users u ON r.passenger_id = u.id
       WHERE r.status = 'requested'
         AND r.driver_id IS NULL
       ORDER BY r.requested_at DESC
       LIMIT 20`
    );

    return NextResponse.json({ rides });
  } catch (error) {
    console.error('Get driver requests error:', error);
    return NextResponse.json(
      { error: 'Failed to get requests' },
      { status: 500 }
    );
  }
}
