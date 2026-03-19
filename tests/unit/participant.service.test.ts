
// tests/unit/participant.service.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ParticipantService } from '../../src/modules/participants/participant.service.js'
import { NotFoundError } from '../../src/errors/NotFoundError.js'
import { HttpError } from '../../src/errors/HttpError.js'
import { ParticipantRole } from '../../src/constants/roles.js'
import { ConversationType } from '../../src/constants/conversationTypes.js'

// ── Mock data ─────────────────────────────────────────────────────────────────
const mockConversation = {
  id:              'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
  type:            ConversationType.DIRECT,
  title:           null,
  course_id:       null,
  created_by:      '5bed31bb-959c-4a24-8f76-30ba4c80fe87',
  last_message_at: null,
  created_at:      new Date(),
  updated_at:      new Date(),
}

const mockParticipantWithUser = {
  id:              'part-1',
  conversation_id: 'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
  user_id:         '18477825-b6b4-42ff-8367-b5e9c1343989',
  role:            ParticipantRole.INSTRUCTOR,
  joined_at:       new Date(),
  last_read_at:    null,
  username:        'sancy1',
  name:            'Alexander Sanchez',
  image:           null,
}

// ── Mock repo factories ───────────────────────────────────────────────────────
function mockParticipantRepo(overrides = {}) {
  return {
    findByConversationId: vi.fn().mockResolvedValue([mockParticipantWithUser]),
    findByUserId:         vi.fn().mockResolvedValue([]),
    findOne:              vi.fn().mockResolvedValue(null),
    isParticipant:        vi.fn().mockResolvedValue(true),
    add:                  vi.fn().mockResolvedValue(undefined),
    remove:               vi.fn().mockResolvedValue(undefined),
    updateLastRead:       vi.fn().mockResolvedValue(undefined),
    getRole:              vi.fn().mockResolvedValue(ParticipantRole.INSTRUCTOR),
    ...overrides,
  }
}

function mockConversationRepo(overrides = {}) {
  return {
    findById:           vi.fn().mockResolvedValue(mockConversation),
    findByUserId:       vi.fn().mockResolvedValue([]),
    countByUserId:      vi.fn().mockResolvedValue(0),
    create:             vi.fn().mockResolvedValue(mockConversation),
    update:             vi.fn().mockResolvedValue(mockConversation),
    delete:             vi.fn().mockResolvedValue(undefined),
    existsBetweenUsers: vi.fn().mockResolvedValue(null),
    ...overrides,
  }
}

describe('ParticipantService', () => {
  let service: ParticipantService

  beforeEach(() => {
    service = new ParticipantService(
      mockParticipantRepo(),
      mockConversationRepo()
    )
    vi.clearAllMocks()
  })

  // ── getParticipants() ───────────────────────────────────────────────────────
  describe('getParticipants()', () => {
    it('returns participants for valid participant', async () => {
      const result = await service.getParticipants(
        'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
        '5bed31bb-959c-4a24-8f76-30ba4c80fe87'
      )
      expect(result).toHaveLength(1)
      expect(result[0].username).toBe('sancy1')
    })

    it('throws NotFoundError when conversation does not exist', async () => {
      const convRepo = mockConversationRepo({
        findById: vi.fn().mockResolvedValue(null),
      })
      service = new ParticipantService(mockParticipantRepo(), convRepo)

      await expect(
        service.getParticipants('non-existent', 'user-id')
      ).rejects.toThrow(NotFoundError)
    })

    it('throws 403 when user is not a participant', async () => {
      const partRepo = mockParticipantRepo({
        isParticipant: vi.fn().mockResolvedValue(false),
      })
      service = new ParticipantService(partRepo, mockConversationRepo())

      await expect(
        service.getParticipants('conv-id', 'non-participant')
      ).rejects.toThrow(HttpError)
    })
  })

  // ── addParticipant() ────────────────────────────────────────────────────────
  describe('addParticipant()', () => {
    it('adds participant when instructor requests', async () => {
      const partRepo = mockParticipantRepo({
        isParticipant: vi.fn().mockResolvedValue(false), // new user not yet a participant
        getRole: vi.fn().mockResolvedValue(ParticipantRole.INSTRUCTOR),
        findByConversationId: vi.fn().mockResolvedValue([
          { ...mockParticipantWithUser, user_id: 'new-user-id' },
        ]),
      })
      service = new ParticipantService(partRepo, mockConversationRepo())

      const result = await service.addParticipant(
        'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
        { userId: 'new-user-id', role: ParticipantRole.STUDENT },
        '18477825-b6b4-42ff-8367-b5e9c1343989'
      )
      expect(result).toBeDefined()
      expect(result.user_id).toBe('new-user-id')
    })

    it('throws 403 when student tries to add participant', async () => {
      const partRepo = mockParticipantRepo({
        getRole: vi.fn().mockResolvedValue(ParticipantRole.STUDENT),
      })
      service = new ParticipantService(partRepo, mockConversationRepo())

      await expect(
        service.addParticipant(
          'conv-id',
          { userId: 'new-user', role: ParticipantRole.STUDENT },
          'student-id'
        )
      ).rejects.toThrow(HttpError)
    })

    it('throws 409 when user is already a participant', async () => {
      const partRepo = mockParticipantRepo({
        isParticipant: vi.fn().mockResolvedValue(true),
        getRole:       vi.fn().mockResolvedValue(ParticipantRole.INSTRUCTOR),
      })
      service = new ParticipantService(partRepo, mockConversationRepo())

      await expect(
        service.addParticipant(
          'conv-id',
          { userId: 'existing-user', role: ParticipantRole.STUDENT },
          'instructor-id'
        )
      ).rejects.toThrow(HttpError)
    })
  })

  // ── removeParticipant() ─────────────────────────────────────────────────────
  describe('removeParticipant()', () => {
    it('removes participant when instructor requests', async () => {
      const partRepo = mockParticipantRepo({
        isParticipant: vi.fn().mockResolvedValue(true),
        getRole:       vi.fn().mockResolvedValue(ParticipantRole.INSTRUCTOR),
      })
      service = new ParticipantService(partRepo, mockConversationRepo())

      await expect(
        service.removeParticipant(
          'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
          '17c5e646-112c-45b0-bdd8-8d6bccd705c1',
          '18477825-b6b4-42ff-8367-b5e9c1343989'
        )
      ).resolves.not.toThrow()
    })

    it('throws 400 when trying to remove conversation creator', async () => {
      await expect(
        service.removeParticipant(
          'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
          '5bed31bb-959c-4a24-8f76-30ba4c80fe87', // this is mockConversation.created_by
          '18477825-b6b4-42ff-8367-b5e9c1343989'
        )
      ).rejects.toThrow(HttpError)
    })

    it('throws 403 when student tries to remove participant', async () => {
      const partRepo = mockParticipantRepo({
        getRole: vi.fn().mockResolvedValue(ParticipantRole.STUDENT),
      })
      service = new ParticipantService(partRepo, mockConversationRepo())

      await expect(
        service.removeParticipant('conv-id', 'user-to-remove', 'student-id')
      ).rejects.toThrow(HttpError)
    })

    it('throws NotFoundError when conversation not found', async () => {
      const convRepo = mockConversationRepo({
        findById: vi.fn().mockResolvedValue(null),
      })
      service = new ParticipantService(mockParticipantRepo(), convRepo)

      await expect(
        service.removeParticipant('non-existent', 'user-id', 'requester-id')
      ).rejects.toThrow(NotFoundError)
    })
  })
})