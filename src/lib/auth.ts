/**
 * Funciones de autenticacion para la app Uber Clone
 * Ultima actualizacion: 2026-03-21
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { query, getOne } from './db';
import type { User, DriverProfile, VehicleDocument } from '@/types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);

/**
 * Crea un token JWT con los datos del usuario
 */
export async function createToken(userId: string, email: string, role: string) {
  return new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verifica un token JWT y retorna el payload
 */
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Obtiene la sesion actual del usuario desde la cookie
 */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) return null;
  
  return verifyToken(token);
}

/**
 * Obtiene el usuario completo desde la base de datos
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session || !session.userId) return null;
  
  const user = await getOne<User>(
    'SELECT * FROM users WHERE id = $1',
    [session.userId as string]
  );
  
  return user;
}

/**
 * Verifica si un conductor tiene el vehiculo verificado
 */
export async function isDriverVerified(userId: string): Promise<boolean> {
  const vehicleDoc = await getOne<VehicleDocument>(
    'SELECT verification_status FROM vehicle_documents WHERE driver_id = $1',
    [userId]
  );
  
  return vehicleDoc?.verification_status === 'approved';
}

/**
 * Verifica si un usuario esta suspendido
 */
export async function isUserSuspended(userId: string): Promise<boolean> {
  const user = await getOne<Pick<User, 'is_suspended'>>(
    'SELECT is_suspended FROM users WHERE id = $1',
    [userId]
  );
  
  return user?.is_suspended === true;
}

/**
 * Verifica si el usuario es admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await getOne<Pick<User, 'role'>>(
    'SELECT role FROM users WHERE id = $1',
    [userId]
  );
  
  return user?.role === 'admin';
}

/**
 * Genera hash de password
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 10);
}

/**
 * Compara password con hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
}

/**
 * Obtiene el perfil del conductor
 */
export async function getDriverProfile(userId: string) {
  return getOne<DriverProfile>(
    'SELECT * FROM driver_profiles WHERE user_id = $1',
    [userId]
  );
}

/**
 * Crea el perfil inicial de conductor cuando se registra
 */
export async function createDriverProfile(userId: string) {
  await query(
    `INSERT INTO driver_profiles (user_id, license_plate, is_available, verification_status)
     VALUES ($1, 'PENDING', false, 'pending')
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}

/**
 * Crea las estadisticas iniciales del conductor
 */
export async function createDriverStats(userId: string) {
  await query(
    `INSERT INTO driver_stats (driver_id, total_rides, total_rating, rating_count, total_earnings, cancellation_count)
     VALUES ($1, 0, 0, 0, 0, 0)
     ON CONFLICT (driver_id) DO NOTHING`,
    [userId]
  );
}
