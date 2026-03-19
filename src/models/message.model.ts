
// src/models/message.model.ts

import { MessageStatus } from '../constants/messageStatus.js'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  course_id: string | null
  message: string
  message_type: string
  attachment_url: string | null
  attachment_type: string | null
  attachment_size: number | null
  is_delivered: boolean
  is_read: boolean
  delivered_at: Date | null
  read_at: Date | null
  is_edited: boolean
  edited_at: Date | null
  reply_to_id: string | null
  reactions: Record<string, unknown> | null
  is_reported: boolean
  reported_at: Date | null
  created_at: Date
}

// Message with sender info joined — used in message thread
export interface MessageWithSender extends Message {
  sender_username: string
  sender_name: string
  sender_image: string | null
  recipient_has_read: boolean
  recipient_read_at: Date | null
}

// Input for sending a new message
export interface CreateMessageInput {
  conversation_id: string
  sender_id: string
  receiver_id: string
  message: string
  message_type?: string
  course_id?: string
  reply_to_id?: string
  attachment_url?: string
  attachment_type?: string
  attachment_size?: number
}

// Input for updating a message
export interface UpdateMessageInput {
  message?: string
  is_edited?: boolean
  edited_at?: Date
  is_delivered?: boolean
  delivered_at?: Date
  is_read?: boolean
  read_at?: Date
  is_reported?: boolean
  reported_at?: Date
}