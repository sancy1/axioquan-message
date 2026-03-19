
// tests/integration/messages.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import jwtPlugin from '../../src/plugins/jwt.plugin.js'
import corsPlugin from '../../src/plugins/cors.plugin.js'
import { messageRoutes, messageDeleteRoutes } from '../../src/modules/messages/message.routes.js'
import { errorHandler } from '../../src/errors/errorHandler.js'

const STUDENT_ID    = '5bed31bb-959c-4a24-8f76-30ba4c80fe87'
const INSTRUCTOR_ID = '18477825-b6b4-42ff-8367-b5e9c1343989'
const CONVERSATION_ID = 'b3a90d51-8ac1-48ea-9d76-74130a62a8c0'

let app: FastifyInstance
let studentToken: string
let instructorToken: string
let createdMessageId: string

beforeAll(async () => {
  app = Fastify({ logger: false })

  await app.register(corsPlugin)
  await app.register(jwtPlugin)
  await app.register(messageRoutes, { prefix: '/api/conversations' })
  await app.register(messageDeleteRoutes, { prefix: '/api/messages' })
  app.setErrorHandler(errorHandler)

  await app.ready()

  studentToken = app.jwt.sign({
    userId: STUDENT_ID,
    email:  'williams1@test.com',
    role:   'student',
  })

  instructorToken = app.jwt.sign({
    userId: INSTRUCTOR_ID,
    email:  'sancy1@test.com',
    role:   'instructor',
  })
})

afterAll(async () => {
  await app.close()
})

describe('Messages API — Integration', () => {
  describe('GET /api/conversations/:conversationId/messages', () => {
    it('returns 401 without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url:    `/api/conversations/${CONVERSATION_ID}/messages`,
      })
      expect(response.statusCode).toBe(401)
    })

    it('returns 200 with valid participant token', async () => {
      const response = await app.inject({
        method:  'GET',
        url:     `/api/conversations/${CONVERSATION_ID}/messages`,
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
        method:  'GET',
        url:     `/api/conversations/${CONVERSATION_ID}/messages`,
        headers: { authorization: `Bearer ${studentToken}` },
      })
      const body = JSON.parse(response.body)
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
        userId: 'f3b44460-3472-42c2-af38-cfd10a6dd739',
        email:  'admin@test.com',
        role:   'admin',
      })
      const response = await app.inject({
        method:  'GET',
        url:     `/api/conversations/${CONVERSATION_ID}/messages`,
        headers: { authorization: `Bearer ${adminToken}` },
      })
      expect(response.statusCode).toBe(403)
    })
  })

  describe('POST /api/conversations/:conversationId/messages', () => {
    it('returns 422 with empty body', async () => {
      const response = await app.inject({
        method:  'POST',
        url:     `/api/conversations/${CONVERSATION_ID}/messages`,
        headers: {
          authorization:  `Bearer ${studentToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({}),
      })
      expect(response.statusCode).toBe(422)
      const body = JSON.parse(response.body)
      expect(body.error.code).toBe('VALIDATION_ERROR')
    })

    it('returns 201 with valid message', async () => {
      const response = await app.inject({
        method:  'POST',
        url:     `/api/conversations/${CONVERSATION_ID}/messages`,
        headers: {
          authorization:  `Bearer ${instructorToken}`,
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
      expect(body.data.id).toBeDefined()

      // Save for delete test
      createdMessageId = body.data.id
    })

    it('returns correct message shape', async () => {
      const response = await app.inject({
        method:  'POST',
        url:     `/api/conversations/${CONVERSATION_ID}/messages`,
        headers: {
          authorization:  `Bearer ${studentToken}`,
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
        method:  'DELETE',
        url:     `/api/messages/${createdMessageId}`,
        headers: { authorization: `Bearer ${instructorToken}` },
      })
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
    })

    it('returns 422 with invalid message UUID', async () => {
      const response = await app.inject({
        method:  'DELETE',
        url:     '/api/messages/not-a-uuid',
        headers: { authorization: `Bearer ${studentToken}` },
      })
      expect(response.statusCode).toBe(422)
    })
  })
})