
// src/events/message.events.ts

export const MESSAGE_EVENTS = {
  SENT:      'message:sent',
  DELIVERED: 'message:delivered',
  READ:      'message:read',
} as const

export interface MessageSentPayload {
  messageId:      string
  conversationId: string
  senderId:       string
  receiverId:     string
  participantIds: string[]
}

export interface MessageReadPayload {
  messageId:      string
  userId:         string
  conversationId: string
}

export interface MessageDeliveredPayload {
  messageId:      string
  conversationId: string
}