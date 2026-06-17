import { Pool } from 'pg';

const globalForDb = global as unknown as { pool: Pool | undefined };

export const pool =
  globalForDb.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;
