
// src/modules/messages/message.repository.ts

import { sql } from '../../db/client.js'
import type { IMessageRepository } from '../../interfaces/IMessageRepository.js'
import type {
  Message,
  MessageWithSender,
  CreateMessageInput,
  UpdateMessageInput,
} from '../../models/message.model.js'
import type { PaginationParams } from '../../utils/pagination.js'
import { logger } from '../../utils/logger.js'

export class MessageRepository implements IMessageRepository {

  // ── Find by ID ──────────────────────────────────────────────────────────────
  async findById(id: string): Promise<Message | null> {
    const rows = await sql`
      SELECT
        id, conversation_id, sender_id, receiver_id,
        course_id, message, message_type,
        attachment_url, attachment_type, attachment_size,
        is_delivered, is_read, delivered_at, read_at,
        is_edited, edited_at, reply_to_id, reactions,
        is_reported, reported_at, created_at
      FROM direct_messages
      WHERE id = ${id}
      LIMIT 1
    `
    if (rows.length === 0) return null
    return this.mapRow(rows[0])
  }

  // ── Find messages in a conversation ─────────────────────────────────────────
  async findByConversationId(
    conversationId: string,
    recipientId: string,
    pagination: PaginationParams
  ): Promise<MessageWithSender[]> {
    const { limit, page } = pagination
    const offset = (page - 1) * limit

    const rows = await sql`
      SELECT
        dm.id,
        dm.conversation_id,
        dm.sender_id,
        dm.receiver_id,
        dm.course_id,
        dm.message,
        dm.message_type,
        dm.attachment_url,
        dm.attachment_type,
        dm.attachment_size,
        dm.is_delivered,
        dm.is_read,
        dm.delivered_at,
        dm.read_at,
        dm.is_edited,
        dm.edited_at,
        dm.reply_to_id,
        dm.reactions,
        dm.is_reported,
        dm.reported_at,
        dm.created_at,
        u.username        AS sender_username,
        u.name            AS sender_name,
        u.image           AS sender_image,
        mrr.is_read       AS recipient_has_read,
        mrr.read_at       AS recipient_read_at
      FROM direct_messages dm
      JOIN users u
        ON u.id = dm.sender_id
      LEFT JOIN message_read_receipts mrr
        ON mrr.message_id = dm.id
        AND mrr.user_id = ${recipientId}
      WHERE dm.conversation_id = ${conversationId}
      ORDER BY dm.created_at ASC
      LIMIT ${limit} OFFSET ${offset}
    `
    return rows.map((row) => this.mapRowWithSender(row))
  }

  // ── Count messages in a conversation ────────────────────────────────────────
  async countByConversationId(conversationId: string): Promise<number> {
    const rows = await sql`
      SELECT COUNT(*) AS count
      FROM direct_messages
      WHERE conversation_id = ${conversationId}
    `
    return parseInt(rows[0].count as string, 10)
  }

  // ── Create message ──────────────────────────────────────────────────────────
  async create(data: CreateMessageInput): Promise<Message> {
    const rows = await sql`
      INSERT INTO direct_messages (
        conversation_id,
        sender_id,
        receiver_id,
        message,
        message_type,
        course_id,
        reply_to_id,
        attachment_url,
        attachment_type,
        attachment_size
      )
      VALUES (
        ${data.conversation_id},
        ${data.sender_id},
        ${data.receiver_id},
        ${data.message},
        ${data.message_type ?? 'text'},
        ${data.course_id ?? null},
        ${data.reply_to_id ?? null},
        ${data.attachment_url ?? null},
        ${data.attachment_type ?? null},
        ${data.attachment_size ?? null}
      )
      RETURNING
        id, conversation_id, sender_id, receiver_id,
        course_id, message, message_type,
        attachment_url, attachment_type, attachment_size,
        is_delivered, is_read, delivered_at, read_at,
        is_edited, edited_at, reply_to_id, reactions,
        is_reported, reported_at, created_at
    `
    logger.info({ id: rows[0].id }, 'Message created')
    return this.mapRow(rows[0])
  }

  // ── Update message ──────────────────────────────────────────────────────────
  async update(
    id: string,
    data: UpdateMessageInput
  ): Promise<Message | null> {
    const rows = await sql`
      UPDATE direct_messages
      SET
        message       = COALESCE(${data.message ?? null}, message),
        is_edited     = COALESCE(${data.is_edited ?? null}, is_edited),
        edited_at     = COALESCE(${data.edited_at ?? null}, edited_at),
        is_delivered  = COALESCE(${data.is_delivered ?? null}, is_delivered),
        delivered_at  = COALESCE(${data.delivered_at ?? null}, delivered_at),
        is_read       = COALESCE(${data.is_read ?? null}, is_read),
        read_at       = COALESCE(${data.read_at ?? null}, read_at),
        is_reported   = COALESCE(${data.is_reported ?? null}, is_reported),
        reported_at   = COALESCE(${data.reported_at ?? null}, reported_at)
      WHERE id = ${id}
      RETURNING
        id, conversation_id, sender_id, receiver_id,
        course_id, message, message_type,
        attachment_url, attachment_type, attachment_size,
        is_delivered, is_read, delivered_at, read_at,
        is_edited, edited_at, reply_to_id, reactions,
        is_reported, reported_at, created_at
    `
    if (rows.length === 0) return null
    return this.mapRow(rows[0])
  }

  // ── Soft delete ─────────────────────────────────────────────────────────────
  // direct_messages has no deletedAt column so we clear the message content
  // and mark it as deleted using is_reported flag as a soft delete marker
  // We will add a proper deleted_at column in a future migration if needed
  async softDelete(id: string): Promise<void> {
    await sql`
      UPDATE direct_messages
      SET
        message    = '[Message deleted]',
        is_edited  = true,
        edited_at  = now()
      WHERE id = ${id}
    `
    logger.info({ id }, 'Message soft deleted')
  }

  // ── Mark delivered ──────────────────────────────────────────────────────────
  async markDelivered(id: string): Promise<void> {
    await sql`
      UPDATE direct_messages
      SET
        is_delivered = true,
        delivered_at = now()
      WHERE id = ${id}
      AND is_delivered = false
    `
  }

  // ── Mark read ───────────────────────────────────────────────────────────────
  async markRead(id: string, userId: string): Promise<void> {
    await sql`
      UPDATE direct_messages
      SET
        is_read  = true,
        read_at  = now()
      WHERE id = ${id}
    `

    // Also update the read receipt
    await sql`
      UPDATE message_read_receipts
      SET
        is_read  = true,
        read_at  = now()
      WHERE message_id = ${id}
      AND user_id = ${userId}
    `
  }

  // ── Row mappers ─────────────────────────────────────────────────────────────
  private mapRow(row: Record<string, unknown>): Message {
    return {
      id:              row.id as string,
      conversation_id: row.conversation_id as string,
      sender_id:       row.sender_id as string,
      receiver_id:     row.receiver_id as string,
      course_id:       row.course_id as string | null,
      message:         row.message as string,
      message_type:    row.message_type as string,
      attachment_url:  row.attachment_url as string | null,
      attachment_type: row.attachment_type as string | null,
      attachment_size: row.attachment_size as number | null,
      is_delivered:    row.is_delivered as boolean,
      is_read:         row.is_read as boolean,
      delivered_at:    row.delivered_at
        ? new Date(row.delivered_at as string)
        : null,
      read_at:         row.read_at
        ? new Date(row.read_at as string)
        : null,
      is_edited:       row.is_edited as boolean,
      edited_at:       row.edited_at
        ? new Date(row.edited_at as string)
        : null,
      reply_to_id:     row.reply_to_id as string | null,
      reactions:       row.reactions as Record<string, unknown> | null,
      is_reported:     row.is_reported as boolean,
      reported_at:     row.reported_at
        ? new Date(row.reported_at as string)
        : null,
      created_at:      new Date(row.created_at as string),
    }
  }

  private mapRowWithSender(
    row: Record<string, unknown>
  ): MessageWithSender {
    return {
      ...this.mapRow(row),
      sender_username:   row.sender_username as string,
      sender_name:       row.sender_name as string,
      sender_image:      row.sender_image as string | null,
      recipient_has_read: row.recipient_has_read as boolean,
      recipient_read_at:  row.recipient_read_at
        ? new Date(row.recipient_read_at as string)
        : null,
    }
  }
}