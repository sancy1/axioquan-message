
// src/modules/notifications/notification.dto.ts

import type { MessageNotificationWithDetails } from '../../models/notification.model.js'

export interface NotificationDto {
  id:                 string
  userId:             string
  conversationId:     string
  messageId:          string
  isRead:             boolean
  readAt:             string | null
  createdAt:          string
  sender: {
    username: string
    name:     string
  }
  messagePreview:     string
  conversationTitle:  string | null
}

export function toNotificationDto(
  n: MessageNotificationWithDetails
): NotificationDto {
  return {
    id:               n.id,
    userId:           n.user_id,
    conversationId:   n.conversation_id,
    messageId:        n.message_id,
    isRead:           n.is_read,
    readAt:           n.read_at ? n.read_at.toISOString() : null,
    createdAt:        n.created_at.toISOString(),
    sender: {
      username: n.sender_username,
      name:     n.sender_name,
    },
    messagePreview:    n.message_preview,
    conversationTitle: n.conversation_title,
  }
}