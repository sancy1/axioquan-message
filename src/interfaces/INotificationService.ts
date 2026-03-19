// src/interfaces/INotificationService.ts

import {
  MessageNotification,
  MessageNotificationWithDetails,
  CreateNotificationInput,
} from '../models/notification.model.js'

export interface INotificationService {
  findByUserId(
    userId: string
  ): Promise<MessageNotificationWithDetails[]>

  countUnread(userId: string): Promise<number>

  create(data: CreateNotificationInput): Promise<MessageNotification>

  markAsRead(id: string): Promise<void>

  markAllAsRead(
    userId: string,
    conversationId: string
  ): Promise<void>

  deleteByMessageId(messageId: string): Promise<void>
}