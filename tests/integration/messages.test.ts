// tests/integration/messages.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import jwtPlugin from '../../src/plugins/jwt.plugin.js'
import corsPlugin from '../../src/plugins/cors.plugin.js'
import { messageRoutes, messageDeleteRoutes } from '../../src/modules/messages/message.routes.js'
import { errorHandler } from '../../src/errors/errorHandler.js'
import { sql } from '../../src/db/client.js'

// ── REAL USERS FROM YOUR DATABASE (NO SEEDING) ───────────────────────────────
const STUDENT_ID = 'd07e32da-891b-403e-8421-80656a98c03f'
const INSTRUCTOR_ID = '18477825-b6b4-42ff-8367-b5e9c1343989'
const ADMIN_ID = 'f3b44460-3472-42c2-af38-cfd10a6dd739'

let app: FastifyInstance
let studentToken: string
let instructorToken: string
let testConversationId: string
let createdMessageId: string

beforeAll(async () => {
  // ── Boot Fastify ────────────────────────────────────────────────────────────
  app = Fastify({ logger: false })
  await app.register(corsPlugin)
  await app.register(jwtPlugin)
  await app.register(messageRoutes, { prefix: '/api/conversations' })
  await app.register(messageDeleteRoutes, { prefix: '/api/messages' })
  app.setErrorHandler(errorHandler)
  await app.ready()

  // ── JWT TOKENS USING REAL USERS ────────────────────────────────────────────
  studentToken = app.jwt.sign({
    userId: STUDENT_ID,
    email: 'student@test.com',
    role: 'student',
  })

  instructorToken = app.jwt.sign({
    userId: INSTRUCTOR_ID,
    email: 'instructor@test.com',
    role: 'instructor',
  })

  // ── CREATE TEST CONVERSATION USING REAL USER ───────────────────────────────
  const convRows = await sql`
    INSERT INTO conversations (type, title, created_by)
    VALUES ('direct', 'Messages integration test conv', ${STUDENT_ID})
    RETURNING id
  `

  testConversationId = convRows[0].id as string

  // ── ADD PARTICIPANTS (USING EXISTING USERS ONLY) ───────────────────────────
  await sql`
    INSERT INTO conversation_participants (conversation_id, user_id, role)
    VALUES
      (${testConversationId}, ${STUDENT_ID}, 'student'),
      (${testConversationId}, ${INSTRUCTOR_ID}, 'instructor')
    ON CONFLICT DO NOTHING
  `
})

afterAll(async () => {
  // ── CLEAN UP IN FK ORDER ───────────────────────────────────────────────────
  if (testConversationId) {
    await sql`DELETE FROM message_read_receipts WHERE conversation_id = ${testConversationId}`
    await sql`DELETE FROM message_notifications WHERE conversation_id = ${testConversationId}`
    await sql`DELETE FROM direct_messages WHERE conversation_id = ${testConversationId}`
    await sql`DELETE FROM conversation_participants WHERE conversation_id = ${testConversationId}`
    await sql`DELETE FROM conversations WHERE id = ${testConversationId}`
  }

  await app.close()
})

describe('Messages API — Integration', () => {

  describe('GET /api/conversations/:conversationId/messages', () => {

    it('returns 401 without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/conversations/${testConversationId}/messages`,
      })
      expect(response.statusCode).toBe(401)
    })

    it('returns 200 with valid participant token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/conversations/${testConversationId}/messages`,
        headers: { authorization: `Bearer ${studentToken}` },
      })

      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data)).toBe(true)
      expect(body.meta).toBeDefined()
    })

    it('returns messages with sender details', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/conversations/${testConversationId}/messages`,
        headers: { authorization: `Bearer ${studentToken}` },
      })

      const body = JSON.parse(response.body)
      expect(Array.isArray(body.data)).toBe(true)

      if (body.data.length > 0) {
        const message = body.data[0]
        expect(message).toHaveProperty('sender')
        expect(message.sender).toHaveProperty('username')
        expect(message.sender).toHaveProperty('name')
        expect(message).toHaveProperty('content')
        expect(message).toHaveProperty('createdAt')
      }
    })

    it('returns 403 for non-participant', async () => {
      const adminToken = app.jwt.sign({
        userId: ADMIN_ID,
        email: 'admin@test.com',
        role: 'admin',
      })

      const response = await app.inject({
        method: 'GET',
        url: `/api/conversations/${testConversationId}/messages`,
        headers: { authorization: `Bearer ${adminToken}` },
      })

      expect(response.statusCode).toBe(403)
    })
  })

  describe('POST /api/conversations/:conversationId/messages', () => {

    it('returns 422 with empty body', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/conversations/${testConversationId}/messages`,
        headers: {
          authorization: `Bearer ${studentToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      expect(response.statusCode).toBe(422)
    })

    it('returns 201 with valid message', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/conversations/${testConversationId}/messages`,
        headers: {
          authorization: `Bearer ${instructorToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          content: 'Integration test message',
        }),
      })

      expect(response.statusCode).toBe(201)

      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.content).toBe('Integration test message')

      createdMessageId = body.data.id
    })

    it('returns correct message shape', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/conversations/${testConversationId}/messages`,
        headers: {
          authorization: `Bearer ${studentToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ content: 'Shape test message' }),
      })

      const body = JSON.parse(response.body)
      const msg = body.data

      expect(msg).toHaveProperty('id')
      expect(msg).toHaveProperty('conversationId')
      expect(msg).toHaveProperty('senderId')
      expect(msg).toHaveProperty('content')
      expect(msg).toHaveProperty('messageType')
      expect(msg).toHaveProperty('isDelivered')
      expect(msg).toHaveProperty('isRead')
      expect(msg).toHaveProperty('createdAt')
    })
  })

  describe('DELETE /api/messages/:id', () => {

    it('returns 200 when sender deletes own message', async () => {
      if (!createdMessageId) return

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/messages/${createdMessageId}`,
        headers: { authorization: `Bearer ${instructorToken}` },
      })

      expect(response.statusCode).toBe(200)
    })

    it('returns 422 with invalid UUID', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/messages/not-a-uuid',
        headers: { authorization: `Bearer ${studentToken}` },
      })

      expect(response.statusCode).toBe(422)
    })

    it('returns 404 for non-existent message', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/messages/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${studentToken}` },
      })

      expect(response.statusCode).toBe(404)
    })
  })
})
