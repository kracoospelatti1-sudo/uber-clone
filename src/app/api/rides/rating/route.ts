import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, getOne } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rideId, ratedId, score, comment, tags } = await request.json();

    if (!rideId || !ratedId || !score) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (score < 1 || score > 5) {
      return NextResponse.json({ error: 'Score must be between 1 and 5' }, { status: 400 });
    }

    // Avoid self-rating
    if (ratedId === session.userId) {
      return NextResponse.json({ error: 'Cannot rate yourself' }, { status: 400 });
    }

    // Check if already rated this ride
    const existing = await getOne<{ id: string }>(
      'SELECT id FROM ratings WHERE ride_id = $1 AND rater_id = $2',
      [rideId, session.userId as string]
    );
    if (existing) {
      return NextResponse.json({ error: 'Already rated this ride' }, { status: 409 });
    }

    const tagsJson = tags && Array.isArray(tags) ? JSON.stringify(tags) : null;

    await query(
      `INSERT INTO ratings (ride_id, rater_id, rated_id, score, comment, tags)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [rideId, session.userId as string, ratedId, score, comment || null, tagsJson]
    );

    // Determine if the person being rated is a driver
    const ratedUser = await getOne<{ role: string }>(
      'SELECT role FROM users WHERE id = $1',
      [ratedId]
    );

    if (ratedUser?.role === 'driver') {
      await query(
        `UPDATE driver_stats
         SET total_rating = total_rating + $1, rating_count = rating_count + 1
         WHERE driver_id = $2`,
        [score, ratedId]
      );
    }

    // Always update the overall user rating from the average of all received ratings
    await query(
      `UPDATE users SET rating = (
         SELECT COALESCE(AVG(score), 5.0) FROM ratings WHERE rated_id = $1
       ) WHERE id = $1`,
      [ratedId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rating error:', error);
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rideId = searchParams.get('rideId');

    if (!rideId) {
      return NextResponse.json({ error: 'rideId required' }, { status: 400 });
    }

    // Get the rating the current user received for this ride
    const rating = await getOne<{ score: number; comment: string | null; tags: string | null; rater_name: string }>(
      `SELECT r.score, r.comment, r.tags, u.full_name as rater_name
       FROM ratings r
       JOIN users u ON r.rater_id = u.id
       WHERE r.ride_id = $1 AND r.rated_id = $2`,
      [rideId, session.userId as string]
    );

    return NextResponse.json({ rating });
  } catch (error) {
    console.error('Get rating error:', error);
    return NextResponse.json({ error: 'Failed to get rating' }, { status: 500 });
  }
}
