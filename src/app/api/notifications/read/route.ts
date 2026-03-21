/**
 * API: Marcar notificaciones como leidas
 * Ultima actualizacion: 2026-03-21
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [session.userId as string]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark notifications as read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
