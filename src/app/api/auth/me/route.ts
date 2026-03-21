/**
 * API: Usuario actual (me)
 * Ultima actualizacion: 2026-03-21
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
        avatar: user.avatar_url,
        phone: user.phone,
        rating: user.rating,
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}
