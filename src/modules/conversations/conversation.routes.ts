
// src/modules/conversations/conversation.routes.ts

import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authenticate.js'
import {
  getConversations,
  getConversationById,
  createConversation,
  updateConversation,
  deleteConversation,
} from './conversation.controller.js'

export async function conversationRoutes(app: FastifyInstance): Promise<void> {
  // All conversation routes require authentication
  app.addHook('preHandler', authenticate)

  // ── GET /api/conversations ──────────────────────────────────────────────────
  app.get('/', getConversations)

  // ── GET /api/conversations/:id ──────────────────────────────────────────────
  app.get('/:id', getConversationById)

  // ── POST /api/conversations ─────────────────────────────────────────────────
  app.post('/', createConversation)

  // ── PATCH /api/conversations/:id ────────────────────────────────────────────
  app.patch('/:id', updateConversation)

  // ── DELETE /api/conversations/:id ───────────────────────────────────────────
  app.delete('/:id', deleteConversation)
}