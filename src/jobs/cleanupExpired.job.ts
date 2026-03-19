
// src/jobs/cleanupExpired.job.ts

import { sql } from '../db/client.js'
import { logger } from '../utils/logger.js'

const JOB_INTERVAL_MS = 24 * 60 * 60 * 1000

async function cleanupExpiredJob(): Promise<void> {
  try {
    const result = await sql`
      DELETE FROM direct_messages
      WHERE message = '[Message deleted]'
      AND edited_at < now() - INTERVAL '30 days'
      RETURNING id
    `

    if (result.length > 0) {
      logger.info(
        { count: result.length },
        'cleanupExpired job: permanently deleted messages'
      )
    } else {
      logger.info('cleanupExpired job: no expired messages to clean up')
    }
  } catch (error) {
    logger.error({ err: error }, 'cleanupExpired job failed')
  }
}

export function startCleanupExpiredJob(): void {
  logger.info('cleanupExpired job started — runs every 24 hours')
  setInterval(cleanupExpiredJob, JOB_INTERVAL_MS)
  cleanupExpiredJob()
}