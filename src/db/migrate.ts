
// src/db/migrate.ts

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { sql } from './client.js'
import { logger } from '../utils/logger.js'

// ── Migrations directory path ─────────────────────────────────────────────────
// Use process.cwd() which works in both ESM and CJS environments
const MIGRATIONS_DIR = join(process.cwd(), 'src', 'db', 'migrations')

// ── Ensure schema_migrations tracking table exists ────────────────────────────
async function ensureMigrationsTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id          SERIAL PRIMARY KEY,
      filename    VARCHAR(255) NOT NULL UNIQUE,
      applied_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `
  logger.info('schema_migrations table ready')
}

// ── Get list of already applied migrations ────────────────────────────────────
async function getAppliedMigrations(): Promise<string[]> {
  const rows = await sql`
    SELECT filename FROM schema_migrations ORDER BY id ASC
  `
  return rows.map((row) => row.filename as string)
}

// ── Record a migration as applied ─────────────────────────────────────────────
async function recordMigration(filename: string): Promise<void> {
  await sql`
    INSERT INTO schema_migrations (filename)
    VALUES (${filename})
    ON CONFLICT (filename) DO NOTHING
  `
}

// ── Read all SQL files from migrations folder sorted by name ──────────────────
async function getMigrationFiles(): Promise<string[]> {
  const files = await readdir(MIGRATIONS_DIR)
  return files
    .filter((file) => file.endsWith('.sql'))
    .sort()
}

// ── Run a single migration file ───────────────────────────────────────────────
async function runMigration(filename: string): Promise<void> {
  const filepath = join(MIGRATIONS_DIR, filename)
  const sqlContent = await readFile(filepath, 'utf-8')
  await sql(sqlContent, [])
}

// ── Main migration runner ─────────────────────────────────────────────────────
export async function runMigrations(): Promise<void> {
  logger.info('Starting database migrations...')

  try {
    await ensureMigrationsTable()

    const applied = await getAppliedMigrations()
    logger.info(`Found ${applied.length} previously applied migrations`)

    const files = await getMigrationFiles()
    logger.info(`Found ${files.length} migration files`)

    let newCount = 0

    for (const filename of files) {
      if (applied.includes(filename)) {
        logger.info(`Skipping ${filename} — already applied`)
        continue
      }

      logger.info(`Applying ${filename}...`)

      try {
        await runMigration(filename)
        await recordMigration(filename)
        logger.info(`✅ ${filename} applied successfully`)
        newCount++
      } catch (error) {
        logger.error({ err: error }, `❌ Failed to apply ${filename}`)
        throw error
      }
    }

    if (newCount === 0) {
      logger.info('✅ All migrations already applied — database is up to date')
    } else {
      logger.info(`✅ ${newCount} migration(s) applied successfully`)
    }
  } catch (error) {
    logger.error({ err: error }, 'Migration runner failed')
    process.exit(1)
  }
}

// ── Always run when this file is executed directly ────────────────────────────
// ── Only run when executed directly as a script ───────────────────────────────
// Checks if this file is the entry point — not when imported by tests
const isScript = process.argv[1]?.includes('migrate')

if (isScript) {
  runMigrations().then(() => {
    logger.info('Migration runner complete')
    process.exit(0)
  }).catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
}