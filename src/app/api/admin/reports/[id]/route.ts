import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { status, adminNotes } = await request.json();

    if (!status || !['reviewed', 'resolved', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await query(
      `UPDATE reports SET status = $1, admin_notes = $2, resolved_at = NOW() WHERE id = $3`,
      [status, adminNotes || null, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
