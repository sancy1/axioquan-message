
// src/modules/notifications/notification.repository.ts

import { sql } from '../../db/client.js'
import type { INotificationService } from '../../interfaces/INotificationService.js'
import type {
  MessageNotification,
  MessageNotificationWithDetails,
  CreateNotificationInput,
} from '../../models/notification.model.js'
import { logger } from '../../utils/logger.js'

export class NotificationRepository implements INotificationService {

  // ── Find unread notifications for a user ────────────────────────────────────
  async findByUserId(
    userId: string
  ): Promise<MessageNotificationWithDetails[]> {
    const rows = await sql`
      SELECT
        mn.id,
        mn.user_id,
        mn.conversation_id,
        mn.message_id,
        mn.sender_id,
        mn.is_read,
        mn.read_at,
        mn.created_at,
        u.username        AS sender_username,
        u.name            AS sender_name,
        dm.message        AS message_preview,
        c.title           AS conversation_title
      FROM message_notifications mn
      JOIN users u
        ON u.id = mn.sender_id
      JOIN direct_messages dm
        ON dm.id = mn.message_id
      JOIN conversations c
        ON c.id = mn.conversation_id
      WHERE mn.user_id = ${userId}
      AND mn.is_read = false
      ORDER BY mn.created_at DESC
    `
    return rows.map((row) => this.mapRowWithDetails(row))
  }

  // ── Count unread notifications ──────────────────────────────────────────────
  async countUnread(userId: string): Promise<number> {
    const rows = await sql`
      SELECT COUNT(*) AS count
      FROM message_notifications
      WHERE user_id = ${userId}
      AND is_read = false
    `
    return parseInt(rows[0].count as string, 10)
  }

  // ── Create notification ─────────────────────────────────────────────────────
  async create(
    data: CreateNotificationInput
  ): Promise<MessageNotification> {
    const rows = await sql`
      INSERT INTO message_notifications (
        user_id,
        conversation_id,
        message_id,
        sender_id
      )
      VALUES (
        ${data.user_id},
        ${data.conversation_id},
        ${data.message_id},
        ${data.sender_id}
      )
      ON CONFLICT (user_id, message_id) DO NOTHING
      RETURNING
        id, user_id, conversation_id, message_id,
        sender_id, is_read, read_at, created_at
    `
    logger.info(
      { userId: data.user_id, messageId: data.message_id },
      'Message notification created'
    )
    return this.mapRow(rows[0])
  }

  // ── Mark single notification as read ────────────────────────────────────────
  async markAsRead(id: string): Promise<void> {
    await sql`
      UPDATE message_notifications
      SET
        is_read = true,
        read_at = now()
      WHERE id = ${id}
    `
  }

  // ── Mark all notifications read for a conversation ──────────────────────────
  async markAllAsRead(
    userId: string,
    conversationId: string
  ): Promise<void> {
    await sql`
      UPDATE message_notifications
      SET
        is_read = true,
        read_at = now()
      WHERE user_id = ${userId}
      AND conversation_id = ${conversationId}
      AND is_read = false
    `
  }

  // ── Delete notifications by message ID ─────────────────────────────────────
  async deleteByMessageId(messageId: string): Promise<void> {
    await sql`
      DELETE FROM message_notifications
      WHERE message_id = ${messageId}
    `
  }

  // ── Row mappers ─────────────────────────────────────────────────────────────
  private mapRow(row: Record<string, unknown>): MessageNotification {
    return {
      id:              row.id as string,
      user_id:         row.user_id as string,
      conversation_id: row.conversation_id as string,
      message_id:      row.message_id as string,
      sender_id:       row.sender_id as string,
      is_read:         row.is_read as boolean,
      read_at:         row.read_at
        ? new Date(row.read_at as string)
        : null,
      created_at:      new Date(row.created_at as string),
    }
  }

  private mapRowWithDetails(
    row: Record<string, unknown>
  ): MessageNotificationWithDetails {
    return {
      ...this.mapRow(row),
      sender_username:    row.sender_username as string,
      sender_name:        row.sender_name as string,
      message_preview:    row.message_preview as string,
      conversation_title: row.conversation_title as string | null,
    }
  }
}