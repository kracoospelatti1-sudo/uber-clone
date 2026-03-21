/**
 * API: Estadisticas del conductor
 * Ultima actualizacion: 2026-03-21
 */

import { NextResponse } from 'next/server';
import { query, getOne } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { DriverStats, EarningsStats } from '@/types';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.userId as string;
    
    // Obtener o crear stats
    let stats = await getOne<DriverStats>(
      'SELECT * FROM driver_stats WHERE driver_id = $1',
      [userId]
    );

    if (!stats) {
      // Crear stats iniciales
      await query(
        `INSERT INTO driver_stats (driver_id, total_rides, total_rating, rating_count, total_earnings, cancellation_count)
         VALUES ($1, 0, 0, 0, 0, 0)`,
        [userId]
      );
      stats = {
        driver_id: userId,
        total_rides: 0,
        total_rating: 0,
        rating_count: 0,
        total_earnings: 0,
        cancellation_count: 0,
        updated_at: new Date().toISOString(),
      };
    }

    // Obtener ganancias del dia
    const todayResult = await query<{ total: string }>(
      `SELECT COALESCE(SUM(fare), 0) as total 
       FROM rides 
       WHERE driver_id = $1 
         AND status = 'completed'
         AND completed_at::date = CURRENT_DATE`,
      [userId]
    );

    // Obtener ganancias de la semana
    const weekResult = await query<{ total: string }>(
      `SELECT COALESCE(SUM(fare), 0) as total 
       FROM rides 
       WHERE driver_id = $1 
         AND status = 'completed'
         AND completed_at >= CURRENT_DATE - INTERVAL '7 days'`,
      [userId]
    );

    const earningsStats: EarningsStats = {
      today: parseFloat(todayResult[0]?.total || '0'),
      week: parseFloat(weekResult[0]?.total || '0'),
      month: stats.total_earnings,
      total: stats.total_earnings,
      rides_today: 0,
      rides_week: stats.total_rides,
      rides_month: stats.total_rides,
    };

    return NextResponse.json({ 
      stats: {
        ...stats,
        today_earnings: earningsStats.today,
        week_earnings: earningsStats.week,
      } 
    });
  } catch (error) {
    console.error('Get driver stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}
