/**
 * API: Estadisticas del admin
 * Ultima actualizacion: 2026-03-21
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession, isAdmin } from '@/lib/auth';
import type { AdminStats } from '@/types';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar rol admin
    const admin = await isAdmin(session.userId as string);
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Contar usuarios
    const usersResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM users'
    );

    // Contar conductores
    const driversResult = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM users WHERE role = 'driver'"
    );

    // Contar pasajeros
    const passengersResult = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM users WHERE role = 'passenger'"
    );

    // Viajes de hoy
    const todayRidesResult = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM rides WHERE requested_at::date = CURRENT_DATE"
    );

    // Viajes de la semana
    const weekRidesResult = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM rides WHERE requested_at >= CURRENT_DATE - INTERVAL '7 days'"
    );

    // Viajes del mes
    const monthRidesResult = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM rides WHERE requested_at >= CURRENT_DATE - INTERVAL '30 days'"
    );

    // Reportes pendientes
    const pendingReportsResult = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM reports WHERE status = 'pending'"
    );

    // Verificaciones pendientes
    const pendingVerificationsResult = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM vehicle_documents WHERE verification_status = 'pending'"
    );

    // Ganancias de hoy
    const todayEarningsResult = await query<{ total: string }>(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed' AND created_at::date = CURRENT_DATE"
    );

    const stats: AdminStats = {
      total_users: parseInt(usersResult[0]?.count || '0'),
      total_drivers: parseInt(driversResult[0]?.count || '0'),
      total_passengers: parseInt(passengersResult[0]?.count || '0'),
      total_rides_today: parseInt(todayRidesResult[0]?.count || '0'),
      total_rides_week: parseInt(weekRidesResult[0]?.count || '0'),
      total_rides_month: parseInt(monthRidesResult[0]?.count || '0'),
      pending_reports: parseInt(pendingReportsResult[0]?.count || '0'),
      pending_verifications: parseInt(pendingVerificationsResult[0]?.count || '0'),
      total_earnings_today: parseFloat(todayEarningsResult[0]?.total || '0'),
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}
