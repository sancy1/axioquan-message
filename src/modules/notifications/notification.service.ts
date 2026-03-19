
// src/modules/notifications/notification.service.ts

import type { INotificationService } from '../../interfaces/INotificationService.js'
import type {
  MessageNotification,
  MessageNotificationWithDetails,
  CreateNotificationInput,
} from '../../models/notification.model.js'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { HttpError } from '../../errors/HttpError.js'
import { logger } from '../../utils/logger.js'

export class NotificationService {
  constructor(
    private readonly notificationRepo: INotificationService
  ) {}

  // ── Get unread notifications ────────────────────────────────────────────────
  async getNotifications(
    userId: string
  ): Promise<MessageNotificationWithDetails[]> {
    return this.notificationRepo.findByUserId(userId)
  }

  // ── Count unread ────────────────────────────────────────────────────────────
  async countUnread(userId: string): Promise<number> {
    return this.notificationRepo.countUnread(userId)
  }

  // ── Create notification ─────────────────────────────────────────────────────
  async createNotification(
    data: CreateNotificationInput
  ): Promise<MessageNotification> {
    return this.notificationRepo.create(data)
  }

  // ── Mark single notification as read ────────────────────────────────────────
  async markAsRead(id: string, userId: string): Promise<void> {
    const notifications = await this.notificationRepo.findByUserId(userId)
    const notification = notifications.find((n) => n.id === id)

    if (!notification) {
      throw new NotFoundError('Notification')
    }

    if (notification.user_id !== userId) {
      throw new HttpError(
        403,
        'Forbidden — you can only mark your own notifications as read',
        'FORBIDDEN'
      )
    }

    await this.notificationRepo.markAsRead(id)
    logger.info({ id, userId }, 'Notification marked as read')
  }

  // ── Mark all as read ────────────────────────────────────────────────────────
  async markAllAsRead(
    userId: string,
    conversationId: string
  ): Promise<void> {
    await this.notificationRepo.markAllAsRead(userId, conversationId)
    logger.info({ userId, conversationId }, 'All notifications marked as read')
  }
}

