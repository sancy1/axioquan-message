
// src/modules/messages/message.dto.ts

import type {
  Message,
  MessageWithSender,
} from '../../models/message.model.js'

// ── Single message response ───────────────────────────────────────────────────
export interface MessageDto {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  messageType: string
  attachmentUrl: string | null
  attachmentType: string | null
  attachmentSize: number | null
  isDelivered: boolean
  isRead: boolean
  deliveredAt: string | null
  readAt: string | null
  isEdited: boolean
  editedAt: string | null
  replyToId: string | null
  reactions: Record<string, unknown> | null
  createdAt: string
}

// ── Message with sender details ───────────────────────────────────────────────
export interface MessageWithSenderDto extends MessageDto {
  sender: {
    username: string
    name: string
    image: string | null
  }
  recipientHasRead: boolean
  recipientReadAt: string | null
}

// ── Mappers ───────────────────────────────────────────────────────────────────
export function toMessageDto(msg: Message): MessageDto {
  return {
    id:             msg.id,
    conversationId: msg.conversation_id,
    senderId:       msg.sender_id,
    receiverId:     msg.receiver_id,
    content:        msg.message,
    messageType:    msg.message_type,
    attachmentUrl:  msg.attachment_url,
    attachmentType: msg.attachment_type,
    attachmentSize: msg.attachment_size,
    isDelivered:    msg.is_delivered,
    isRead:         msg.is_read,
    deliveredAt:    msg.delivered_at
      ? msg.delivered_at.toISOString()
      : null,
    readAt:         msg.read_at
      ? msg.read_at.toISOString()
      : null,
    isEdited:       msg.is_edited,
    editedAt:       msg.edited_at
      ? msg.edited_at.toISOString()
      : null,
    replyToId:      msg.reply_to_id,
    reactions:      msg.reactions,
    createdAt:      msg.created_at.toISOString(),
  }
}

export function toMessageWithSenderDto(
  msg: MessageWithSender
): MessageWithSenderDto {
  return {
    ...toMessageDto(msg),
    sender: {
      username: msg.sender_username,
      name:     msg.sender_name,
      image:    msg.sender_image,
    },
    recipientHasRead: msg.recipient_has_read,
    recipientReadAt:  msg.recipient_read_at
      ? msg.recipient_read_at.toISOString()
      : null,
  }
}