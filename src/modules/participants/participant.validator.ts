
// src/modules/participants/participant.validator.ts

import { z } from 'zod'
import { ParticipantRole } from '../../constants/roles.js'

// ── Add participant ───────────────────────────────────────────────────────────
export const addParticipantSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.nativeEnum(ParticipantRole).default(ParticipantRole.STUDENT),
})

// ── Conversation ID param ─────────────────────────────────────────────────────
export const participantConversationParamSchema = z.object({
  id: z.string().uuid('Invalid conversation ID'),
})

// ── Remove participant param ──────────────────────────────────────────────────
export const removeParticipantParamSchema = z.object({
  id:     z.string().uuid('Invalid conversation ID'),
  userId: z.string().uuid('Invalid user ID'),
})

// ── Inferred types ────────────────────────────────────────────────────────────
export type AddParticipantBody   = z.infer<typeof addParticipantSchema>
export type RemoveParticipantParam = z.infer<typeof removeParticipantParamSchema>