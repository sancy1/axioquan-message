
// src/modules/notifications/notification.controller.ts

import type { FastifyRequest, FastifyReply } from 'fastify'
import { NotificationService } from './notification.service.js'
import { NotificationRepository } from './notification.repository.js'
import { AppError } from '../../errors/AppError.js'
import { toNotificationDto } from './notification.dto.js'
import { z } from 'zod'
import { success } from '../../utils/apiResponse.js'

// ── Instantiate service ───────────────────────────────────────────────────────
const notificationService = new NotificationService(
  new NotificationRepository()
)

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── GET /api/notifications ────────────────────────────────────────────────────
export async function getNotifications(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const notifications = await notificationService.getNotifications(
      request.user.userId
    )
    reply.status(200).send(
      success(
        notifications.map(toNotificationDto),
        'Notifications fetched'
      )
    )
  } catch (error) {
    handleServiceError(error, reply)
  }
}

// ── GET /api/notifications/count ──────────────────────────────────────────────
export async function getNotificationCount(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const count = await notificationService.countUnread(request.user.userId)
    reply.status(200).send(
      success({ count }, 'Unread count fetched')
    )
  } catch (error) {
    handleServiceError(error, reply)
  }
}

// ── PATCH /api/notifications/:id/read ────────────────────────────────────────
export async function markAsRead(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const paramSchema = z.object({
    id: z.string().uuid('Invalid notification ID'),
  })
  const parsed = paramSchema.safeParse(request.params)
  if (!parsed.success) {
    reply.status(422).send({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        fields: parsed.error.flatten().fieldErrors,
      },
    })
    return
  }

  try {
    await notificationService.markAsRead(
      parsed.data.id,
      request.user.userId
    )
    reply.status(200).send(
      success(null, 'Notification marked as read')
    )
  } catch (error) {
    handleServiceError(error, reply)
  }
}

// ── PATCH /api/notifications/read-all ────────────────────────────────────────
export async function markAllAsRead(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const bodySchema = z.object({
    conversationId: z.string().uuid('Invalid conversation ID'),
  })
  const parsed = bodySchema.safeParse(request.body)
  if (!parsed.success) {
    reply.status(422).send({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        fields: parsed.error.flatten().fieldErrors,
      },
    })
    return
  }

  try {
    await notificationService.markAllAsRead(
      request.user.userId,
      parsed.data.conversationId
    )
    reply.status(200).send(
      success(null, 'All notifications marked as read')
    )
  } catch (error) {
    handleServiceError(error, reply)
  }
}