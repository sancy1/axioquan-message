
 // tests/unit/conversation.service.test.ts 

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConversationService } from '../../src/modules/conversations/conversation.service.js'
import { NotFoundError } from '../../src/errors/NotFoundError.js'
import { HttpError } from '../../src/errors/HttpError.js'
import { ConversationType } from '../../src/constants/conversationTypes.js'
import { ParticipantRole } from '../../src/constants/roles.js'

// ── Mock data ─────────────────────────────────────────────────────────────────
const mockConversation = {
  id: 'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
  type: ConversationType.DIRECT,
  title: 'Question about course',
  course_id: null,
  created_by: '5bed31bb-959c-4a24-8f76-30ba4c80fe87',
  last_message_at: null,
  created_at: new Date(),
  updated_at: new Date(),
}

// ── Mock repositories ─────────────────────────────────────────────────────────
function mockConversationRepo(overrides = {}) {
  return {
    findById: vi.fn().mockResolvedValue(mockConversation),
    findByUserId: vi.fn().mockResolvedValue([]),
    countByUserId: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockResolvedValue(mockConversation),
    update: vi.fn().mockResolvedValue(mockConversation),
    delete: vi.fn().mockResolvedValue(undefined),
    existsBetweenUsers: vi.fn().mockResolvedValue(null),
    ...overrides,
  }
}

function mockParticipantRepo(overrides = {}) {
  return {
    findByConversationId: vi.fn().mockResolvedValue([]),
    findByUserId: vi.fn().mockResolvedValue([]),
    findOne: vi.fn().mockResolvedValue(null),
    isParticipant: vi.fn().mockResolvedValue(true),
    add: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    updateLastRead: vi.fn().mockResolvedValue(undefined),
    getRole: vi.fn().mockResolvedValue(null),
    ...overrides,
  }
}

describe('ConversationService', () => {
  let service: ConversationService

  beforeEach(() => {
    service = new ConversationService(
      mockConversationRepo(),
      mockParticipantRepo()
    )
  })

  describe('getConversations()', () => {
    it('returns conversations and meta', async () => {
      const convRepo = mockConversationRepo({
        findByUserId: vi.fn().mockResolvedValue([mockConversation]),
        countByUserId: vi.fn().mockResolvedValue(1),
      })
      service = new ConversationService(convRepo, mockParticipantRepo())

      const result = await service.getConversations('user-id', {})
      expect(result.conversations).toHaveLength(1)
      expect(result.meta.total).toBe(1)
    })

    it('returns empty array when no conversations', async () => {
      const result = await service.getConversations('user-id', {})
      expect(result.conversations).toHaveLength(0)
      expect(result.meta.total).toBe(0)
    })
  })

  describe('getConversationById()', () => {
    it('returns conversation when user is participant', async () => {
      const result = await service.getConversationById(
        'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
        '5bed31bb-959c-4a24-8f76-30ba4c80fe87'
      )
      expect(result.id).toBe('b3a90d51-8ac1-48ea-9d76-74130a62a8c0')
    })

    it('throws NotFoundError when conversation does not exist', async () => {
      const convRepo = mockConversationRepo({
        findById: vi.fn().mockResolvedValue(null),
      })
      service = new ConversationService(convRepo, mockParticipantRepo())

      await expect(
        service.getConversationById('non-existent', 'user-id')
      ).rejects.toThrow(NotFoundError)
    })

    it('throws NotFoundError when user is not participant', async () => {
      const partRepo = mockParticipantRepo({
        isParticipant: vi.fn().mockResolvedValue(false),
      })
      service = new ConversationService(mockConversationRepo(), partRepo)

      await expect(
        service.getConversationById('conv-id', 'non-participant-id')
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('createConversation()', () => {
    it('creates a new conversation', async () => {
      const result = await service.createConversation(
        {
          type: ConversationType.DIRECT,
          participantIds: ['18477825-b6b4-42ff-8367-b5e9c1343989'],
        },
        '5bed31bb-959c-4a24-8f76-30ba4c80fe87'
      )
      expect(result.id).toBe('b3a90d51-8ac1-48ea-9d76-74130a62a8c0')
    })

    it('returns existing conversation if direct chat already exists', async () => {
      const convRepo = mockConversationRepo({
        existsBetweenUsers: vi.fn().mockResolvedValue(mockConversation),
      })
      service = new ConversationService(convRepo, mockParticipantRepo())

      const result = await service.createConversation(
        {
          type: ConversationType.DIRECT,
          participantIds: ['18477825-b6b4-42ff-8367-b5e9c1343989'],
        },
        '5bed31bb-959c-4a24-8f76-30ba4c80fe87'
      )
      expect(result.id).toBe(mockConversation.id)
    })

    it('adds creator and participants after creation', async () => {
      const partRepo = mockParticipantRepo()
      service = new ConversationService(mockConversationRepo(), partRepo)

      await service.createConversation(
        {
          type: ConversationType.DIRECT,
          participantIds: ['18477825-b6b4-42ff-8367-b5e9c1343989'],
        },
        '5bed31bb-959c-4a24-8f76-30ba4c80fe87'
      )
      expect(partRepo.add).toHaveBeenCalledTimes(2)
    })
  })

  describe('updateConversation()', () => {
    it('updates title when user is creator', async () => {
      const result = await service.updateConversation(
        'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
        { title: 'New Title' },
        '5bed31bb-959c-4a24-8f76-30ba4c80fe87'
      )
      expect(result).toBeDefined()
    })

    it('throws 403 when user is not creator', async () => {
      await expect(
        service.updateConversation(
          'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
          { title: 'New Title' },
          'different-user-id'
        )
      ).rejects.toThrow(HttpError)
    })

    it('throws NotFoundError when conversation does not exist', async () => {
      const convRepo = mockConversationRepo({
        findById: vi.fn().mockResolvedValue(null),
      })
      service = new ConversationService(convRepo, mockParticipantRepo())

      await expect(
        service.updateConversation('non-existent', { title: 'Title' }, 'user-id')
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('deleteConversation()', () => {
    it('deletes when user is creator', async () => {
      await expect(
        service.deleteConversation(
          'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
          '5bed31bb-959c-4a24-8f76-30ba4c80fe87'
        )
      ).resolves.not.toThrow()
    })

    it('throws 403 when user is not creator', async () => {
      await expect(
        service.deleteConversation(
          'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
          'different-user-id'
        )
      ).rejects.toThrow(HttpError)
    })

    it('throws NotFoundError when conversation does not exist', async () => {
      const convRepo = mockConversationRepo({
        findById: vi.fn().mockResolvedValue(null),
      })
      service = new ConversationService(convRepo, mockParticipantRepo())

      await expect(
        service.deleteConversation('non-existent', 'user-id')
      ).rejects.toThrow(NotFoundError)
    })
  })
})
