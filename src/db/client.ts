
// src/db/client.ts

import { neon, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import { databaseConfig } from '../config/database.js'
import { env } from '../config/env.js'

// Required for Node.js environments — neon uses WebSocket under the hood
neonConfig.webSocketConstructor = ws

// Create the neon SQL client
export const sql = neon(databaseConfig.connectionString)

// Test the connection
export async function testDatabaseConnection(): Promise<void> {
  try {
    const result = await sql`SELECT version()`
    console.log(
      '✅ NeonDB connected:',
      (result[0] as { version: string }).version
    )
  } catch (error) {
    console.error('❌ NeonDB connection failed:', error)
    if (env.NODE_ENV !== 'test') {
      process.exit(1)
    }
  }
}