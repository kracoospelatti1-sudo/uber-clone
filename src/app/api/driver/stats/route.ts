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

    // Ganancias del dia
    const todayResult = await query<{ total: string; count: string }>(
      `SELECT COALESCE(SUM(fare), 0) as total, COUNT(*) as count
       FROM rides
       WHERE driver_id = $1
         AND status = 'completed'
         AND completed_at::date = CURRENT_DATE`,
      [userId]
    );

    // Ganancias de la semana
    const weekResult = await query<{ total: string; count: string }>(
      `SELECT COALESCE(SUM(fare), 0) as total, COUNT(*) as count
       FROM rides
       WHERE driver_id = $1
         AND status = 'completed'
         AND completed_at >= CURRENT_DATE - INTERVAL '7 days'`,
      [userId]
    );

    // Ganancias del mes
    const monthResult = await query<{ total: string; count: string }>(
      `SELECT COALESCE(SUM(fare), 0) as total, COUNT(*) as count
       FROM rides
       WHERE driver_id = $1
         AND status = 'completed'
         AND completed_at >= CURRENT_DATE - INTERVAL '30 days'`,
      [userId]
    );

    // Tasa de aceptacion (viajes aceptados / (aceptados + cancelados por conductor en los ultimos 7 dias))
    const acceptanceResult = await query<{ accepted: string; total: string }>(
      `SELECT
         COUNT(CASE WHEN status IN ('accepted','started','completed') THEN 1 END) as accepted,
         COUNT(*) as total
       FROM rides
       WHERE driver_id = $1
         AND requested_at >= CURRENT_DATE - INTERVAL '7 days'`,
      [userId]
    );
    const totalOffered = parseInt(acceptanceResult[0]?.total || '0');
    const totalAccepted = parseInt(acceptanceResult[0]?.accepted || '0');
    const acceptanceRate = totalOffered > 0 ? Math.round((totalAccepted / totalOffered) * 100) : 100;

    // Ultimas 5 calificaciones recibidas
    const recentRatings = await query<{
      score: number;
      comment: string | null;
      tags: string | null;
      rater_name: string;
      created_at: string;
    }>(
      `SELECT r.score, r.comment, r.tags, u.full_name as rater_name, r.created_at
       FROM ratings r
       JOIN users u ON r.rater_id = u.id
       WHERE r.rated_id = $1
       ORDER BY r.created_at DESC
       LIMIT 5`,
      [userId]
    );

    const avgRating = stats.rating_count > 0
      ? Math.round((stats.total_rating / stats.rating_count) * 10) / 10
      : 5.0;

    const earningsStats: EarningsStats = {
      today: parseFloat(todayResult[0]?.total || '0'),
      week: parseFloat(weekResult[0]?.total || '0'),
      month: parseFloat(monthResult[0]?.total || '0'),
      total: stats.total_earnings,
      rides_today: parseInt(todayResult[0]?.count || '0'),
      rides_week: parseInt(weekResult[0]?.count || '0'),
      rides_month: parseInt(monthResult[0]?.count || '0'),
    };

    return NextResponse.json({
      stats: {
        ...stats,
        avg_rating: avgRating,
        today_earnings: earningsStats.today,
        week_earnings: earningsStats.week,
        month_earnings: earningsStats.month,
        rides_today: earningsStats.rides_today,
        rides_week: earningsStats.rides_week,
        acceptance_rate: acceptanceRate,
      },
      recent_ratings: recentRatings,
    });
  } catch (error) {
    console.error('Get driver stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}
