
// src/modules/participants/participant.routes.ts

import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authenticate.js'
import {
  getParticipants,
  addParticipant,
  removeParticipant,
} from './participant.controller.js'

export async function participantRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate)

  // GET /api/conversations/:id/participants
  app.get('/:id/participants', getParticipants)

  // POST /api/conversations/:id/participants
  app.post('/:id/participants', addParticipant)

  // DELETE /api/conversations/:id/participants/:userId
  app.delete('/:id/participants/:userId', removeParticipant)
}