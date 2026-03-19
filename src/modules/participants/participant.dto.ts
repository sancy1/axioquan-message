
// src/modules/participants/participant.dto.ts

import type { ParticipantWithUser } from '../../models/participant.model.js'

export interface ParticipantDto {
  id:             string
  conversationId: string
  userId:         string
  role:           string
  joinedAt:       string
  lastReadAt:     string | null
  user: {
    username: string
    name:     string
    image:    string | null
  }
}

export function toParticipantDto(p: ParticipantWithUser): ParticipantDto {
  return {
    id:             p.id,
    conversationId: p.conversation_id,
    userId:         p.user_id,
    role:           p.role,
    joinedAt:       p.joined_at.toISOString(),
    lastReadAt:     p.last_read_at ? p.last_read_at.toISOString() : null,
    user: {
      username: p.username,
      name:     p.name,
      image:    p.image,
    },
  }
}