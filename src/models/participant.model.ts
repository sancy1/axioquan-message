
// src/models/participant.model.ts

import { ParticipantRole } from '../constants/roles.js'

export interface Participant {
  id: string
  conversation_id: string
  user_id: string
  role: ParticipantRole
  joined_at: Date
  last_read_at: Date | null
}

// Participant with user details joined
export interface ParticipantWithUser extends Participant {
  username: string
  name: string
  image: string | null
}

// Input for adding a participant
export interface AddParticipantInput {
  conversation_id: string
  user_id: string
  role: ParticipantRole
}