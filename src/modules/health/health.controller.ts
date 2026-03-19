
// src/modules/health/health.controller.ts

import type { FastifyRequest, FastifyReply } from 'fastify'
import { testDatabaseConnection } from '../../db/client.js'
import { getConnectionCount } from '../../websocket/websocket.manager.js'
import { env } from '../../config/env.js'

// ── GET /health ───────────────────────────────────────────────────────────────
export async function healthCheck(
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  reply.status(200).send({
    status: 'ok',
    app: env.APP_NAME,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's',
    websocketConnections: getConnectionCount(),
  })
}

// ── GET /health/db ────────────────────────────────────────────────────────────
export async function healthDbCheck(
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const start = Date.now()

  try {
    await testDatabaseConnection()
    const responseTime = Date.now() - start

    reply.status(200).send({
      status: 'ok',
      database: 'connected',
      responseTime: responseTime + 'ms',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    reply.status(503).send({
      status: 'error',
      database: 'disconnected',
      error: 'Database connection failed',
      timestamp: new Date().toISOString(),
    })
  }
}