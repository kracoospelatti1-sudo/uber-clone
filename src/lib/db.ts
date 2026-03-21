import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_DATABASE_URL!);

export { sql };

export async function query<T = unknown>(text: string, params?: (string | number | null)[]) {
  const result = await sql(text, params as (string | number)[]);
  return result as T[];
}

export async function getOne<T = unknown>(text: string, params?: (string | number | null)[]) {
  const rows = await query<T>(text, params as (string | number | null)[] | undefined);
  return rows[0];
}
