
// src/types/fastify.d.ts

import '@fastify/jwt'
import type { FastifyRequest, FastifyReply } from 'fastify'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      userId: string
      email: string
      role: string
    }
    user: {
      userId: string
      email: string
      role: string
    }
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    verifyJwt: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>
  }
}