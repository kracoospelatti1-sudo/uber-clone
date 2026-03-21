import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { getOne } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fullName, phone, avatarUrl, currentPassword, newPassword } = await request.json();

    const updates: string[] = [];
    const params: (string | number | null)[] = [];
    let paramIndex = 1;

    if (fullName !== undefined) {
      updates.push(`full_name = $${paramIndex++}`);
      params.push(fullName);
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      params.push(phone);
    }

    if (avatarUrl !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      params.push(avatarUrl);
    }

    if (newPassword && currentPassword) {
      const user = await getOne<{ password_hash: string }>(
        'SELECT password_hash FROM users WHERE id = $1',
        [session.userId as string]
      );

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const bcrypt = await import('bcryptjs');
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      const hashedPassword = await hashPassword(newPassword);
      updates.push(`password_hash = $${paramIndex++}`);
      params.push(hashedPassword);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    params.push(session.userId as string);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, full_name, phone, avatar_url, role`,
      params
    );

    return NextResponse.json({ user: result[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
