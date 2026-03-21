import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rideId, ratedId, score, comment } = await request.json();

    if (!rideId || !ratedId || !score) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (score < 1 || score > 5) {
      return NextResponse.json({ error: 'Score must be between 1 and 5' }, { status: 400 });
    }

    await query(
      `INSERT INTO ratings (ride_id, rater_id, rated_id, score, comment)
       VALUES ($1, $2, $3, $4, $5)`,
      [rideId, session.userId as string, ratedId, score, comment || null]
    );

    const isDriver = ratedId === session.userId;
    
    if (isDriver) {
      await query(
        `UPDATE driver_stats 
         SET total_rating = total_rating + $1, rating_count = rating_count + 1
         WHERE driver_id = $2`,
        [score, ratedId]
      );
    } else {
      await query(
        `UPDATE users SET rating = (
          SELECT COALESCE(AVG(score), $1) FROM ratings WHERE rated_id = $2
        ) WHERE id = $2`,
        [score, ratedId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rating error:', error);
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
  }
}
