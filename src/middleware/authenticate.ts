
// src/middleware/authenticate.ts

import type { FastifyRequest, FastifyReply } from 'fastify'

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify()
  } catch {
    // We send the response directly here to ensure the 
    // frontend always gets the same consistent JSON shape.
    return reply.status(401).send({
      success: false,
      error: {
        message: 'Unauthorised — valid JWT required',
        code: 'UNAUTHORISED',
      },
    })
  }
}