
// src/modules/conversations/conversation.dto.ts


import type {
  Conversation,
  ConversationWithParticipant,
} from '../../models/conversation.model.js'

// ── Single conversation response ──────────────────────────────────────────────
export interface ConversationDto {
  id: string
  type: string
  title: string | null
  courseId: string | null
  createdBy: string
  lastMessageAt: string | null
  createdAt: string
  updatedAt: string
}

// ── Conversation in inbox list ────────────────────────────────────────────────
export interface ConversationInboxDto extends ConversationDto {
  myRole: string
  lastReadAt: string | null
  otherParticipant: {
    id: string
    username: string
    name: string
    image: string | null
  }
  lastMessagePreview: string | null
}

// ── Mappers — convert DB rows to DTOs ─────────────────────────────────────────

export function toConversationDto(conv: Conversation): ConversationDto {
  return {
    id: conv.id,
    type: conv.type,
    title: conv.title,
    courseId: conv.course_id,
    createdBy: conv.created_by,
    lastMessageAt: conv.last_message_at
      ? conv.last_message_at.toISOString()
      : null,
    createdAt: conv.created_at.toISOString(),
    updatedAt: conv.updated_at.toISOString(),
  }
}

export function toConversationInboxDto(
  conv: ConversationWithParticipant
): ConversationInboxDto {
  return {
    id: conv.id,
    type: conv.type,
    title: conv.title,
    courseId: conv.course_id,
    createdBy: conv.created_by,
    lastMessageAt: conv.last_message_at
      ? conv.last_message_at.toISOString()
      : null,
    createdAt: conv.created_at.toISOString(),
    updatedAt: conv.updated_at.toISOString(),
    myRole: conv.my_role,
    lastReadAt: conv.last_read_at
      ? conv.last_read_at.toISOString()
      : null,
    otherParticipant: {
      id: conv.other_participant_id,
      username: conv.other_participant_username,
      name: conv.other_participant_name,
      image: conv.other_participant_image,
    },
    lastMessagePreview: conv.last_message_preview,
  }
}

// import type {
//   Conversation,
//   ConversationWithParticipant,
// } from '../../models/conversation.model.js'

// // ── Single conversation response ──────────────────────────────────────────────
// export interface ConversationDto {
//   id: string
//   type: string
//   title: string | null
//   courseId: string | null
//   createdBy: string
//   lastMessageAt: string | null
//   createdAt: string
//   updatedAt: string
// }

// // ── Conversation with participant info (for inbox list) ───────────────────────
// export interface ConversationInboxDto extends ConversationDto {
//   myRole: string
//   lastReadAt: string | null
//   otherParticipant: {
//     id: string
//     username: string
//     name: string
//     image: string | null
//   }
//   lastMessagePreview: string | null
// }

// // ── Mappers ───────────────────────────────────────────────────────────────────
// export function toConversationDto(c: Conversation): ConversationDto {
//   return {
//     id: c.id,
//     type: c.type,
//     title: c.title,
//     courseId: c.course_id,
//     createdBy: c.created_by,
//     lastMessageAt: c.last_message_at?.toISOString() ?? null,
//     createdAt: c.created_at.toISOString(),
//     updatedAt: c.updated_at.toISOString(),
//   }
// }

// export function toConversationInboxDto(
//   c: ConversationWithParticipant
// ): ConversationInboxDto {
//   return {
//     id: c.id,
//     type: c.type,
//     title: c.title,
//     courseId: c.course_id,
//     createdBy: c.created_by,
//     lastMessageAt: c.last_message_at?.toISOString() ?? null,
//     createdAt: c.created_at.toISOString(),
//     updatedAt: c.updated_at.toISOString(),
//     myRole: c.my_role,
//     lastReadAt: c.last_read_at?.toISOString() ?? null,
//     otherParticipant: {
//       id: c.other_participant_id,
//       username: c.other_participant_username,
//       name: c.other_participant_name,
//       image: c.other_participant_image,
//     },
//     lastMessagePreview: c.last_message_preview,
//   }
// }