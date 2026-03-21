/**
 * API: Registro de usuario
 * Ultima actualizacion: 2026-03-21
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, createToken, createDriverProfile, createDriverStats } from '@/lib/auth';
import type { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      password, 
      fullName, 
      phone, 
      role = 'passenger',
      avatarUrl = null 
    } = await request.json();

    // Validaciones
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password and full name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existing = await query<Pick<User, 'id'>>(
      'SELECT id FROM users WHERE email = $1', 
      [email as string]
    );
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash del password
    const passwordHash = await hashPassword(password);
    
    // Crear usuario
    const result = await query<Pick<User, 'id' | 'email' | 'full_name' | 'role' | 'avatar_url'>>(
      `INSERT INTO users (email, password_hash, full_name, phone, role, avatar_url) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, email, full_name, role, avatar_url`,
      [email, passwordHash, fullName, phone || null, role, avatarUrl]
    );

    const user = result[0];

    // Si es conductor, crear perfil y estadisticas
    if (role === 'driver') {
      await createDriverProfile(user.id);
      await createDriverStats(user.id);
    }

    // Crear token JWT
    const token = await createToken(user.id, user.email, user.role);

    const response = NextResponse.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.full_name, 
        role: user.role,
        avatarUrl: user.avatar_url
      } 
    });
    
    // Establecer cookie de autenticacion
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
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
