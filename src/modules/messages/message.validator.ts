
// src/modules/messages/message.validator.ts

import { z } from 'zod'

// ── Send message ──────────────────────────────────────────────────────────────
export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message cannot exceed 5000 characters'),
  message_type: z
    .enum(['text', 'image', 'file', 'audio'])
    .default('text'),
  reply_to_id: z
    .string()
    .uuid('Invalid reply message ID')
    .optional(),
  attachment_url: z.string().url('Invalid attachment URL').optional(),
  attachment_type: z.string().max(50).optional(),
  attachment_size: z.number().int().positive().optional(),
})

// ── Get messages query ────────────────────────────────────────────────────────
export const getMessagesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
})

// ── Conversation ID param ─────────────────────────────────────────────────────
export const conversationIdParamSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
})

// ── Message ID param ──────────────────────────────────────────────────────────
export const messageIdParamSchema = z.object({
  id: z.string().uuid('Invalid message ID'),
})

// ── Inferred types ────────────────────────────────────────────────────────────
export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type GetMessagesQuery = z.infer<typeof getMessagesQuerySchema>
export type ConversationIdParam = z.infer<typeof conversationIdParamSchema>
export type MessageIdParam = z.infer<typeof messageIdParamSchema>