
// tests/unit/notification.service.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotificationService } from '../../src/modules/notifications/notification.service.js'
import { NotFoundError } from '../../src/errors/NotFoundError.js'
import { HttpError } from '../../src/errors/HttpError.js'

// ── Mock data ─────────────────────────────────────────────────────────────────
const mockNotificationWithDetails = {
  id:                 'e8403cef-e1c1-4e51-9484-d844eca54cdb',
  user_id:            '18477825-b6b4-42ff-8367-b5e9c1343989',
  conversation_id:    'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
  message_id:         '84e63a38-47ab-4865-a77d-4ee9d05ee1dd',
  sender_id:          '5bed31bb-959c-4a24-8f76-30ba4c80fe87',
  is_read:            false,
  read_at:            null,
  created_at:         new Date(),
  sender_username:    'williams1',
  sender_name:        'John Williams',
  message_preview:    'Hello instructor!',
  conversation_title: 'Question about course material',
}

// ── Mock repo factory ─────────────────────────────────────────────────────────
function mockNotificationRepo(overrides = {}) {
  return {
    findByUserId:      vi.fn().mockResolvedValue([mockNotificationWithDetails]),
    countUnread:       vi.fn().mockResolvedValue(1),
    create:            vi.fn().mockResolvedValue(mockNotificationWithDetails),
    markAsRead:        vi.fn().mockResolvedValue(undefined),
    markAllAsRead:     vi.fn().mockResolvedValue(undefined),
    deleteByMessageId: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

describe('NotificationService', () => {
  let service: NotificationService

  beforeEach(() => {
    service = new NotificationService(mockNotificationRepo())
    vi.clearAllMocks()
  })

  describe('getNotifications()', () => {
    it('returns unread notifications for user', async () => {
      const result = await service.getNotifications(
        '18477825-b6b4-42ff-8367-b5e9c1343989'
      )
      expect(result).toHaveLength(1)
      expect(result[0].sender_username).toBe('williams1')
      expect(result[0].is_read).toBe(false)
    })

    it('returns empty array when no notifications', async () => {
      const repo = mockNotificationRepo({
        findByUserId: vi.fn().mockResolvedValue([]),
      })
      service = new NotificationService(repo)
      const result = await service.getNotifications('user-id')
      expect(result).toHaveLength(0)
    })
  })

  describe('countUnread()', () => {
    it('returns unread count as number', async () => {
      const result = await service.countUnread(
        '18477825-b6b4-42ff-8367-b5e9c1343989'
      )
      expect(result).toBe(1)
      expect(typeof result).toBe('number')
    })

    it('returns 0 when no unread notifications', async () => {
      const repo = mockNotificationRepo({
        countUnread: vi.fn().mockResolvedValue(0),
      })
      service = new NotificationService(repo)
      const result = await service.countUnread('user-id')
      expect(result).toBe(0)
    })
  })

  describe('markAsRead()', () => {
    it('marks notification as read when owner requests', async () => {
      const repo = mockNotificationRepo()
      service = new NotificationService(repo)

      await service.markAsRead(
        'e8403cef-e1c1-4e51-9484-d844eca54cdb',
        '18477825-b6b4-42ff-8367-b5e9c1343989'
      )
      expect(repo.markAsRead).toHaveBeenCalledWith(
        'e8403cef-e1c1-4e51-9484-d844eca54cdb'
      )
    })

    it('throws NotFoundError when notification not found', async () => {
      const repo = mockNotificationRepo({
        findByUserId: vi.fn().mockResolvedValue([]),
      })
      service = new NotificationService(repo)

      await expect(
        service.markAsRead('non-existent-id', 'user-id')
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('markAllAsRead()', () => {
    it('calls repo markAllAsRead with correct params', async () => {
      const repo = mockNotificationRepo()
      service = new NotificationService(repo)

      await service.markAllAsRead(
        '18477825-b6b4-42ff-8367-b5e9c1343989',
        'b3a90d51-8ac1-48ea-9d76-74130a62a8c0'
      )
      expect(repo.markAllAsRead).toHaveBeenCalledWith(
        '18477825-b6b4-42ff-8367-b5e9c1343989',
        'b3a90d51-8ac1-48ea-9d76-74130a62a8c0'
      )
    })

    it('resolves without throwing', async () => {
      await expect(
        service.markAllAsRead('user-id', 'conv-id')
      ).resolves.not.toThrow()
    })
  })

  describe('createNotification()', () => {
    it('creates and returns notification', async () => {
      const result = await service.createNotification({
        user_id:         '18477825-b6b4-42ff-8367-b5e9c1343989',
        conversation_id: 'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
        message_id:      '84e63a38-47ab-4865-a77d-4ee9d05ee1dd',
        sender_id:       '5bed31bb-959c-4a24-8f76-30ba4c80fe87',
      })
      expect(result).toBeDefined()
      expect(result.is_read).toBe(false)
    })
  })
})