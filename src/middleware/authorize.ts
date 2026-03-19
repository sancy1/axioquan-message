
// src/middleware/authorize.ts

import type { FastifyRequest, FastifyReply } from 'fastify'
import { HttpError } from '../errors/HttpError.js'

export function authorize(...allowedRoles: string[]) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    const user = request.user

    if (!user) {
      throw new HttpError(401, 'Unauthorised — no user on request', 'UNAUTHORISED')
    }

    if (!allowedRoles.includes(user.role)) {
      throw new HttpError(
        403,
        `Forbidden — required role: ${allowedRoles.join(' or ')}`,
        'FORBIDDEN'
      )
    }
  }
}