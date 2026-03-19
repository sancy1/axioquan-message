
// tests/integration/conversations.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import jwtPlugin from '../../src/plugins/jwt.plugin.js'
import corsPlugin from '../../src/plugins/cors.plugin.js'
import { conversationRoutes } from '../../src/modules/conversations/conversation.routes.js'
import { errorHandler } from '../../src/errors/errorHandler.js'

// ── Test JWT tokens ───────────────────────────────────────────────────────────
const STUDENT_ID  = '5bed31bb-959c-4a24-8f76-30ba4c80fe87'
const INSTRUCTOR_ID = '18477825-b6b4-42ff-8367-b5e9c1343989'

let app: FastifyInstance
let studentToken: string
let instructorToken: string

beforeAll(async () => {
  app = Fastify({ logger: false })

  await app.register(corsPlugin)
  await app.register(jwtPlugin)
  await app.register(conversationRoutes, { prefix: '/api/conversations' })
  app.setErrorHandler(errorHandler)

  await app.ready()

  // Generate test tokens
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

describe('Conversations API — Integration', () => {
  describe('GET /api/conversations', () => {
    it('returns 401 without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url:    '/api/conversations',
      })
      expect(response.statusCode).toBe(401)
    })

    it('returns 200 with valid student token', async () => {
      const response = await app.inject({
        method:  'GET',
        url:     '/api/conversations',
        headers: { authorization: `Bearer ${studentToken}` },
      })
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data)).toBe(true)
      expect(body.meta).toBeDefined()
      expect(body.meta.total).toBeGreaterThanOrEqual(0)
    })

    it('returns correct response shape', async () => {
      const response = await app.inject({
        method:  'GET',
        url:     '/api/conversations',
        headers: { authorization: `Bearer ${studentToken}` },
      })
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('success')
      expect(body).toHaveProperty('data')
      expect(body).toHaveProperty('meta')
      expect(body).toHaveProperty('message')
    })
  })

  describe('POST /api/conversations', () => {
    it('returns 422 with empty body', async () => {
      const response = await app.inject({
        method:  'POST',
        url:     '/api/conversations',
        headers: {
          authorization:  `Bearer ${studentToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({}),
      })
      expect(response.statusCode).toBe(422)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('VALIDATION_ERROR')
      expect(body.error.fields).toBeDefined()
    })

    it('returns 422 with invalid UUID in participantIds', async () => {
      const response = await app.inject({
        method:  'POST',
        url:     '/api/conversations',
        headers: {
          authorization:  `Bearer ${studentToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          type:           'direct',
          participantIds: ['not-a-uuid'],
        }),
      })
      expect(response.statusCode).toBe(422)
    })

    it('returns 201 or 200 with valid payload', async () => {
      const response = await app.inject({
        method:  'POST',
        url:     '/api/conversations',
        headers: {
          authorization:  `Bearer ${studentToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          type:           'direct',
          participantIds: [INSTRUCTOR_ID],
        }),
      })
      expect([200, 201]).toContain(response.statusCode)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.id).toBeDefined()
    })
  })

  describe('GET /api/conversations/:id', () => {
    it('returns 401 without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url:    '/api/conversations/b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
      })
      expect(response.statusCode).toBe(401)
    })

    it('returns 422 with invalid UUID', async () => {
      const response = await app.inject({
        method:  'GET',
        url:     '/api/conversations/not-a-uuid',
        headers: { authorization: `Bearer ${studentToken}` },
      })
      expect(response.statusCode).toBe(422)
    })

    it('returns 200 for valid conversation participant', async () => {
      const response = await app.inject({
        method:  'GET',
        url:     '/api/conversations/b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
        headers: { authorization: `Bearer ${studentToken}` },
      })
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.id).toBe('b3a90d51-8ac1-48ea-9d76-74130a62a8c0')
    })
  })
})
