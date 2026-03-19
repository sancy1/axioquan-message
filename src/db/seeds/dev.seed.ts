
// src/db/seeds/dev.seed.ts

import { sql } from '../client.js'
import { logger } from '../../utils/logger.js'

// ── Real user IDs from axioquan NeonDB ────────────────────────────────────────
const USERS = {
  student:    '5bed31bb-959c-4a24-8f76-30ba4c80fe87',    // williams1
  instructor: '18477825-b6b4-42ff-8367-b5e9c1343989',   // sancy1
  admin:      'f3b44460-3472-42c2-af38-cfd10a6dd739',    // san_ceey
}

async function seed(): Promise<void> {
  logger.info('Starting dev seed...')

  try {
    // ── 1. Create test conversation ─────────────────────────────────────────
    const conversations = await sql`
      INSERT INTO conversations (type, title, created_by)
      VALUES ('direct', 'Test conversation — seed data', ${USERS.student})
      RETURNING id
    `
    const conversationId = conversations[0].id as string
    logger.info({ conversationId }, 'Conversation created')

    // ── 2. Add participants ─────────────────────────────────────────────────
    await sql`
      INSERT INTO conversation_participants (conversation_id, user_id, role)
      VALUES
        (${conversationId}, ${USERS.student},    'student'),
        (${conversationId}, ${USERS.instructor}, 'instructor')
      ON CONFLICT (conversation_id, user_id) DO NOTHING
    `
    logger.info('Participants added')

    // ── 3. Send test messages ───────────────────────────────────────────────
    const message1 = await sql`
      INSERT INTO direct_messages (
        conversation_id, sender_id, receiver_id, message, message_type
      )
      VALUES (
        ${conversationId},
        ${USERS.student},
        ${USERS.instructor},
        'Hello instructor, I have a question about the course.',
        'text'
      )
      RETURNING id, created_at
    `
    logger.info({ messageId: message1[0].id }, 'Message 1 created')

    const message2 = await sql`
      INSERT INTO direct_messages (
        conversation_id, sender_id, receiver_id, message, message_type
      )
      VALUES (
        ${conversationId},
        ${USERS.instructor},
        ${USERS.student},
        'Of course! What would you like to know?',
        'text'
      )
      RETURNING id, created_at
    `
    logger.info({ messageId: message2[0].id }, 'Message 2 created')

    // ── 4. Update conversation last_message_at ──────────────────────────────
    await sql`
      UPDATE conversations
      SET last_message_at = ${message2[0].created_at as Date}
      WHERE id = ${conversationId}
    `

    // ── 5. Create read receipt for student on message2 ──────────────────────
    await sql`
      INSERT INTO message_read_receipts (
        message_id, user_id, conversation_id
      )
      VALUES (
        ${message2[0].id as string},
        ${USERS.student},
        ${conversationId}
      )
      ON CONFLICT (message_id, user_id) DO NOTHING
    `

    // ── 6. Create notification for student ──────────────────────────────────
    await sql`
      INSERT INTO message_notifications (
        user_id, conversation_id, message_id, sender_id
      )
      VALUES (
        ${USERS.student},
        ${conversationId},
        ${message2[0].id as string},
        ${USERS.instructor}
      )
      ON CONFLICT (user_id, message_id) DO NOTHING
    `

    logger.info('Dev seed completed successfully')
    logger.info({ conversationId }, 'Test conversation ID')

  } catch (error) {
    logger.error({ err: error }, 'Dev seed failed')
    process.exit(1)
  }
}

seed().then(() => process.exit(0))