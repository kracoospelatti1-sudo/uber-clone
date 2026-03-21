/**
 * API: Chat del viaje
 * Ultima actualizacion: 2026-03-21
 * Retencion de mensajes: 30 dias (filtro en consulta)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, getOne } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { ChatMessage, Ride } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ rideId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rideId } = await params;
    const userId = session.userId as string;

    // Verificar que el usuario es parte del viaje
    const ride = await getOne<Ride>(
      'SELECT * FROM rides WHERE id = $1 AND (passenger_id = $2 OR driver_id = $2)',
      [rideId, userId]
    );

    if (!ride) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    }

    // Obtener mensajes (solo ultimos 30 dias)
    const messages = await query<ChatMessage & { sender_name: string }>(
      `SELECT cm.*, u.full_name as sender_name
       FROM chat_messages cm
       JOIN users u ON cm.sender_id = u.id
       WHERE cm.ride_id = $1 
         AND cm.created_at > NOW() - INTERVAL '30 days'
       ORDER BY cm.created_at ASC`,
      [rideId]
    );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get chat messages error:', error);
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ rideId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rideId } = await params;
    const userId = session.userId as string;
    const { message } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Verificar que el usuario es parte del viaje y este aceptado o en curso
    const ride = await getOne<Ride>(
      `SELECT * FROM rides 
       WHERE id = $1 
         AND (passenger_id = $2 OR driver_id = $2)
         AND status IN ('accepted', 'started')`,
      [rideId, userId]
    );

    if (!ride) {
      return NextResponse.json({ error: 'Cannot send message' }, { status: 400 });
    }

    // Guardar mensaje
    const result = await query<ChatMessage & { sender_name: string }>(
      `INSERT INTO chat_messages (ride_id, sender_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [rideId, userId, message.trim()]
    );

    // Obtener nombre del sender
    const sender = await getOne<{ full_name: string }>(
      'SELECT full_name FROM users WHERE id = $1',
      [userId]
    );

    const newMessage = { ...result[0], sender_name: sender?.full_name || 'Unknown' };

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
