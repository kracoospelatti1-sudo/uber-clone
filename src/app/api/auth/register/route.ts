import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';
import type { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, phone, role = 'passenger' } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password and full name are required' },
        { status: 400 }
      );
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    
    const result = await query<Pick<User, 'id' | 'email' | 'full_name' | 'role'>>(
      `INSERT INTO users (email, password_hash, full_name, phone, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, full_name, role`,
      [email, passwordHash, fullName, phone || null, role]
    );

    const user = result[0];
    const token = await createToken(user.id, user.email, user.role);

    const response = NextResponse.json({ 
      user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role } 
    });
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
