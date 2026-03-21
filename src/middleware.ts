/**
 * Middleware de proteccion de rutas
 * Ultima actualizacion: 2026-03-21
 * 
 * Protege rutas segun el rol del usuario:
 * - /driver/*: Solo conductores verificados
 * - /admin/*: Solo admins
 * - /(app)/*: Cualquier usuario autenticado
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rutas publicas que no requieren auth
  const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/auth/register'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Obtener token de la cookie
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    // No hay token, redirigir a login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Verificar token
  let payload;
  try {
    const result = await jwtVerify(token, JWT_SECRET);
    payload = result.payload;
  } catch {
    // Token invalido, redirigir a login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
  
  const role = payload.role as string;
  const userId = payload.userId as string;
  
  // Proteger rutas de conductor
  if (pathname.startsWith('/driver')) {
    // El usuario debe ser conductor
    if (role !== 'driver') {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    
    // Si intenta acceder a dashboard sin estar verificado, redirigir a verificacion
    // Esto se maneja en las paginas, no aqui, porque necesitamos consultar la DB
  }
  
  // Proteger rutas de admin
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }
  
  // Proteger rutas de la app (pasajero)
  if (pathname.startsWith('/home') || pathname.startsWith('/history') || pathname.startsWith('/profile')) {
    if (role !== 'passenger' && role !== 'driver' && role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Proteger rutas de API sensibles
  if (pathname.startsWith('/api/admin') && role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  if (pathname.startsWith('/api/driver') && role !== 'driver') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/driver/:path*',
    '/admin/:path*',
    '/home/:path*',
    '/history/:path*',
    '/profile/:path*',
    '/api/auth/:path*',
    '/api/driver/:path*',
    '/api/admin/:path*',
    '/api/rides/:path*',
  ],
};
