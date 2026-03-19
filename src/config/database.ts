
// src/config/database.ts

import { env } from './env.js'

export const databaseConfig = {
  connectionString: env.DATABASE_URL,
  ssl: true,
  connectionTimeoutMillis: 10_000,
  max: 10, // max pool connections
} as const

export type DatabaseConfig = typeof databaseConfig