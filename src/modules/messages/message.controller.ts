
// src/modules/messages/message.controller.ts

import type { FastifyRequest, FastifyReply } from 'fastify'
import { MessageService } from './message.service.js'
import { AppError } from '../../errors/AppError.js'
import { MessageRepository } from './message.repository.js'
import { ParticipantRepository } from '../participants/participant.repository.js'
import { ConversationRepository } from '../conversations/conversation.repository.js'
import {
  toMessageDto,
  toMessageWithSenderDto,
} from './message.dto.js'
import {
  sendMessageSchema,
  getMessagesQuerySchema,
  conversationIdParamSchema,
  messageIdParamSchema,
} from './message.validator.js'
import { success, created, noContent } from '../../utils/apiResponse.js'

// ── Instantiate service with real repositories ────────────────────────────────
const messageService = new MessageService(
  new MessageRepository(),
  new ParticipantRepository(),
  new ConversationRepository()
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

// ── GET /api/conversations/:conversationId/messages ───────────────────────────
// ── GET /api/conversations/:conversationId/messages ───────────────────────────
export async function getMessages(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const paramsParsed = conversationIdParamSchema.safeParse(request.params)
  if (!paramsParsed.success) {
    return sendValidationError(reply, paramsParsed.error.flatten().fieldErrors)
  }

  const queryParsed = getMessagesQuerySchema.safeParse(request.query)
  if (!queryParsed.success) {
    return sendValidationError(reply, queryParsed.error.flatten().fieldErrors)
  }

  try {
    const { messages, meta } = await messageService.getMessages(
      paramsParsed.data.conversationId,
      request.user.userId,
      queryParsed.data
    )
    reply.status(200).send(
      success(messages.map(toMessageWithSenderDto), 'Messages fetched', meta)
    )
  } catch (error) {
    handleServiceError(error, reply)
  }
}

// ── POST /api/conversations/:conversationId/messages ──────────────────────────
export async function sendMessage(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const paramsParsed = conversationIdParamSchema.safeParse(request.params)
  if (!paramsParsed.success) {
    return sendValidationError(reply, paramsParsed.error.flatten().fieldErrors)
  }

  const bodyParsed = sendMessageSchema.safeParse(request.body)
  if (!bodyParsed.success) {
    return sendValidationError(reply, bodyParsed.error.flatten().fieldErrors)
  }

  try {
    const message = await messageService.sendMessage(
      paramsParsed.data.conversationId,
      request.user.userId,
      bodyParsed.data
    )
    reply.status(201).send(
      created(toMessageDto(message), 'Message sent')
    )
  } catch (error) {
    handleServiceError(error, reply)
  }
}

// ── DELETE /api/messages/:id ──────────────────────────────────────────────────
export async function deleteMessage(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const paramsParsed = messageIdParamSchema.safeParse(request.params)
  if (!paramsParsed.success) {
    return sendValidationError(reply, paramsParsed.error.flatten().fieldErrors)
  }

  try {
    await messageService.deleteMessage(
      paramsParsed.data.id,
      request.user.userId
    )
    reply.status(200).send(noContent())
  } catch (error) {
    handleServiceError(error, reply)
  }
}
