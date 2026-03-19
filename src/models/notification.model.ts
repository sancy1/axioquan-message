
// src/models/notification.model.ts

export interface MessageNotification {
  id: string
  user_id: string
  conversation_id: string
  message_id: string
  sender_id: string
  is_read: boolean
  read_at: Date | null
  created_at: Date
}

// Notification with sender and message details joined
export interface MessageNotificationWithDetails extends MessageNotification {
  sender_username: string
  sender_name: string
  message_preview: string
  conversation_title: string | null
}

// Input for creating a notification
export interface CreateNotificationInput {
  user_id: string
  conversation_id: string
  message_id: string
  sender_id: string
}