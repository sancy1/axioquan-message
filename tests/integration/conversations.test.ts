
// // tests/integration/conversations.test.ts

// import { describe, it, expect, beforeAll, afterAll } from 'vitest'
// import Fastify from 'fastify'
// import type { FastifyInstance } from 'fastify'
// import jwtPlugin from '../../src/plugins/jwt.plugin.js'
// import corsPlugin from '../../src/plugins/cors.plugin.js'
// import { conversationRoutes } from '../../src/modules/conversations/conversation.routes.js'
// import { errorHandler } from '../../src/errors/errorHandler.js'

// // ── Test JWT tokens ───────────────────────────────────────────────────────────
// const STUDENT_ID  = '5bed31bb-959c-4a24-8f76-30ba4c80fe87'
// const INSTRUCTOR_ID = '18477825-b6b4-42ff-8367-b5e9c1343989'

// let app: FastifyInstance
// let studentToken: string
// let instructorToken: string

// beforeAll(async () => {
//   app = Fastify({ logger: false })

//   await app.register(corsPlugin)
//   await app.register(jwtPlugin)
//   await app.register(conversationRoutes, { prefix: '/api/conversations' })
//   app.setErrorHandler(errorHandler)

//   await app.ready()

//   // Generate test tokens
//   studentToken = app.jwt.sign({
//     userId: STUDENT_ID,
//     email:  'williams1@test.com',
//     role:   'student',
//   })

//   instructorToken = app.jwt.sign({
//     userId: INSTRUCTOR_ID,
//     email:  'sancy1@test.com',
//     role:   'instructor',
//   })
// })

// afterAll(async () => {
//   await app.close()
// })

// describe('Conversations API — Integration', () => {
//   describe('GET /api/conversations', () => {
//     it('returns 401 without token', async () => {
//       const response = await app.inject({
//         method: 'GET',
//         url:    '/api/conversations',
//       })
//       expect(response.statusCode).toBe(401)
//     })

//     it('returns 200 with valid student token', async () => {
//       const response = await app.inject({
//         method:  'GET',
//         url:     '/api/conversations',
//         headers: { authorization: `Bearer ${studentToken}` },
//       })
//       expect(response.statusCode).toBe(200)
//       const body = JSON.parse(response.body)
//       expect(body.success).toBe(true)
//       expect(Array.isArray(body.data)).toBe(true)
//       expect(body.meta).toBeDefined()
//       expect(body.meta.total).toBeGreaterThanOrEqual(0)
//     })

//     it('returns correct response shape', async () => {
//       const response = await app.inject({
//         method:  'GET',
//         url:     '/api/conversations',
//         headers: { authorization: `Bearer ${studentToken}` },
//       })
//       const body = JSON.parse(response.body)
//       expect(body).toHaveProperty('success')
//       expect(body).toHaveProperty('data')
//       expect(body).toHaveProperty('meta')
//       expect(body).toHaveProperty('message')
//     })
//   })

//   describe('POST /api/conversations', () => {
//     it('returns 422 with empty body', async () => {
//       const response = await app.inject({
//         method:  'POST',
//         url:     '/api/conversations',
//         headers: {
//           authorization:  `Bearer ${studentToken}`,
//           'content-type': 'application/json',
//         },
//         body: JSON.stringify({}),
//       })
//       expect(response.statusCode).toBe(422)
//       const body = JSON.parse(response.body)
//       expect(body.success).toBe(false)
//       expect(body.error.code).toBe('VALIDATION_ERROR')
//       expect(body.error.fields).toBeDefined()
//     })

//     it('returns 422 with invalid UUID in participantIds', async () => {
//       const response = await app.inject({
//         method:  'POST',
//         url:     '/api/conversations',
//         headers: {
//           authorization:  `Bearer ${studentToken}`,
//           'content-type': 'application/json',
//         },
//         body: JSON.stringify({
//           type:           'direct',
//           participantIds: ['not-a-uuid'],
//         }),
//       })
//       expect(response.statusCode).toBe(422)
//     })

//     it('returns 201 or 200 with valid payload', async () => {
//       const response = await app.inject({
//         method:  'POST',
//         url:     '/api/conversations',
//         headers: {
//           authorization:  `Bearer ${studentToken}`,
//           'content-type': 'application/json',
//         },
//         body: JSON.stringify({
//           type:           'direct',
//           participantIds: [INSTRUCTOR_ID],
//         }),
//       })
//       expect([200, 201]).toContain(response.statusCode)
//       const body = JSON.parse(response.body)
//       expect(body.success).toBe(true)
//       expect(body.data.id).toBeDefined()
//     })
//   })

//   describe('GET /api/conversations/:id', () => {
//     it('returns 401 without token', async () => {
//       const response = await app.inject({
//         method: 'GET',
//         url:    '/api/conversations/b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
//       })
//       expect(response.statusCode).toBe(401)
//     })

//     it('returns 422 with invalid UUID', async () => {
//       const response = await app.inject({
//         method:  'GET',
//         url:     '/api/conversations/not-a-uuid',
//         headers: { authorization: `Bearer ${studentToken}` },
//       })
//       expect(response.statusCode).toBe(422)
//     })

//     it('returns 200 for valid conversation participant', async () => {
//       const response = await app.inject({
//         method:  'GET',
//         url:     '/api/conversations/b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
//         headers: { authorization: `Bearer ${studentToken}` },
//       })
//       expect(response.statusCode).toBe(200)
//       const body = JSON.parse(response.body)
//       expect(body.success).toBe(true)
//       expect(body.data.id).toBe('b3a90d51-8ac1-48ea-9d76-74130a62a8c0')
//     })
//   })
// })























// tests/integration/conversations.test.ts
// FIXED: Tests create their own conversation in beforeAll
// No longer depends on hardcoded conversation ID from Postman test data
// Cleans up created conversation in afterAll
// DEBUG: added raw error logger to expose 500 cause

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import jwtPlugin from '../../src/plugins/jwt.plugin.js'
import corsPlugin from '../../src/plugins/cors.plugin.js'
import { conversationRoutes } from '../../src/modules/conversations/conversation.routes.js'
import { errorHandler } from '../../src/errors/errorHandler.js'
import { sql } from '../../src/db/client.js'

// ── Real user IDs that exist in NeonDB ────────────────────────────────────────
const STUDENT_ID    = '5bed31bb-959c-4a24-8f76-30ba4c80fe87'
const INSTRUCTOR_ID = '18477825-b6b4-42ff-8367-b5e9c1343989'
const ADMIN_ID      = 'f3b44460-3472-42c2-af38-cfd10a6dd739'

let app:               FastifyInstance
let studentToken:      string
let instructorToken:   string
let testConversationId: string

beforeAll(async () => {
  // ── Boot Fastify ──────────────────────────────────────────────────────────
  app = Fastify({ logger: false })
  await app.register(corsPlugin)
  await app.register(jwtPlugin)
  await app.register(conversationRoutes, { prefix: '/api/conversations' })
  app.setErrorHandler(errorHandler)
  await app.ready()

  // ── Generate tokens ───────────────────────────────────────────────────────
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

  // ── Create a test conversation directly in DB ─────────────────────────────
  const convRows = await sql`
    INSERT INTO conversations (type, title, created_by)
    VALUES ('direct', 'Integration test conversation', ${STUDENT_ID})
    RETURNING id
  `
  testConversationId = convRows[0].id as string

  // Add both users as participants
  await sql`
    INSERT INTO conversation_participants (conversation_id, user_id, role)
    VALUES
      (${testConversationId}, ${STUDENT_ID},    'student'),
      (${testConversationId}, ${INSTRUCTOR_ID}, 'instructor')
    ON CONFLICT DO NOTHING
  `
})

afterAll(async () => {
  // ── Clean up in correct FK order ──────────────────────────────────────────
  if (testConversationId) {
    await sql`DELETE FROM message_read_receipts    WHERE conversation_id = ${testConversationId}`
    await sql`DELETE FROM message_notifications    WHERE conversation_id = ${testConversationId}`
    await sql`DELETE FROM direct_messages          WHERE conversation_id = ${testConversationId}`
    await sql`DELETE FROM conversation_participants WHERE conversation_id = ${testConversationId}`
    await sql`DELETE FROM conversations            WHERE id = ${testConversationId}`
  }
  await app.close()
})

// ── DEBUG: expose real 500 error body ─────────────────────────────────────────
// Remove this test once the 500 is fixed
it('DEBUG — raw GET /api/conversations error body', async () => {
  const response = await app.inject({
    method:  'GET',
    url:     '/api/conversations',
    headers: { authorization: `Bearer ${studentToken}` },
  })
  console.log('DEBUG status:', response.statusCode)
  console.log('DEBUG body:',   response.body)
  // Always passes — we just want to see the output
  expect(response.statusCode).toBeDefined()
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
        url:    `/api/conversations/${testConversationId}`,
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
        url:     `/api/conversations/${testConversationId}`,
        headers: { authorization: `Bearer ${studentToken}` },
      })
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.id).toBe(testConversationId)
    })

    it('returns 404 for non-participant', async () => {
      const adminToken = app.jwt.sign({
        userId: ADMIN_ID,
        email:  'admin@test.com',
        role:   'admin',
      })
      const response = await app.inject({
        method:  'GET',
        url:     `/api/conversations/${testConversationId}`,
        headers: { authorization: `Bearer ${adminToken}` },
      })
      // Service returns 404 for non-participants intentionally
      // This prevents leaking whether a conversation exists
      expect(response.statusCode).toBe(404)
    })
  })

  describe('PATCH /api/conversations/:id', () => {
    it('returns 401 without token', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url:    `/api/conversations/${testConversationId}`,
      })
      expect(response.statusCode).toBe(401)
    })

    it('returns 200 when updating title', async () => {
      const response = await app.inject({
        method:  'PATCH',
        url:     `/api/conversations/${testConversationId}`,
        headers: {
          authorization:  `Bearer ${studentToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'Updated title from test' }),
      })
      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.title).toBe('Updated title from test')
    })
  })

  describe('DELETE /api/conversations/:id', () => {
    it('returns 401 without token', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url:    `/api/conversations/${testConversationId}`,
      })
      expect(response.statusCode).toBe(401)
    })
  })
})