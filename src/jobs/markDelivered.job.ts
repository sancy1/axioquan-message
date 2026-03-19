
// src/jobs/markDelivered.job.ts

import { sql } from '../db/client.js'
import { logger } from '../utils/logger.js'

const JOB_INTERVAL_MS = 30_000

async function markDeliveredJob(): Promise<void> {
  try {
    const result = await sql`
      UPDATE direct_messages
      SET
        is_delivered = true,
        delivered_at = now()
      WHERE is_delivered = false
      AND created_at < now() - INTERVAL '30 seconds'
      RETURNING id
    `

    if (result.length > 0) {
      logger.info(
        { count: result.length },
        `markDelivered job: marked ${result.length} message(s) as delivered`
      )
    }
  } catch (error) {
    logger.error({ err: error }, 'markDelivered job failed')
  }
}

export function startMarkDeliveredJob(): void {
  logger.info('markDelivered job started — runs every 30 seconds')
  setInterval(markDeliveredJob, JOB_INTERVAL_MS)
  markDeliveredJob()
}