
// tests/unit/message.repository.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MessageRepository } from '../../src/modules/messages/message.repository.js'

vi.mock('../../src/db/client.js', () => ({
  sql: vi.fn(),
}))

import { sql } from '../../src/db/client.js'
const mockSql = vi.mocked(sql)

const mockMessageRow = {
  id:              '84e63a38-47ab-4865-a77d-4ee9d05ee1dd',
  conversation_id: 'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
  sender_id:       '5bed31bb-959c-4a24-8f76-30ba4c80fe87',
  receiver_id:     '18477825-b6b4-42ff-8367-b5e9c1343989',
  course_id:       null,
  message:         'Hello instructor!',
  message_type:    'text',
  attachment_url:  null,
  attachment_type: null,
  attachment_size: null,
  is_delivered:    false,
  is_read:         false,
  delivered_at:    null,
  read_at:         null,
  is_edited:       false,
  edited_at:       null,
  reply_to_id:     null,
  reactions:       null,
  is_reported:     false,
  reported_at:     null,
  created_at:      '2026-03-14 17:54:05.376361+00',
}

const mockMessageWithSenderRow = {
  ...mockMessageRow,
  sender_username:    'williams1',
  sender_name:        'John Williams',
  sender_image:       null,
  recipient_has_read: false,
  recipient_read_at:  null,
}

describe('MessageRepository', () => {
  let repo: MessageRepository

  beforeEach(() => {
    repo = new MessageRepository()
    vi.clearAllMocks()
  })

  describe('findById()', () => {
    it('returns message when found', async () => {
      mockSql.mockResolvedValueOnce([mockMessageRow])
      const result = await repo.findById('84e63a38-47ab-4865-a77d-4ee9d05ee1dd')
      expect(result).not.toBeNull()
      expect(result?.id).toBe('84e63a38-47ab-4865-a77d-4ee9d05ee1dd')
      expect(result?.message).toBe('Hello instructor!')
    })

    it('returns null when not found', async () => {
      mockSql.mockResolvedValueOnce([])
      const result = await repo.findById('non-existent')
      expect(result).toBeNull()
    })

    it('maps dates correctly', async () => {
      mockSql.mockResolvedValueOnce([mockMessageRow])
      const result = await repo.findById('84e63a38-47ab-4865-a77d-4ee9d05ee1dd')
      expect(result?.created_at).toBeInstanceOf(Date)
    })
  })

  describe('findByConversationId()', () => {
    it('returns messages with sender info', async () => {
      mockSql.mockResolvedValueOnce([mockMessageWithSenderRow])
      const result = await repo.findByConversationId(
        'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
        '18477825-b6b4-42ff-8367-b5e9c1343989',
        { page: 1, limit: 50 }
      )
      expect(result).toHaveLength(1)
      expect(result[0].sender_username).toBe('williams1')
      expect(result[0].recipient_has_read).toBe(false)
    })

    it('returns empty array when no messages', async () => {
      mockSql.mockResolvedValueOnce([])
      const result = await repo.findByConversationId(
        'conv-id',
        'user-id',
        { page: 1, limit: 50 }
      )
      expect(result).toHaveLength(0)
    })
  })

  describe('countByConversationId()', () => {
    it('returns count as number', async () => {
      mockSql.mockResolvedValueOnce([{ count: '5' }])
      const result = await repo.countByConversationId('conv-id')
      expect(result).toBe(5)
      expect(typeof result).toBe('number')
    })
  })

  describe('create()', () => {
    it('returns created message', async () => {
      mockSql.mockResolvedValueOnce([mockMessageRow])
      const result = await repo.create({
        conversation_id: 'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
        sender_id:       '5bed31bb-959c-4a24-8f76-30ba4c80fe87',
        receiver_id:     '18477825-b6b4-42ff-8367-b5e9c1343989',
        message:         'Hello instructor!',
      })
      expect(result.message).toBe('Hello instructor!')
      expect(result.is_delivered).toBe(false)
      expect(result.is_read).toBe(false)
    })

    it('maps null optional fields', async () => {
      mockSql.mockResolvedValueOnce([mockMessageRow])
      const result = await repo.create({
        conversation_id: 'conv-id',
        sender_id:       'sender-id',
        receiver_id:     'receiver-id',
        message:         'Hello',
      })
      expect(result.attachment_url).toBeNull()
      expect(result.reply_to_id).toBeNull()
      expect(result.course_id).toBeNull()
    })
  })

  describe('softDelete()', () => {
    it('resolves without throwing', async () => {
      mockSql.mockResolvedValueOnce([])
      await expect(
        repo.softDelete('84e63a38-47ab-4865-a77d-4ee9d05ee1dd')
      ).resolves.not.toThrow()
    })

    it('calls sql once', async () => {
      mockSql.mockResolvedValueOnce([])
      await repo.softDelete('message-id')
      expect(mockSql).toHaveBeenCalledTimes(1)
    })
  })

  describe('markDelivered()', () => {
    it('resolves without throwing', async () => {
      mockSql.mockResolvedValueOnce([])
      await expect(
        repo.markDelivered('message-id')
      ).resolves.not.toThrow()
    })
  })

  describe('markRead()', () => {
    it('calls sql twice — message and read receipt', async () => {
      mockSql.mockResolvedValueOnce([])
      mockSql.mockResolvedValueOnce([])
      await repo.markRead('message-id', 'user-id')
      expect(mockSql).toHaveBeenCalledTimes(2)
    })
  })
})