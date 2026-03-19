
// tests/unit/conversation.repository.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConversationRepository } from '../../src/modules/conversations/conversation.repository.js'
import { ConversationType } from '../../src/constants/conversationTypes.js'

// ── Mock the sql client ───────────────────────────────────────────────────────
vi.mock('../../src/db/client.js', () => ({
  sql: vi.fn(),
}))

import { sql } from '../../src/db/client.js'

const mockSql = vi.mocked(sql)

// ── Mock data ─────────────────────────────────────────────────────────────────
const mockConversationRow = {
  id:              'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
  type:            'direct',
  title:           'Question about course material',
  course_id:       null,
  created_by:      '5bed31bb-959c-4a24-8f76-30ba4c80fe87',
  last_message_at: '2026-03-14 17:54:05.376361+00',
  created_at:      '2026-03-14 17:51:02.597793+00',
  updated_at:      '2026-03-14 17:54:05.376361+00',
}

const mockConversationWithParticipantRow = {
  ...mockConversationRow,
  my_role:                    'student',
  last_read_at:               null,
  other_participant_id:       '18477825-b6b4-42ff-8367-b5e9c1343989',
  other_participant_username: 'sancy1',
  other_participant_name:     'Alexander Sanchez',
  other_participant_image:    null,
  last_message_preview:       'Hello instructor!',
}

describe('ConversationRepository', () => {
  let repo: ConversationRepository

  beforeEach(() => {
    repo = new ConversationRepository()
    vi.clearAllMocks()
  })

  describe('findById()', () => {
    it('returns conversation when found', async () => {
      mockSql.mockResolvedValueOnce([mockConversationRow])
      const result = await repo.findById('b3a90d51-8ac1-48ea-9d76-74130a62a8c0')
      expect(result).not.toBeNull()
      expect(result?.id).toBe('b3a90d51-8ac1-48ea-9d76-74130a62a8c0')
      expect(result?.type).toBe(ConversationType.DIRECT)
    })

    it('returns null when not found', async () => {
      mockSql.mockResolvedValueOnce([])
      const result = await repo.findById('non-existent-id')
      expect(result).toBeNull()
    })

    it('maps dates correctly', async () => {
      mockSql.mockResolvedValueOnce([mockConversationRow])
      const result = await repo.findById('b3a90d51-8ac1-48ea-9d76-74130a62a8c0')
      expect(result?.created_at).toBeInstanceOf(Date)
      expect(result?.updated_at).toBeInstanceOf(Date)
    })
  })

  describe('findByUserId()', () => {
    it('returns array of conversations with participant info', async () => {
      mockSql.mockResolvedValueOnce([mockConversationWithParticipantRow])
      const result = await repo.findByUserId(
        '5bed31bb-959c-4a24-8f76-30ba4c80fe87',
        { page: 1, limit: 20 }
      )
      expect(result).toHaveLength(1)
      expect(result[0].other_participant_username).toBe('sancy1')
      expect(result[0].my_role).toBe('student')
    })

    it('returns empty array when no conversations', async () => {
      mockSql.mockResolvedValueOnce([])
      const result = await repo.findByUserId('unknown-user', { page: 1, limit: 20 })
      expect(result).toHaveLength(0)
    })
  })

  describe('countByUserId()', () => {
    it('returns count as number', async () => {
      mockSql.mockResolvedValueOnce([{ count: '3' }])
      const result = await repo.countByUserId('user-id')
      expect(result).toBe(3)
      expect(typeof result).toBe('number')
    })

    it('returns 0 when no conversations', async () => {
      mockSql.mockResolvedValueOnce([{ count: '0' }])
      const result = await repo.countByUserId('user-id')
      expect(result).toBe(0)
    })
  })

  describe('create()', () => {
    it('returns created conversation', async () => {
      mockSql.mockResolvedValueOnce([mockConversationRow])
      const result = await repo.create({
        type: ConversationType.DIRECT,
        created_by: '5bed31bb-959c-4a24-8f76-30ba4c80fe87',
        participantIds: ['18477825-b6b4-42ff-8367-b5e9c1343989'],
      })
      expect(result.id).toBe('b3a90d51-8ac1-48ea-9d76-74130a62a8c0')
      expect(result.type).toBe(ConversationType.DIRECT)
    })

    
    it('maps null fields correctly', async () => {
        const nullFieldsRow = {
            ...mockConversationRow,
            title: null,
            course_id: null,
            last_message_at: null,
        }
        mockSql.mockResolvedValueOnce([nullFieldsRow])
        const result = await repo.create({
            type: ConversationType.DIRECT,
            created_by: 'user-id',
            participantIds: ['other-user-id'],
        })
        expect(result.title).toBeNull()
        expect(result.course_id).toBeNull()
        expect(result.last_message_at).toBeNull()
        })

  })

  describe('update()', () => {
    it('returns updated conversation', async () => {
      const updatedRow = { ...mockConversationRow, title: 'New Title' }
      mockSql.mockResolvedValueOnce([updatedRow])
      const result = await repo.update(
        'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
        { title: 'New Title' }
      )
      expect(result?.title).toBe('New Title')
    })

    it('returns null when conversation not found', async () => {
      mockSql.mockResolvedValueOnce([])
      const result = await repo.update('non-existent', { title: 'Title' })
      expect(result).toBeNull()
    })
  })

  describe('existsBetweenUsers()', () => {
    it('returns conversation when exists', async () => {
      mockSql.mockResolvedValueOnce([mockConversationRow])
      const result = await repo.existsBetweenUsers('userA', 'userB')
      expect(result).not.toBeNull()
      expect(result?.id).toBe('b3a90d51-8ac1-48ea-9d76-74130a62a8c0')
    })

    it('returns null when no conversation exists', async () => {
      mockSql.mockResolvedValueOnce([])
      const result = await repo.existsBetweenUsers('userA', 'userB')
      expect(result).toBeNull()
    })
  })
})