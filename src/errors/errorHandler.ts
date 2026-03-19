
// src/errors/errorHandler.ts

import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from './AppError.js'
import { ValidationError } from './ValidationError.js'
import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'

export function errorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  // ── Already sent — do nothing ─────────────────────────────────────────────
  if (reply.sent) return

  // ── Validation error — Zod field errors ──────────────────────────────────
  if (error instanceof ValidationError) {
    reply.status(422).send({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        fields: error.fields,
      },
    })
    return
  }

  // ── Known operational AppError ────────────────────────────────────────────
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      success: false,
      error: {
        message: error.message,
        code: error.code,
      },
    })
    return
  }

  // ── Fastify built-in errors (400, 404 etc.) ───────────────────────────────
  if ('statusCode' in error && typeof error.statusCode === 'number') {
    reply.status(error.statusCode).send({
      success: false,
      error: {
        message: error.message,
        code: error.code ?? 'HTTP_ERROR',
      },
    })
    return
  }

  // ── Unknown errors ────────────────────────────────────────────────────────
  logger.error(
    { err: error, url: request.url, method: request.method },
    'Unhandled error'
  )

  reply.status(500).send({
    success: false,
    error: {
      message: env.NODE_ENV === 'development'
        ? error.message
        : 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      ...(env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  })
}