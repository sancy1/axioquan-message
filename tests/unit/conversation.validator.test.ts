
// tests/unit/conversation.validator.test.ts

import { describe, it, expect } from 'vitest'
import {
  sendMessageSchema,
  getMessagesQuerySchema,
  conversationIdParamSchema,
  messageIdParamSchema,
} from '../../src/modules/messages/message.validator.js'

describe('sendMessageSchema', () => {
  it('accepts valid text message', () => {
    const result = sendMessageSchema.safeParse({
      content: 'Hello instructor!',
    })
    expect(result.success).toBe(true)
  })

  it('defaults message_type to text', () => {
    const result = sendMessageSchema.safeParse({
      content: 'Hello',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.message_type).toBe('text')
    }
  })

  it('rejects empty content', () => {
    const result = sendMessageSchema.safeParse({ content: '' })
    expect(result.success).toBe(false)
  })

  it('rejects missing content', () => {
    const result = sendMessageSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects content over 5000 characters', () => {
    const result = sendMessageSchema.safeParse({
      content: 'a'.repeat(5001),
    })
    expect(result.success).toBe(false)
  })

  it('accepts exactly 5000 characters', () => {
    const result = sendMessageSchema.safeParse({
      content: 'a'.repeat(5000),
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid message_type image', () => {
    const result = sendMessageSchema.safeParse({
      content: 'Check this',
      message_type: 'image',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid message_type', () => {
    const result = sendMessageSchema.safeParse({
      content: 'Hello',
      message_type: 'video',
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid reply_to_id UUID', () => {
    const result = sendMessageSchema.safeParse({
      content: 'Reply here',
      reply_to_id: '84e63a38-47ab-4865-a77d-4ee9d05ee1dd',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid reply_to_id', () => {
    const result = sendMessageSchema.safeParse({
      content: 'Reply',
      reply_to_id: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })
})

describe('getMessagesQuerySchema', () => {
  it('defaults page to 1 and limit to 50', () => {
    const result = getMessagesQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(50)
    }
  })

  it('coerces string numbers', () => {
    const result = getMessagesQuerySchema.safeParse({
      page: '2',
      limit: '25',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(2)
      expect(result.data.limit).toBe(25)
    }
  })

  it('rejects limit over 100', () => {
    const result = getMessagesQuerySchema.safeParse({ limit: 200 })
    expect(result.success).toBe(false)
  })
})

describe('conversationIdParamSchema', () => {
  it('accepts valid UUID', () => {
    const result = conversationIdParamSchema.safeParse({
      conversationId: 'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid UUID', () => {
    const result = conversationIdParamSchema.safeParse({
      conversationId: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })
})

describe('messageIdParamSchema', () => {
  it('accepts valid UUID', () => {
    const result = messageIdParamSchema.safeParse({
      id: '84e63a38-47ab-4865-a77d-4ee9d05ee1dd',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid UUID', () => {
    const result = messageIdParamSchema.safeParse({ id: 'bad-id' })
    expect(result.success).toBe(false)
  })
})