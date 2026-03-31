// lib/db.ts
import { Pool } from 'pg';

declare global {
  // Prevents multiple Pool instances during Next.js hot-reload in dev
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  return new Pool({
    host:     process.env.PGHOST,
    port:     Number(process.env.PGPORT),
    database: process.env.PGDATABASE,
    user:     process.env.PGUSER,
    password: process.env.PGPASSWORD,
    max:      10,                      
    idleTimeoutMillis:       30_000,  
    connectionTimeoutMillis:  5_000,   
    ssl:
      process.env.PGSSL === 'true'
        ? { rejectUnauthorized: false } 
        : false,
  });
}


const pool: Pool =
  process.env.NODE_ENV === 'development'
    ? (global._pgPool ??= createPool())
    : createPool();

export default pool;

/**
 * Fire-and-forget query helper.
 * Acquires a client from the pool, runs the query, then releases it.
 *
 * Usage:
 *   const rows = await query<User>('SELECT * FROM users WHERE email = $1', [email]);
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}