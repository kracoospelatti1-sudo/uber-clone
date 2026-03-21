/**
 * API: Verificacion de vehiculo del conductor
 * Ultima actualizacion: 2026-03-21
 * Auto-aprobacion para testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, getOne } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { VehicleDocument, VehicleType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar que es conductor
    if (session.role !== 'driver') {
      return NextResponse.json({ error: 'Only drivers can verify' }, { status: 403 });
    }

    const {
      licensePlate,
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      vehicleType = 'economico',
      photoFront = null,
      photoBack = null,
      licensePhoto = null,
    } = await request.json();

    // Validaciones
    if (!licensePlate || !vehicleBrand || !vehicleModel || !vehicleYear || !vehicleColor) {
      return NextResponse.json(
        { error: 'All vehicle fields are required' },
        { status: 400 }
      );
    }

    // Verificar si ya existe documento
    const existing = await getOne<{ id: string }>(
      'SELECT id FROM vehicle_documents WHERE driver_id = $1',
      [session.userId as string]
    );

    if (existing) {
      // Actualizar
      await query(
        `UPDATE vehicle_documents SET
          license_plate = $2,
          vehicle_brand = $3,
          vehicle_model = $4,
          vehicle_year = $5,
          vehicle_color = $6,
          vehicle_type = $7,
          photo_front = $8,
          photo_back = $9,
          license_photo = $10,
          verification_status = 'approved', -- Auto-aprobado para testing
          rejection_reason = NULL,
          updated_at = NOW()
         WHERE driver_id = $1`,
        [session.userId, licensePlate.toUpperCase(), vehicleBrand, vehicleModel, 
         vehicleYear, vehicleColor, vehicleType, photoFront, photoBack, licensePhoto]
      );
    } else {
      // Crear nuevo
      await query(
        `INSERT INTO vehicle_documents 
          (driver_id, license_plate, vehicle_brand, vehicle_model, vehicle_year, vehicle_color, vehicle_type, photo_front, photo_back, license_photo, verification_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'approved')`,
        [session.userId as string, licensePlate.toUpperCase(), vehicleBrand, vehicleModel,
         vehicleYear, vehicleColor, vehicleType, photoFront, photoBack, licensePhoto]
      );
    }

    // Actualizar driver_profile con la patente
    await query(
      `UPDATE driver_profiles SET 
        license_plate = $2, 
        verification_status = 'approved',
        verified = true
       WHERE user_id = $1`,
      [session.userId as string, licensePlate.toUpperCase()]
    );

    return NextResponse.json({ success: true, message: 'Vehicle verified successfully' });
  } catch (error) {
    console.error('Vehicle verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
