
// src/events/conversation.events.ts

export const CONVERSATION_EVENTS = {
  CREATED: 'conversation:created',
  DELETED: 'conversation:deleted',
} as const

export interface ConversationCreatedPayload {
  conversationId: string
  createdBy:      string
  participantIds: string[]
}