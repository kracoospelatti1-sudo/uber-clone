import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import type { VehicleDocument } from '@/types';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const documents = await query<VehicleDocument & { driver_name: string; driver_email: string }>(
      `SELECT vd.*, u.full_name as driver_name, u.email as driver_email
       FROM vehicle_documents vd
       JOIN users u ON vd.driver_id = u.id
       ORDER BY vd.created_at DESC`
    );

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Get verifications error:', error);
    return NextResponse.json({ error: 'Failed to get verifications' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { documentId, status, rejectionReason } = await request.json();

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await query(
      `UPDATE vehicle_documents 
       SET verification_status = $1, rejection_reason = $2, updated_at = NOW()
       WHERE id = $3`,
      [status, status === 'rejected' ? rejectionReason : null, documentId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify driver error:', error);
    return NextResponse.json({ error: 'Failed to verify driver' }, { status: 500 });
  }
}
