
// tests/unit/events.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventEmitter } from 'events'

// ── Mock dependencies ─────────────────────────────────────────────────────────
vi.mock('../../src/db/client.js', () => ({
  sql: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../src/modules/notifications/notification.repository.js', () => ({
  NotificationRepository: vi.fn().mockImplementation(() => ({
    create: vi.fn().mockResolvedValue({ id: 'notif-id', is_read: false }),
  })),
}))

import { emitter } from '../../src/events/eventEmitter.js'
import { MESSAGE_EVENTS } from '../../src/events/message.events.js'
import { CONVERSATION_EVENTS } from '../../src/events/conversation.events.js'

describe('EventEmitter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('emitter is an EventEmitter instance', () => {
    expect(emitter).toBeInstanceOf(EventEmitter)
  })

  it('emitter has maxListeners set to 20', () => {
    expect(emitter.getMaxListeners()).toBe(20)
  })

  it('emits and receives MESSAGE_EVENTS.SENT', () => {
    const listener = vi.fn()
    emitter.on(MESSAGE_EVENTS.SENT, listener)

    const payload = {
      messageId:      'msg-id',
      conversationId: 'conv-id',
      senderId:       'sender-id',
      receiverId:     'receiver-id',
      participantIds: ['sender-id', 'receiver-id'],
    }

    emitter.emit(MESSAGE_EVENTS.SENT, payload)
    expect(listener).toHaveBeenCalledWith(payload)

    emitter.off(MESSAGE_EVENTS.SENT, listener)
  })

  it('emits and receives MESSAGE_EVENTS.READ', () => {
    const listener = vi.fn()
    emitter.on(MESSAGE_EVENTS.READ, listener)

    const payload = {
      messageId:      'msg-id',
      userId:         'user-id',
      conversationId: 'conv-id',
    }

    emitter.emit(MESSAGE_EVENTS.READ, payload)
    expect(listener).toHaveBeenCalledWith(payload)

    emitter.off(MESSAGE_EVENTS.READ, listener)
  })

  it('MESSAGE_EVENTS constants are correct strings', () => {
    expect(MESSAGE_EVENTS.SENT).toBe('message:sent')
    expect(MESSAGE_EVENTS.DELIVERED).toBe('message:delivered')
    expect(MESSAGE_EVENTS.READ).toBe('message:read')
  })

  it('CONVERSATION_EVENTS constants are correct strings', () => {
    expect(CONVERSATION_EVENTS.CREATED).toBe('conversation:created')
    expect(CONVERSATION_EVENTS.DELETED).toBe('conversation:deleted')
  })

  it('multiple listeners can subscribe to same event', () => {
    const listener1 = vi.fn()
    const listener2 = vi.fn()

    emitter.on(MESSAGE_EVENTS.DELIVERED, listener1)
    emitter.on(MESSAGE_EVENTS.DELIVERED, listener2)

    emitter.emit(MESSAGE_EVENTS.DELIVERED, { messageId: 'msg-id' })

    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)

    emitter.off(MESSAGE_EVENTS.DELIVERED, listener1)
    emitter.off(MESSAGE_EVENTS.DELIVERED, listener2)
  })
})