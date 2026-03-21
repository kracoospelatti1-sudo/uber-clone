import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, suspended, reason } = await request.json();

    if (suspended === undefined) {
      return NextResponse.json({ error: 'Suspended status required' }, { status: 400 });
    }

    await query(
      `UPDATE users SET is_suspended = $1, suspension_reason = $2, updated_at = NOW() WHERE id = $3`,
      [suspended, suspended ? (reason || 'Suspended by admin') : null, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Suspend user error:', error);
    return NextResponse.json({ error: 'Failed to suspend user' }, { status: 500 });
  }
}
