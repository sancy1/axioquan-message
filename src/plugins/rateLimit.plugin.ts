
// src/plugins/rateLimit.plugin.ts

import fp from 'fastify-plugin'
import fastifyRateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'
import { env } from '../config/env.js'

export default fp(async (app: FastifyInstance) => {
  await app.register(fastifyRateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    errorResponseBuilder: () => ({
      success: false,
      error: {
        message: 'Too many requests — please slow down',
        code: 'RATE_LIMITED',
      },
    }),
  })
})

