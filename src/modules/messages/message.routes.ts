
// src/modules/messages/message.routes.ts

import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authenticate.js'
import {
  getMessages,
  sendMessage,
  deleteMessage,
} from './message.controller.js'

export async function messageRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate)

  // ── GET /api/conversations/:conversationId/messages ─────────────────────────
  app.get('/:conversationId/messages', getMessages)

  // ── POST /api/conversations/:conversationId/messages ────────────────────────
  app.post('/:conversationId/messages', sendMessage)
}

export async function messageDeleteRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate)

  // ── DELETE /api/messages/:id ─────────────────────────────────────────────────
  app.delete('/:id', deleteMessage)
}