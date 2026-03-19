
// src/middleware/requestLogger.ts

import type { FastifyInstance } from 'fastify'
import { logger } from '../utils/logger.js'

export function registerRequestLogger(app: FastifyInstance): void {
  // ── Log every incoming request ──────────────────────────────────────────────
  app.addHook('onRequest', async (request) => {
    request.log.info(
      {
        method: request.method,
        url: request.url,
        ip: request.ip,
      },
      'Incoming request'
    )
  })

  // ── Log every completed response ────────────────────────────────────────────
  app.addHook('onResponse', async (request, reply) => {
    logger.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: reply.elapsedTime.toFixed(2) + 'ms',
        userId: request.user?.userId ?? 'unauthenticated',
      },
      'Request completed'
    )
  })
}