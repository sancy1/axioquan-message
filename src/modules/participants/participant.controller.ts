
// src/modules/participants/participant.controller.ts

import type { FastifyRequest, FastifyReply } from 'fastify'
import { ParticipantService } from './participant.service.js'
import { ParticipantRepository } from './participant.repository.js'
import { ConversationRepository } from '../conversations/conversation.repository.js'
import { AppError } from '../../errors/AppError.js'
import { toParticipantDto } from './participant.dto.js'
import {
  addParticipantSchema,
  participantConversationParamSchema,
  removeParticipantParamSchema,
} from './participant.validator.js'
import { success, created, noContent } from '../../utils/apiResponse.js'

// ── Instantiate service ───────────────────────────────────────────────────────
const participantService = new ParticipantService(
  new ParticipantRepository(),
  new ConversationRepository()
)

// ── Helpers ───────────────────────────────────────────────────────────────────
function sendValidationError(
  reply: FastifyReply,
  fields: Record<string, string[] | undefined>
): void {
  reply.status(422).send({
    success: false,
    error: { message: 'Validation failed', code: 'VALIDATION_ERROR', fields },
  })
}

function handleServiceError(error: unknown, reply: FastifyReply): void {
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      success: false,
      error: { message: error.message, code: error.code },
    })
    return
  }
  throw error
}

// ── GET /api/conversations/:id/participants ───────────────────────────────────
export async function getParticipants(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const paramsParsed = participantConversationParamSchema.safeParse(
    request.params
  )
  if (!paramsParsed.success) {
    return sendValidationError(reply, paramsParsed.error.flatten().fieldErrors)
  }

  try {
    const participants = await participantService.getParticipants(
      paramsParsed.data.id,
      request.user.userId
    )
    reply.status(200).send(
      success(participants.map(toParticipantDto), 'Participants fetched')
    )
  } catch (error) {
    handleServiceError(error, reply)
  }
}

// ── POST /api/conversations/:id/participants ──────────────────────────────────
export async function addParticipant(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const paramsParsed = participantConversationParamSchema.safeParse(
    request.params
  )
  if (!paramsParsed.success) {
    return sendValidationError(reply, paramsParsed.error.flatten().fieldErrors)
  }

  const bodyParsed = addParticipantSchema.safeParse(request.body)
  if (!bodyParsed.success) {
    return sendValidationError(reply, bodyParsed.error.flatten().fieldErrors)
  }

  try {
    const participant = await participantService.addParticipant(
      paramsParsed.data.id,
      bodyParsed.data,
      request.user.userId
    )
    reply.status(201).send(
      created(toParticipantDto(participant), 'Participant added')
    )
  } catch (error) {
    handleServiceError(error, reply)
  }
}

// ── DELETE /api/conversations/:id/participants/:userId ────────────────────────
export async function removeParticipant(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const paramsParsed = removeParticipantParamSchema.safeParse(request.params)
  if (!paramsParsed.success) {
    return sendValidationError(reply, paramsParsed.error.flatten().fieldErrors)
  }

  try {
    await participantService.removeParticipant(
      paramsParsed.data.id,
      paramsParsed.data.userId,
      request.user.userId
    )
    reply.status(200).send(noContent())
  } catch (error) {
    handleServiceError(error, reply)
  }
}