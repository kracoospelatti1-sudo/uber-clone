/**
 * API: Notificaciones del usuario
 * Ultima actualizacion: 2026-03-21
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { Notification } from '@/types';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener notificaciones del usuario (ultimas 50)
    const notifications = await query<Notification>(
      `SELECT id, user_id, title, message, type, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [session.userId as string]
    );

    // Contar no leidas
    const unreadResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [session.userId as string]
    );

    const unreadCount = parseInt(unreadResult[0]?.count || '0');

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    );
  }
}
