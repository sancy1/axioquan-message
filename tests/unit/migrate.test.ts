
// tests/unit/migrate.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock the sql client — no .unsafe needed ───────────────────────────────────
vi.mock('../../src/db/client.js', () => ({
  sql: vi.fn().mockResolvedValue([]),
}))

// ── Mock fs/promises ──────────────────────────────────────────────────────────
vi.mock('fs/promises', () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}))

import { readdir, readFile } from 'fs/promises'
import { runMigrations } from '../../src/db/migrate.js'
import { sql } from '../../src/db/client.js'

describe('Migration Runner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('skips migrations already in schema_migrations', async () => {
    const mockSql = vi.mocked(sql)
    mockSql
      .mockResolvedValueOnce([]) // ensureMigrationsTable
      .mockResolvedValueOnce([   // getAppliedMigrations
        { filename: '001_create_conversations.sql' },
        { filename: '002_create_conversation_participants.sql' },
        { filename: '003_add_conversation_id_to_direct_messages.sql' },
        { filename: '004_create_message_read_receipts.sql' },
        { filename: '005_create_message_notifications.sql' },
      ])

    vi.mocked(readdir).mockResolvedValue([
      '001_create_conversations.sql',
      '002_create_conversation_participants.sql',
      '003_add_conversation_id_to_direct_messages.sql',
      '004_create_message_read_receipts.sql',
      '005_create_message_notifications.sql',
    ] as unknown as Awaited<ReturnType<typeof readdir>>)

    await runMigrations()

    // readFile should never be called — all migrations already applied
    expect(readFile).not.toHaveBeenCalled()
  })

  it('sorts migration files by filename', async () => {
    vi.mocked(readdir).mockResolvedValue([
      '003_add_conversation_id_to_direct_messages.sql',
      '001_create_conversations.sql',
      '002_create_conversation_participants.sql',
    ] as unknown as Awaited<ReturnType<typeof readdir>>)

    vi.mocked(sql).mockResolvedValue([
      { filename: '001_create_conversations.sql' },
      { filename: '002_create_conversation_participants.sql' },
      { filename: '003_add_conversation_id_to_direct_messages.sql' },
    ])

    await runMigrations()

    expect(readFile).not.toHaveBeenCalled()
  })

  it('only processes .sql files', async () => {
    vi.mocked(readdir).mockResolvedValue([
      '001_create_conversations.sql',
      'README.md',
      '.gitkeep',
      '002_create_conversation_participants.sql',
    ] as unknown as Awaited<ReturnType<typeof readdir>>)

    vi.mocked(sql).mockResolvedValue([
      { filename: '001_create_conversations.sql' },
      { filename: '002_create_conversation_participants.sql' },
    ])

    await runMigrations()

    expect(readFile).not.toHaveBeenCalledWith(
      expect.stringContaining('README.md'),
      expect.any(String)
    )
  })

  it('runs new migration when not in applied list', async () => {
    vi.mocked(sql)
      .mockResolvedValueOnce([]) // ensureMigrationsTable
      .mockResolvedValueOnce([   // getAppliedMigrations
        { filename: '001_create_conversations.sql' },
      ])
      .mockResolvedValueOnce([]) // recordMigration
      .mockResolvedValueOnce([]) // runMigration — sql(sqlContent, [])

    vi.mocked(readdir).mockResolvedValue([
      '001_create_conversations.sql',
      '006_new_migration.sql',
    ] as unknown as Awaited<ReturnType<typeof readdir>>)

    vi.mocked(readFile).mockResolvedValue(
      'ALTER TABLE conversations ADD COLUMN test_col TEXT' as unknown as Awaited<ReturnType<typeof readFile>>
    )

    await runMigrations()

    expect(readFile).toHaveBeenCalledTimes(1)
    expect(readFile).toHaveBeenCalledWith(
      expect.stringContaining('006_new_migration.sql'),
      'utf-8'
    )
  })
})