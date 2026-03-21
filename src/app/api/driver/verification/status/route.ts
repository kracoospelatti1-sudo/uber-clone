/**
 * API: Estado de verificacion del conductor
 * Ultima actualizacion: 2026-03-21
 */

import { NextResponse } from 'next/server';
import { getOne } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { VehicleDocument } from '@/types';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const document = await getOne<VehicleDocument>(
      'SELECT * FROM vehicle_documents WHERE driver_id = $1',
      [session.userId as string]
    );

    if (!document) {
      return NextResponse.json({ document: null });
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Get verification status error:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
