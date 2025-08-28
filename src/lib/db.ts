// Database connection utilities for Lernplaner PostgreSQL setup
import { Pool, PoolClient, QueryResult } from 'pg';

// Database configuration type
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

// Environment-based configuration
function getDatabaseConfig(): DatabaseConfig {
  const requiredEnvVars = ['DATABASE_HOST', 'DATABASE_NAME', 'DATABASE_USER', 'DATABASE_PASSWORD'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    host: process.env.DATABASE_HOST!,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME!,
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
    max: 10, // Maximum number of clients in pool
    idleTimeoutMillis: 30000, // Close idle clients after 30s
    connectionTimeoutMillis: 5000, // Return error after 5s if connection cannot be established
  };
}

// Main database pool for user data
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const config = getDatabaseConfig();
    pool = new Pool(config);

    // Handle pool errors
    pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Closing database pool...');
      await pool?.end();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('Closing database pool...');
      await pool?.end();
      process.exit(0);
    });
  }

  return pool;
}

// Query helper function with error handling
export async function query<T = any>(
  text: string, 
  params?: any[]
): Promise<QueryResult<T>> {
  const client = getPool();
  
  try {
    const start = Date.now();
    const result = await client.query<T>(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.log('Slow query detected:', { text, duration });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Transaction helper
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Database health check
export async function healthCheck(): Promise<{ 
  status: 'healthy' | 'unhealthy'; 
  timestamp: Date;
  poolInfo?: any;
  error?: string;
}> {
  try {
    const result = await query('SELECT NOW() as timestamp');
    const poolInstance = getPool();
    
    return {
      status: 'healthy',
      timestamp: result.rows[0].timestamp,
      poolInfo: {
        totalCount: poolInstance.totalCount,
        idleCount: poolInstance.idleCount,
        waitingCount: poolInstance.waitingCount,
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Close database connections (for testing)
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}