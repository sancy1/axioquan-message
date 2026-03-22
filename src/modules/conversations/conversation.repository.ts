
// src/modules/conversations/conversation.repository.ts

import { sql } from '../../db/client.js'
import type { IConversationRepository } from '../../interfaces/IConversationRepository.js'
import type {
  Conversation,
  ConversationWithParticipant,
  CreateConversationInput,
  UpdateConversationInput,
} from '../../models/conversation.model.js'
import type { PaginationParams } from '../../utils/pagination.js'
import { logger } from '../../utils/logger.js'

export class ConversationRepository implements IConversationRepository {

  // ── Find by ID ──────────────────────────────────────────────────────────────
  async findById(id: string): Promise<Conversation | null> {
    const rows = await sql`
      SELECT
        id, type, title, course_id, created_by,
        last_message_at, created_at, updated_at
      FROM conversations
      WHERE id = ${id}
      LIMIT 1
    `
    if (rows.length === 0) return null
    return this.mapRow(rows[0])
  }

  // ── Find all conversations for a user (inbox) ───────────────────────────────
  // async findByUserId(
  //   userId: string,
  //   pagination: PaginationParams
  // ): Promise<ConversationWithParticipant[]> {
  //   const { limit, page } = pagination
  //   const offset = (page - 1) * limit

  //   const rows = await sql`
  //     SELECT
  //       c.id,
  //       c.type,
  //       c.title,
  //       c.course_id,
  //       c.created_by,
  //       c.last_message_at,
  //       c.created_at,
  //       c.updated_at,
  //       cp.role           AS my_role,
  //       cp.last_read_at,
  //       cp2.user_id       AS other_participant_id,
  //       u.username        AS other_participant_username,
  //       u.name            AS other_participant_name,
  //       u.image           AS other_participant_image,
  //       dm.message        AS last_message_preview
  //     FROM conversations c
  //     JOIN conversation_participants cp
  //       ON cp.conversation_id = c.id
  //       AND cp.user_id = ${userId}
  //     JOIN conversation_participants cp2
  //       ON cp2.conversation_id = c.id
  //       AND cp2.user_id != ${userId}
  //     JOIN users u
  //       ON u.id = cp2.user_id
  //     LEFT JOIN direct_messages dm
  //       ON dm.conversation_id = c.id
  //       AND dm.created_at = c.last_message_at
  //     ORDER BY c.last_message_at DESC NULLS LAST
  //     LIMIT ${limit} OFFSET ${offset}
  //   `
  //   return rows.map((row) => this.mapRowWithParticipant(row))
  // }



  async findByUserId(
  userId: string,
  pagination: PaginationParams
): Promise<ConversationWithParticipant[]> {
  const { limit, page } = pagination
  const offset = (page - 1) * limit

  const rows = await sql`
    SELECT DISTINCT ON (c.id)
      c.id,
      c.type,
      c.title,
      c.course_id,
      c.created_by,
      c.last_message_at,
      c.created_at,
      c.updated_at,
      cp.role           AS my_role,
      cp.last_read_at,
      cp2.user_id       AS other_participant_id,
      u.username        AS other_participant_username,
      u.name            AS other_participant_name,
      u.image           AS other_participant_image,
      dm.message        AS last_message_preview
    FROM conversations c
    JOIN conversation_participants cp
      ON cp.conversation_id = c.id
      AND cp.user_id = ${userId}
    JOIN conversation_participants cp2
      ON cp2.conversation_id = c.id
      AND cp2.user_id != ${userId}
    JOIN users u
      ON u.id = cp2.user_id
    LEFT JOIN direct_messages dm
      ON dm.conversation_id = c.id
      AND dm.created_at = (
        SELECT MAX(created_at)
        FROM direct_messages
        WHERE conversation_id = c.id
      )
    ORDER BY c.id, c.last_message_at DESC NULLS LAST
    LIMIT ${limit} OFFSET ${offset}
  `
  return rows.map((row) => this.mapRowWithParticipant(row))
}


  // ── Count conversations for a user ─────────────────────────────────────────
  async countByUserId(userId: string): Promise<number> {
    const rows = await sql`
      SELECT COUNT(*) AS count
      FROM conversation_participants
      WHERE user_id = ${userId}
    `
    return parseInt(rows[0].count as string, 10)
  }

  // ── Create conversation ─────────────────────────────────────────────────────
  async create(data: CreateConversationInput): Promise<Conversation> {
    const rows = await sql`
      INSERT INTO conversations (
        type, title, course_id, created_by
      )
      VALUES (
        ${data.type},
        ${data.title ?? null},
        ${data.course_id ?? null},
        ${data.created_by}
      )
      RETURNING
        id, type, title, course_id, created_by,
        last_message_at, created_at, updated_at
    `
    logger.info({ id: rows[0].id }, 'Conversation created')
    return this.mapRow(rows[0])
  }

  // ── Update conversation ─────────────────────────────────────────────────────
  async update(
    id: string,
    data: UpdateConversationInput
  ): Promise<Conversation | null> {
    const rows = await sql`
      UPDATE conversations
      SET
        title           = COALESCE(${data.title ?? null}, title),
        last_message_at = COALESCE(
          ${data.last_message_at ?? null},
          last_message_at
        ),
        updated_at      = now()
      WHERE id = ${id}
      RETURNING
        id, type, title, course_id, created_by,
        last_message_at, created_at, updated_at
    `
    if (rows.length === 0) return null
    return this.mapRow(rows[0])
  }

  // ── Delete conversation ─────────────────────────────────────────────────────
  async delete(id: string): Promise<void> {
    await sql`
      DELETE FROM conversations
      WHERE id = ${id}
    `
    logger.info({ id }, 'Conversation deleted')
  }

  // ── Check if conversation exists between two users ──────────────────────────
  async existsBetweenUsers(
    userIdA: string,
    userIdB: string
  ): Promise<Conversation | null> {
    const rows = await sql`
      SELECT c.id, c.type, c.title, c.course_id,
             c.created_by, c.last_message_at,
             c.created_at, c.updated_at
      FROM conversations c
      JOIN conversation_participants cpA
        ON cpA.conversation_id = c.id
        AND cpA.user_id = ${userIdA}
      JOIN conversation_participants cpB
        ON cpB.conversation_id = c.id
        AND cpB.user_id = ${userIdB}
      WHERE c.type = 'direct'
      LIMIT 1
    `
    if (rows.length === 0) return null
    return this.mapRow(rows[0])
  }

  // ── Row mappers ─────────────────────────────────────────────────────────────
  private mapRow(row: Record<string, unknown>): Conversation {
    return {
      id:              row.id as string,
      type:            row.type as Conversation['type'],
      title:           row.title as string | null,
      course_id:       row.course_id as string | null,
      created_by:      row.created_by as string,
      last_message_at: row.last_message_at
        ? new Date(row.last_message_at as string)
        : null,
      created_at:      new Date(row.created_at as string),
      updated_at:      new Date(row.updated_at as string),
    }
  }

  private mapRowWithParticipant(
    row: Record<string, unknown>
  ): ConversationWithParticipant {
    return {
      ...this.mapRow(row),
      my_role:                    row.my_role as string,
      last_read_at:               row.last_read_at
        ? new Date(row.last_read_at as string)
        : null,
      other_participant_id:       row.other_participant_id as string,
      other_participant_username: row.other_participant_username as string,
      other_participant_name:     row.other_participant_name as string,
      other_participant_image:    row.other_participant_image as string | null,
      last_message_preview:       row.last_message_preview as string | null,
    }
  }
}