// lib/db.ts
import { Pool } from 'pg';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

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
 * Memoized per-request using React.cache.
 *
 * Usage:
 *   const rows = await query<User>('SELECT * FROM users WHERE email = $1', [email]);
 */
export const query = cache(async function query<T = Record<string, unknown>>(
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
});

/**
 * Parses SQL to extract table names for caching tags.
 */
function extractTableNames(sql: string): string[] {
  const regex = /\bFROM\s+([a-zA-Z0-9_]+)|\bJOIN\s+([a-zA-Z0-9_]+)|\bUPDATE\s+([a-zA-Z0-9_]+)|\bINSERT\s+INTO\s+([a-zA-Z0-9_]+)|\bDELETE\s+FROM\s+([a-zA-Z0-9_]+)/gi;
  const matches = [...sql.matchAll(regex)];
  const tables = new Set<string>();
  for (const match of matches) {
    for (let i = 1; i <= 5; i++) {
      if (match[i]) tables.add(match[i].toLowerCase());
    }
  }
  return Array.from(tables);
}

/**
 * Cached query helper using Next.js unstable_cache.
 * Automatically tags the cache with the table names involved in the query.
 * Only use this for SELECT queries.
 */
export async function cachedQuery<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const tags = extractTableNames(sql);
  const queryKey = JSON.stringify({ sql, params });

  const fetcher = async () => query<T>(sql, params);
  
  const getCachedData = unstable_cache(
    fetcher,
    [queryKey],
    { tags: ['global-db', ...tags], revalidate: 60 }
  );

  return getCachedData();
}