import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import type { User } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    let queryText = `
      SELECT id, email, full_name, phone, role, avatar_url, rating, is_suspended, created_at
      FROM users
      WHERE 1=1
    `;
    const params: (string | number | null)[] = [];

    if (role) {
      params.push(role);
      queryText += ` AND role = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      queryText += ` AND (full_name ILIKE $${params.length - 1} OR email ILIKE $${params.length})`;
    }

    queryText += ' ORDER BY created_at DESC';

    const users = await query<User>(queryText, params);

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Failed to get users' }, { status: 500 });
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

    const { userId, role, isSuspended } = await request.json();

    const updates: string[] = [];
    const params: (string | number | null)[] = [];
    let paramIndex = 1;

    if (role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      params.push(role);
    }

    if (isSuspended !== undefined) {
      updates.push(`is_suspended = $${paramIndex++}`);
      params.push(isSuspended);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    params.push(userId);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      params
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
