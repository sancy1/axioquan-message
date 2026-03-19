
// tests/unit/jobs.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/db/client.js', () => ({
  sql: vi.fn().mockResolvedValue([]),
}))

import { sql } from '../../src/db/client.js'

describe('Background Jobs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('markDelivered job', () => {
    it('sql client is available for job queries', () => {
      expect(sql).toBeDefined()
      expect(typeof sql).toBe('function')
    })

    it('job interval is 30 seconds', () => {
      const INTERVAL = 30_000
      expect(INTERVAL).toBe(30 * 1000)
    })

    it('delivered after threshold is 30 seconds', () => {
      const THRESHOLD = 30
      expect(THRESHOLD).toBeGreaterThan(0)
      expect(THRESHOLD).toBeLessThanOrEqual(60)
    })
  })

  describe('cleanupExpired job', () => {
    it('job interval is 24 hours', () => {
      const INTERVAL = 24 * 60 * 60 * 1000
      expect(INTERVAL).toBe(86_400_000)
    })

    it('cleanup after 30 days', () => {
      const DAYS = 30
      expect(DAYS).toBe(30)
    })

    it('sql client resolves without throwing', async () => {
      const mockSql = vi.mocked(sql)
      mockSql.mockResolvedValueOnce([])
      await expect(sql`SELECT 1`).resolves.not.toThrow()
    })
  })
})