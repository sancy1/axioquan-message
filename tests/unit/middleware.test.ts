
// tests/unit/middleware.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authenticate } from '../../src/middleware/authenticate.js'
import { authorize } from '../../src/middleware/authorize.js'
import { HttpError } from '../../src/errors/HttpError.js'

// ── Mock request and reply helpers ────────────────────────────────────────────
function mockRequest(overrides = {}) {
  return {
    jwtVerify: vi.fn().mockResolvedValue(undefined),
    user: { userId: 'uuid-123', email: 'test@test.com', role: 'student' },
    ...overrides,
  }
}

function mockReply() {
  return {
    send: vi.fn(),
    status: vi.fn().mockReturnThis(),
  }
}

describe('authenticate middleware', () => {
  it('passes when jwtVerify succeeds', async () => {
    const request = mockRequest()
    const reply = mockReply()

    await expect(
      authenticate(request as never, reply as never)
    ).resolves.not.toThrow()
  })

  
  it('sends 401 when jwtVerify fails', async () => {
    const request = mockRequest({
      jwtVerify: vi.fn().mockRejectedValue(new Error('invalid token')),
    })
    const reply = mockReply()

    await authenticate(request as never, reply as never)

    expect(reply.status).toHaveBeenCalledWith(401)
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'UNAUTHORISED',
        }),
      })
    )
  })

  it('sends correct error shape when token invalid', async () => {
    const request = mockRequest({
      jwtVerify: vi.fn().mockRejectedValue(new Error('invalid token')),
    })
    const reply = mockReply()

    await authenticate(request as never, reply as never)

    const sentPayload = vi.mocked(reply.send).mock.calls[0][0] as {
      success: boolean
      error: { message: string; code: string }
    }
    expect(sentPayload.success).toBe(false)
    expect(sentPayload.error.code).toBe('UNAUTHORISED')
    expect(sentPayload.error.message).toContain('Unauthorised')
  })
})

describe('authorize middleware', () => {
  it('passes when user has correct role', async () => {
    const request = mockRequest({
      user: { userId: 'uuid', email: 'test@test.com', role: 'instructor' },
    })
    const reply = mockReply()
    const handler = authorize('instructor')

    await expect(
      handler(request as never, reply as never)
    ).resolves.not.toThrow()
  })

  it('throws 403 when user has wrong role', async () => {
    const request = mockRequest({
      user: { userId: 'uuid', email: 'test@test.com', role: 'student' },
    })
    const reply = mockReply()
    const handler = authorize('instructor')

    await expect(
      handler(request as never, reply as never)
    ).rejects.toThrow(HttpError)
  })

  it('throws 403 with FORBIDDEN code', async () => {
    const request = mockRequest({
      user: { userId: 'uuid', email: 'test@test.com', role: 'student' },
    })
    const reply = mockReply()
    const handler = authorize('instructor')

    try {
      await handler(request as never, reply as never)
    } catch (error) {
      expect((error as HttpError).statusCode).toBe(403)
      expect((error as HttpError).code).toBe('FORBIDDEN')
    }
  })

  it('passes when user has one of multiple allowed roles', async () => {
    const request = mockRequest({
      user: { userId: 'uuid', email: 'test@test.com', role: 'admin' },
    })
    const reply = mockReply()
    const handler = authorize('instructor', 'admin')

    await expect(
      handler(request as never, reply as never)
    ).resolves.not.toThrow()
  })

  it('blocks student from instructor+admin only route', async () => {
    const request = mockRequest({
      user: { userId: 'uuid', email: 'test@test.com', role: 'student' },
    })
    const reply = mockReply()
    const handler = authorize('instructor', 'admin')

    await expect(
      handler(request as never, reply as never)
    ).rejects.toThrow(HttpError)
  })

  it('throws 401 when no user on request', async () => {
    const request = mockRequest({ user: undefined })
    const reply = mockReply()
    const handler = authorize('instructor')

    try {
      await handler(request as never, reply as never)
    } catch (error) {
      expect((error as HttpError).statusCode).toBe(401)
    }
  })
})