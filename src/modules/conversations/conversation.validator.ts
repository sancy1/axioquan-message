
// src/modules/conversations/conversation.validator.ts

import { z } from 'zod'
import { ConversationType } from '../../constants/conversationTypes.js'

// ── Create conversation ───────────────────────────────────────────────────────
export const createConversationSchema = z.object({
  type: z.nativeEnum(ConversationType).default(ConversationType.DIRECT),
  title: z.string().max(255).optional(),
  course_id: z.string().uuid('Invalid course ID').optional(),
  participantIds: z
    .array(z.string().uuid('Invalid participant ID'))
    .min(1, 'At least one participant is required')
    .max(10, 'Maximum 10 participants allowed'),
})

// ── Update conversation ───────────────────────────────────────────────────────
export const updateConversationSchema = z.object({
  title: z.string().min(1).max(255),
})

// ── Get conversations query ───────────────────────────────────────────────────
export const getConversationsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

// ── UUID param ────────────────────────────────────────────────────────────────
export const conversationParamSchema = z.object({
  id: z.string().uuid('Invalid conversation ID'),
})

// ── Inferred types ────────────────────────────────────────────────────────────
export type CreateConversationInput = z.infer<typeof createConversationSchema>
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>
export type GetConversationsQuery = z.infer<typeof getConversationsQuerySchema>
export type ConversationParam = z.infer<typeof conversationParamSchema>


// import { z } from 'zod'

// // ── Create conversation ───────────────────────────────────────────────────────
// export const createConversationSchema = z.object({
//   type: z.enum(['direct', 'group']).default('direct'),
//   title: z.string().max(255).optional(),
//   course_id: z.string().uuid('Invalid course ID').optional(),
//   participantIds: z
//     .array(z.string().uuid('Invalid participant ID'))
//     .min(1, 'At least one participant is required')
//     .max(50, 'Too many participants'),
// })

// // ── Update conversation ───────────────────────────────────────────────────────
// export const updateConversationSchema = z.object({
//   title: z.string().min(1).max(255),
// })

// // ── Get conversations query params ────────────────────────────────────────────
// export const getConversationsQuerySchema = z.object({
//   page: z.coerce.number().min(1).default(1),
//   limit: z.coerce.number().min(1).max(100).default(20),
// })

// // ── UUID param ────────────────────────────────────────────────────────────────
// export const conversationParamSchema = z.object({
//   id: z.string().uuid('Invalid conversation ID'),
// })

// // ── Inferred types ────────────────────────────────────────────────────────────
// export type CreateConversationInput = z.infer<typeof createConversationSchema>
// export type UpdateConversationInput = z.infer<typeof updateConversationSchema>
// export type GetConversationsQuery = z.infer<typeof getConversationsQuerySchema>
// export type ConversationParam = z.infer<typeof conversationParamSchema>