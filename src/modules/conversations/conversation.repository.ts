
// // src/modules/conversations/conversation.repository.ts

// import { sql } from '../../db/client.js'
// import type { IConversationRepository } from '../../interfaces/IConversationRepository.js'
// import type {
//   Conversation,
//   ConversationWithParticipant,
//   CreateConversationInput,
//   UpdateConversationInput,
// } from '../../models/conversation.model.js'
// import type { PaginationParams } from '../../utils/pagination.js'
// import { logger } from '../../utils/logger.js'

// export class ConversationRepository implements IConversationRepository {

//   // ── Find by ID ──────────────────────────────────────────────────────────────
//   async findById(id: string): Promise<Conversation | null> {
//     const rows = await sql`
//       SELECT
//         id, type, title, course_id, created_by,
//         last_message_at, created_at, updated_at
//       FROM conversations
//       WHERE id = ${id}
//       LIMIT 1
//     `
//     if (rows.length === 0) return null
//     return this.mapRow(rows[0])
//   }

//   // ── Find all conversations for a user (inbox) ───────────────────────────────
//   // async findByUserId(
//   //   userId: string,
//   //   pagination: PaginationParams
//   // ): Promise<ConversationWithParticipant[]> {
//   //   const { limit, page } = pagination
//   //   const offset = (page - 1) * limit

//   //   const rows = await sql`
//   //     SELECT
//   //       c.id,
//   //       c.type,
//   //       c.title,
//   //       c.course_id,
//   //       c.created_by,
//   //       c.last_message_at,
//   //       c.created_at,
//   //       c.updated_at,
//   //       cp.role           AS my_role,
//   //       cp.last_read_at,
//   //       cp2.user_id       AS other_participant_id,
//   //       u.username        AS other_participant_username,
//   //       u.name            AS other_participant_name,
//   //       u.image           AS other_participant_image,
//   //       dm.message        AS last_message_preview
//   //     FROM conversations c
//   //     JOIN conversation_participants cp
//   //       ON cp.conversation_id = c.id
//   //       AND cp.user_id = ${userId}
//   //     JOIN conversation_participants cp2
//   //       ON cp2.conversation_id = c.id
//   //       AND cp2.user_id != ${userId}
//   //     JOIN users u
//   //       ON u.id = cp2.user_id
//   //     LEFT JOIN direct_messages dm
//   //       ON dm.conversation_id = c.id
//   //       AND dm.created_at = c.last_message_at
//   //     ORDER BY c.last_message_at DESC NULLS LAST
//   //     LIMIT ${limit} OFFSET ${offset}
//   //   `
//   //   return rows.map((row) => this.mapRowWithParticipant(row))
//   // }



//  async findByUserId(
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
//       cp.role        AS my_role,
//       cp.last_read_at,
//       other_p.user_id       AS other_participant_id,
//       other_u.username      AS other_participant_username,
//       other_u.name          AS other_participant_name,
//       other_u.image         AS other_participant_image,
//       preview.message       AS last_message_preview
//     FROM conversations c

//     -- My participation record
//     JOIN conversation_participants cp
//       ON cp.conversation_id = c.id
//       AND cp.user_id = ${userId}

//     -- One other participant (the first one that is not me)
//     -- Using DISTINCT ON equivalent via subquery to avoid duplicates
//     JOIN LATERAL (
//       SELECT cp3.user_id
//       FROM conversation_participants cp3
//       WHERE cp3.conversation_id = c.id
//         AND cp3.user_id != ${userId}
//       ORDER BY cp3.joined_at ASC
//       LIMIT 1
//     ) other_p ON true

//     -- That participant's profile
//     JOIN users other_u
//       ON other_u.id = other_p.user_id

//     -- Last message preview via subquery on MAX created_at
//     LEFT JOIN LATERAL (
//       SELECT dm.message
//       FROM direct_messages dm
//       WHERE dm.conversation_id = c.id
//         AND dm.deleted_at IS NULL
//       ORDER BY dm.created_at DESC
//       LIMIT 1
//     ) preview ON true

//     ORDER BY c.last_message_at DESC NULLS LAST
//     LIMIT ${limit} OFFSET ${offset}
//   `

//   return rows.map((row) => this.mapRowWithParticipant(row))
// }


//   // ── Count conversations for a user ─────────────────────────────────────────
//   async countByUserId(userId: string): Promise<number> {
//     const rows = await sql`
//       SELECT COUNT(*) AS count
//       FROM conversation_participants
//       WHERE user_id = ${userId}
//     `
//     return parseInt(rows[0].count as string, 10)
//   }

//   // ── Create conversation ─────────────────────────────────────────────────────
//   async create(data: CreateConversationInput): Promise<Conversation> {
//     const rows = await sql`
//       INSERT INTO conversations (
//         type, title, course_id, created_by
//       )
//       VALUES (
//         ${data.type},
//         ${data.title ?? null},
//         ${data.course_id ?? null},
//         ${data.created_by}
//       )
//       RETURNING
//         id, type, title, course_id, created_by,
//         last_message_at, created_at, updated_at
//     `
//     logger.info({ id: rows[0].id }, 'Conversation created')
//     return this.mapRow(rows[0])
//   }

//   // ── Update conversation ─────────────────────────────────────────────────────
//   async update(
//     id: string,
//     data: UpdateConversationInput
//   ): Promise<Conversation | null> {
//     const rows = await sql`
//       UPDATE conversations
//       SET
//         title           = COALESCE(${data.title ?? null}, title),
//         last_message_at = COALESCE(
//           ${data.last_message_at ?? null},
//           last_message_at
//         ),
//         updated_at      = now()
//       WHERE id = ${id}
//       RETURNING
//         id, type, title, course_id, created_by,
//         last_message_at, created_at, updated_at
//     `
//     if (rows.length === 0) return null
//     return this.mapRow(rows[0])
//   }

//   // ── Delete conversation ─────────────────────────────────────────────────────
//   async delete(id: string): Promise<void> {
//     await sql`
//       DELETE FROM conversations
//       WHERE id = ${id}
//     `
//     logger.info({ id }, 'Conversation deleted')
//   }

//   // ── Check if conversation exists between two users ──────────────────────────
//   async existsBetweenUsers(
//     userIdA: string,
//     userIdB: string
//   ): Promise<Conversation | null> {
//     const rows = await sql`
//       SELECT c.id, c.type, c.title, c.course_id,
//              c.created_by, c.last_message_at,
//              c.created_at, c.updated_at
//       FROM conversations c
//       JOIN conversation_participants cpA
//         ON cpA.conversation_id = c.id
//         AND cpA.user_id = ${userIdA}
//       JOIN conversation_participants cpB
//         ON cpB.conversation_id = c.id
//         AND cpB.user_id = ${userIdB}
//       WHERE c.type = 'direct'
//       LIMIT 1
//     `
//     if (rows.length === 0) return null
//     return this.mapRow(rows[0])
//   }

//   // ── Row mappers ─────────────────────────────────────────────────────────────
//   private mapRow(row: Record<string, unknown>): Conversation {
//     return {
//       id:              row.id as string,
//       type:            row.type as Conversation['type'],
//       title:           row.title as string | null,
//       course_id:       row.course_id as string | null,
//       created_by:      row.created_by as string,
//       last_message_at: row.last_message_at
//         ? new Date(row.last_message_at as string)
//         : null,
//       created_at:      new Date(row.created_at as string),
//       updated_at:      new Date(row.updated_at as string),
//     }
//   }

//   private mapRowWithParticipant(
//     row: Record<string, unknown>
//   ): ConversationWithParticipant {
//     return {
//       ...this.mapRow(row),
//       my_role:                    row.my_role as string,
//       last_read_at:               row.last_read_at
//         ? new Date(row.last_read_at as string)
//         : null,
//       other_participant_id:       row.other_participant_id as string,
//       other_participant_username: row.other_participant_username as string,
//       other_participant_name:     row.other_participant_name as string,
//       other_participant_image:    row.other_participant_image as string | null,
//       last_message_preview:       row.last_message_preview as string | null,
//     }
//   }
// }


























// messag/src/modules/conversations/conversation.repository.ts
// FIXED: LATERAL subquery eliminates cross-join duplicates
// FIXED: countByUserId uses COUNT DISTINCT
// FIXED: last_message_preview uses ORDER BY DESC LIMIT 1

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
  async findByUserId(
  userId: string,
  pagination: PaginationParams
): Promise<ConversationWithParticipant[]> {
  const { limit, page } = pagination
  const offset = (page - 1) * limit

  const rows = await sql`
    SELECT
      c.id,
      c.type,
      c.title,
      c.course_id,
      c.created_by,
      c.last_message_at,
      c.created_at,
      c.updated_at,
      cp.role          AS my_role,
      cp.last_read_at,
      (
        SELECT cp2.user_id
        FROM conversation_participants cp2
        WHERE cp2.conversation_id = c.id
          AND cp2.user_id != ${userId}
        LIMIT 1
      ) AS other_participant_id,
      (
        SELECT u2.username
        FROM conversation_participants cp2
        JOIN users u2 ON u2.id = cp2.user_id
        WHERE cp2.conversation_id = c.id
          AND cp2.user_id != ${userId}
        LIMIT 1
      ) AS other_participant_username,
      (
        SELECT u2.name
        FROM conversation_participants cp2
        JOIN users u2 ON u2.id = cp2.user_id
        WHERE cp2.conversation_id = c.id
          AND cp2.user_id != ${userId}
        LIMIT 1
      ) AS other_participant_name,
      (
        SELECT u2.image
        FROM conversation_participants cp2
        JOIN users u2 ON u2.id = cp2.user_id
        WHERE cp2.conversation_id = c.id
          AND cp2.user_id != ${userId}
        LIMIT 1
      ) AS other_participant_image,
      
      (
        SELECT dm.message
        FROM direct_messages dm
        WHERE dm.conversation_id = c.id
        ORDER BY dm.created_at DESC
        LIMIT 1
      ) AS last_message_preview

    FROM conversations c
    JOIN conversation_participants cp
      ON cp.conversation_id = c.id
      AND cp.user_id = ${userId}
    ORDER BY c.last_message_at DESC NULLS LAST
    LIMIT ${limit} OFFSET ${offset}
  `

  return rows.map((row) => this.mapRowWithParticipant(row))
}


  // ── Count conversations for a user ──────────────────────────────────────────
  async countByUserId(userId: string): Promise<number> {
    const rows = await sql`
      SELECT COUNT(DISTINCT conversation_id) AS count
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