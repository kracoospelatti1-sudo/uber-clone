import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_DATABASE_URL!);

export { sql };

export async function query<T = unknown>(text: string, params?: unknown[]) {
  const result = await sql(text, params as string[]);
  return result as T[];
}

export async function getOne<T = unknown>(text: string, params?: unknown[]) {
  const rows = await query<T>(text, params);
  return rows[0];
}
