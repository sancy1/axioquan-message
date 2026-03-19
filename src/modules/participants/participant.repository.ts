
// src/modules/participants/participant.repository.ts

import { sql } from '../../db/client.js'
import type { IParticipantRepository } from '../../interfaces/IParticipantRepository.js'
import type {
  Participant,
  ParticipantWithUser,
  AddParticipantInput,
} from '../../models/participant.model.js'
import type { ParticipantRole } from '../../constants/roles.js'

export class ParticipantRepository implements IParticipantRepository {

  async findByConversationId(
    conversationId: string
  ): Promise<ParticipantWithUser[]> {
    const rows = await sql`
      SELECT
        cp.id, cp.conversation_id, cp.user_id,
        cp.role, cp.joined_at, cp.last_read_at,
        u.username, u.name, u.image
      FROM conversation_participants cp
      JOIN users u ON u.id = cp.user_id
      WHERE cp.conversation_id = ${conversationId}
      ORDER BY cp.joined_at ASC
    `
    return rows.map((row) => this.mapRowWithUser(row))
  }

  async findByUserId(userId: string): Promise<Participant[]> {
    const rows = await sql`
      SELECT id, conversation_id, user_id, role, joined_at, last_read_at
      FROM conversation_participants
      WHERE user_id = ${userId}
    `
    return rows.map((row) => this.mapRow(row))
  }

  async findOne(
    conversationId: string,
    userId: string
  ): Promise<Participant | null> {
    const rows = await sql`
      SELECT id, conversation_id, user_id, role, joined_at, last_read_at
      FROM conversation_participants
      WHERE conversation_id = ${conversationId}
      AND user_id = ${userId}
      LIMIT 1
    `
    if (rows.length === 0) return null
    return this.mapRow(rows[0])
  }

  async isParticipant(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    const rows = await sql`
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = ${conversationId}
      AND user_id = ${userId}
      LIMIT 1
    `
    return rows.length > 0
  }

  async add(data: AddParticipantInput): Promise<Participant> {
    const rows = await sql`
      INSERT INTO conversation_participants (
        conversation_id, user_id, role
      )
      VALUES (
        ${data.conversation_id},
        ${data.user_id},
        ${data.role}
      )
      ON CONFLICT (conversation_id, user_id) DO NOTHING
      RETURNING id, conversation_id, user_id, role, joined_at, last_read_at
    `
    return this.mapRow(rows[0])
  }

  async remove(conversationId: string, userId: string): Promise<void> {
    await sql`
      DELETE FROM conversation_participants
      WHERE conversation_id = ${conversationId}
      AND user_id = ${userId}
    `
  }

  async updateLastRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    await sql`
      UPDATE conversation_participants
      SET last_read_at = now()
      WHERE conversation_id = ${conversationId}
      AND user_id = ${userId}
    `
  }

  async getRole(
    conversationId: string,
    userId: string
  ): Promise<ParticipantRole | null> {
    const rows = await sql`
      SELECT role FROM conversation_participants
      WHERE conversation_id = ${conversationId}
      AND user_id = ${userId}
      LIMIT 1
    `
    if (rows.length === 0) return null
    return rows[0].role as ParticipantRole
  }

  // ── Row mappers ─────────────────────────────────────────────────────────────
  private mapRow(row: Record<string, unknown>): Participant {
    return {
      id:              row.id as string,
      conversation_id: row.conversation_id as string,
      user_id:         row.user_id as string,
      role:            row.role as Participant['role'],
      joined_at:       new Date(row.joined_at as string),
      last_read_at:    row.last_read_at
        ? new Date(row.last_read_at as string)
        : null,
    }
  }

  private mapRowWithUser(row: Record<string, unknown>): ParticipantWithUser {
    return {
      ...this.mapRow(row),
      username: row.username as string,
      name:     row.name as string,
      image:    row.image as string | null,
    }
  }
}