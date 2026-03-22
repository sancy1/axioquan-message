
// src/events/message.listener.ts

// import { emitter } from './eventEmitter.js'
// import { MESSAGE_EVENTS } from './message.events.js'
// import type { MessageSentPayload } from './message.events.js'
// import { NotificationRepository } from '../modules/notifications/notification.repository.js'
// import { sendToUser } from '../websocket/websocket.manager.js'
// import { WS_EVENTS } from '../websocket/websocket.handler.js'
// import { sql } from '../db/client.js'
// import { logger } from '../utils/logger.js'

// const notificationRepo = new NotificationRepository()

// // ── Listen for MessageSent event ──────────────────────────────────────────────
// emitter.on(MESSAGE_EVENTS.SENT, async (payload: MessageSentPayload) => {
//   logger.info(
//     { messageId: payload.messageId, conversationId: payload.conversationId },
//     'MessageSent event received'
//   )

//   // ── Push message to receiver via WebSocket ────────────────────────────────
//   const pushed = sendToUser(payload.receiverId, {
//     type: WS_EVENTS.MESSAGE,
//     payload: {
//       messageId:      payload.messageId,
//       conversationId: payload.conversationId,
//       senderId:       payload.senderId,
//       timestamp:      new Date().toISOString(),
//     },
//   })

//   if (pushed) {
//     logger.info(
//       { receiverId: payload.receiverId },
//       'Message pushed via WebSocket'
//     )
//   }

//   // ── Create notification ───────────────────────────────────────────────────
//   try {
//     await notificationRepo.create({
//       user_id:         payload.receiverId,
//       conversation_id: payload.conversationId,
//       message_id:      payload.messageId,
//       sender_id:       payload.senderId,
//     })
//   } catch (error) {
//     logger.error({ err: error, payload }, 'Failed to create notification')
//   }

//   // ── Create read receipt ───────────────────────────────────────────────────
//   try {
//     await sql`
//       INSERT INTO message_read_receipts (
//         message_id,
//         user_id,
//         conversation_id
//       )
//       VALUES (
//         ${payload.messageId},
//         ${payload.receiverId},
//         ${payload.conversationId}
//       )
//       ON CONFLICT (message_id, user_id) DO NOTHING
//     `
//   } catch (error) {
//     logger.error({ err: error, payload }, 'Failed to create read receipt')
//   }
// })

// // ── Listen for MessageRead event ──────────────────────────────────────────────
// emitter.on(MESSAGE_EVENTS.READ, async (payload: {
//   messageId: string
//   userId: string
//   conversationId: string
// }) => {
//   // Push read receipt to sender via WebSocket
//   sendToUser(payload.userId, {
//     type: WS_EVENTS.READ,
//     payload: {
//       messageId:      payload.messageId,
//       conversationId: payload.conversationId,
//       readAt:         new Date().toISOString(),
//     },
//   })

//   try {
//     await sql`
//       UPDATE message_notifications
//       SET is_read = true, read_at = now()
//       WHERE message_id = ${payload.messageId}
//       AND user_id = ${payload.userId}
//       AND is_read = false
//     `
//   } catch (error) {
//     logger.error({ err: error, payload }, 'Failed to mark notification read')
//   }
// })

// logger.info('Message event listeners registered')







import { emitter } from './eventEmitter.js'
import { MESSAGE_EVENTS } from './message.events.js'
import type { MessageSentPayload } from './message.events.js'
import { NotificationRepository } from '../modules/notifications/notification.repository.js'
import { sendToUsers } from '../websocket/websocket.manager.js'
import { WS_EVENTS } from '../websocket/websocket.handler.js'
import { sql } from '../db/client.js'
import { logger } from '../utils/logger.js'

const notificationRepo = new NotificationRepository()

// ── Listen for MessageSent event ──────────────────────────────────────────────
emitter.on(MESSAGE_EVENTS.SENT, async (payload: MessageSentPayload) => {
  logger.info(
    { messageId: payload.messageId, conversationId: payload.conversationId },
    'MessageSent event received'
  )

  // ── Get all recipients (everyone except sender) ───────────────────────────
  const recipients = payload.participantIds.filter(
    (id) => id !== payload.senderId
  )

  // ── Push to all recipients via WebSocket ──────────────────────────────────
  sendToUsers(recipients, {
    type: WS_EVENTS.MESSAGE,
    payload: {
      messageId:      payload.messageId,
      conversationId: payload.conversationId,
      senderId:       payload.senderId,
      timestamp:      new Date().toISOString(),
    },
  })

  logger.info(
    { recipients, messageId: payload.messageId },
    `Message pushed via WebSocket to ${recipients.length} recipient(s)`
  )

  // ── Create notification + read receipt for each recipient ─────────────────
  for (const recipientId of recipients) {
    try {
      await notificationRepo.create({
        user_id:         recipientId,
        conversation_id: payload.conversationId,
        message_id:      payload.messageId,
        sender_id:       payload.senderId,
      })
    } catch (error) {
      logger.error(
        { err: error, recipientId },
        'Failed to create notification'
      )
    }

    try {
      await sql`
        INSERT INTO message_read_receipts (
          message_id,
          user_id,
          conversation_id
        )
        VALUES (
          ${payload.messageId},
          ${recipientId},
          ${payload.conversationId}
        )
        ON CONFLICT (message_id, user_id) DO NOTHING
      `
    } catch (error) {
      logger.error(
        { err: error, recipientId },
        'Failed to create read receipt'
      )
    }
  }
})

// ── Listen for MessageRead event ──────────────────────────────────────────────
emitter.on(MESSAGE_EVENTS.READ, async (payload: {
  messageId: string
  userId: string
  conversationId: string
}) => {
  try {
    await sql`
      UPDATE message_notifications
      SET is_read = true, read_at = now()
      WHERE message_id = ${payload.messageId}
      AND user_id = ${payload.userId}
      AND is_read = false
    `
    logger.info(
      { messageId: payload.messageId, userId: payload.userId },
      'Notification marked read via MessageRead event'
    )
  } catch (error) {
    logger.error({ err: error, payload }, 'Failed to mark notification read')
  }
})

logger.info('Message event listeners registered')