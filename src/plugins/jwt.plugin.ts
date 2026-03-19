
// src/plugins/jwt.plugin.ts

import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import type { FastifyInstance } from 'fastify'
import { env } from '../config/env.js'
import { HttpError } from '../errors/HttpError.js'

export default fp(async (app: FastifyInstance) => {
  // ── Register JWT plugin ─────────────────────────────────────────────────────
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  })

  // ── Decorate instance with verifyJwt helper ─────────────────────────────────
  // Used as a preHandler hook on protected routes
  app.decorate(
    'verifyJwt',
    async function (
      request: Parameters<typeof app.verifyJwt>[0],
      reply: Parameters<typeof app.verifyJwt>[1]
    ) {
      try {
        await request.jwtVerify()
      } catch {
        reply.send(new HttpError(401, 'Unauthorised', 'UNAUTHORISED'))
      }
    }
  )
})