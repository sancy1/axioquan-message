
// src/modules/conversations/conversation.controller.ts

import type { FastifyRequest, FastifyReply } from 'fastify'
import { ConversationService } from './conversation.service.js'
import { ConversationRepository } from './conversation.repository.js'
import { ParticipantRepository } from '../participants/participant.repository.js'
import { AppError } from '../../errors/AppError.js'
import {
  toConversationDto,
  toConversationInboxDto,
} from './conversation.dto.js'
import {
  createConversationSchema,
  updateConversationSchema,
  conversationParamSchema,
  getConversationsQuerySchema,
} from './conversation.validator.js'
import { success, created, noContent } from '../../utils/apiResponse.js'

// ── Instantiate service with real repositories ────────────────────────────────
const conversationService = new ConversationService(
  new ConversationRepository(),
  new ParticipantRepository()
)

// ── Validation helper ─────────────────────────────────────────────────────────
function sendValidationError(
  reply: FastifyReply,
  fields: Record<string, string[] | undefined>
): void {
  reply.status(422).send({
    success: false,
    error: {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      fields,
    },
  })
}

// ── Service error handler ─────────────────────────────────────────────────────
function handleServiceError(error: unknown, reply: FastifyReply): void {
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      success: false,
      error: {
        message: error.message,
        code: error.code,
      },
    })
    return
  }
  throw error
}

// ── GET /api/conversations ────────────────────────────────────────────────────
export async function getConversations(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const queryParsed = getConversationsQuerySchema.safeParse(request.query)
  if (!queryParsed.success) {
    return sendValidationError(reply, queryParsed.error.flatten().fieldErrors)
  }

  try {
    const { conversations, meta } = await conversationService.getConversations(
      request.user.userId,
      queryParsed.data
    )
    reply.status(200).send(
      success(
        conversations.map(toConversationInboxDto),
        'Conversations fetched',
        meta
      )
    )
  } catch (error) {
    handleServiceError(error, reply)
  }
}

// ── GET /api/conversations/:id ────────────────────────────────────────────────
export async function getConversationById(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const paramsParsed = conversationParamSchema.safeParse(request.params)
  if (!paramsParsed.success) {
    return sendValidationError(reply, paramsParsed.error.flatten().fieldErrors)
  }

  try {
    const conversation = await conversationService.getConversationById(
      paramsParsed.data.id,
      request.user.userId
    )
    reply.status(200).send(
      success(toConversationDto(conversation), 'Conversation fetched')
    )
  } catch (error) {
    handleServiceError(error, reply)
  }
}

// ── POST /api/conversations ───────────────────────────────────────────────────
export async function createConversation(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const bodyParsed = createConversationSchema.safeParse(request.body)
  if (!bodyParsed.success) {
    return sendValidationError(reply, bodyParsed.error.flatten().fieldErrors)
  }

  try {
    const conversation = await conversationService.createConversation(
      bodyParsed.data,
      request.user.userId
    )
    reply.status(201).send(
      created(toConversationDto(conversation), 'Conversation created')
    )
  } catch (error) {
    handleServiceError(error, reply)
  }
}

// ── PATCH /api/conversations/:id ──────────────────────────────────────────────
export async function updateConversation(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const paramsParsed = conversationParamSchema.safeParse(request.params)
  if (!paramsParsed.success) {
    return sendValidationError(reply, paramsParsed.error.flatten().fieldErrors)
  }

  const bodyParsed = updateConversationSchema.safeParse(request.body)
  if (!bodyParsed.success) {
    return sendValidationError(reply, bodyParsed.error.flatten().fieldErrors)
  }

  try {
    const conversation = await conversationService.updateConversation(
      paramsParsed.data.id,
      bodyParsed.data,
      request.user.userId
    )
    reply.status(200).send(
      success(toConversationDto(conversation), 'Conversation updated')
    )
  } catch (error) {
    handleServiceError(error, reply)
  }
}

// ── DELETE /api/conversations/:id ─────────────────────────────────────────────
export async function deleteConversation(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const paramsParsed = conversationParamSchema.safeParse(request.params)
  if (!paramsParsed.success) {
    return sendValidationError(reply, paramsParsed.error.flatten().fieldErrors)
  }

  try {
    await conversationService.deleteConversation(
      paramsParsed.data.id,
      request.user.userId
    )
    reply.status(200).send(noContent())
  } catch (error) {
    handleServiceError(error, reply)
  }
}