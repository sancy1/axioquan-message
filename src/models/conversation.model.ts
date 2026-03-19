
// src/models/conversation.model.ts

import { ConversationType } from '../constants/conversationTypes.js'

export interface Conversation {
  id: string
  type: ConversationType
  title: string | null
  course_id: string | null
  created_by: string
  last_message_at: Date | null
  created_at: Date
  updated_at: Date
}

// Conversation with participant info joined — used in inbox list
export interface ConversationWithParticipant extends Conversation {
  my_role: string
  last_read_at: Date | null
  other_participant_id: string
  other_participant_username: string
  other_participant_name: string
  other_participant_image: string | null
  last_message_preview: string | null
}

// Input type for creating a conversation
export interface CreateConversationInput {
  type: ConversationType
  title?: string
  course_id?: string
  created_by: string
  participantIds: string[]
}

// Input type for updating a conversation
export interface UpdateConversationInput {
  title?: string
  last_message_at?: Date
}