
// tests/unit/message.service.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MessageService } from '../../src/modules/messages/message.service.js'
import { NotFoundError } from '../../src/errors/NotFoundError.js'
import { HttpError } from '../../src/errors/HttpError.js'

// ── Mock event emitter ────────────────────────────────────────────────────────
vi.mock('../../src/events/eventEmitter.js', () => ({
  emitter: { emit: vi.fn(), on: vi.fn() },
}))

// ── Mock data ─────────────────────────────────────────────────────────────────
const mockMessage = {
  id:              '84e63a38-47ab-4865-a77d-4ee9d05ee1dd',
  conversation_id: 'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
  sender_id:       '5bed31bb-959c-4a24-8f76-30ba4c80fe87',
  receiver_id:     '18477825-b6b4-42ff-8367-b5e9c1343989',
  course_id:       null,
  message:         'Hello instructor!',
  message_type:    'text',
  attachment_url:  null,
  attachment_type: null,
  attachment_size: null,
  is_delivered:    false,
  is_read:         false,
  delivered_at:    null,
  read_at:         null,
  is_edited:       false,
  edited_at:       null,
  reply_to_id:     null,
  reactions:       null,
  is_reported:     false,
  reported_at:     null,
  created_at:      new Date(),
}

const mockConversation = {
  id:              'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
  type:            'direct' as const,
  title:           null,
  course_id:       null,
  created_by:      '5bed31bb-959c-4a24-8f76-30ba4c80fe87',
  last_message_at: null,
  created_at:      new Date(),
  updated_at:      new Date(),
}

const mockParticipants = [
  {
    id:              'part-1',
    conversation_id: 'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
    user_id:         '5bed31bb-959c-4a24-8f76-30ba4c80fe87',
    role:            'student' as const,
    joined_at:       new Date(),
    last_read_at:    null,
    username:        'williams1',
    name:            'John Williams',
    image:           null,
  },
  {
    id:              'part-2',
    conversation_id: 'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
    user_id:         '18477825-b6b4-42ff-8367-b5e9c1343989',
    role:            'instructor' as const,
    joined_at:       new Date(),
    last_read_at:    null,
    username:        'sancy1',
    name:            'Alexander Sanchez',
    image:           null,
  },
]

// ── Mock repo factories ───────────────────────────────────────────────────────
function mockMessageRepo(overrides = {}) {
  return {
    findById:               vi.fn().mockResolvedValue(mockMessage),
    findByConversationId:   vi.fn().mockResolvedValue([]),
    countByConversationId:  vi.fn().mockResolvedValue(0),
    create:                 vi.fn().mockResolvedValue(mockMessage),
    update:                 vi.fn().mockResolvedValue(mockMessage),
    softDelete:             vi.fn().mockResolvedValue(undefined),
    markDelivered:          vi.fn().mockResolvedValue(undefined),
    markRead:               vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

function mockParticipantRepo(overrides = {}) {
  return {
    findByConversationId: vi.fn().mockResolvedValue(mockParticipants),
    findByUserId:         vi.fn().mockResolvedValue([]),
    findOne:              vi.fn().mockResolvedValue(null),
    isParticipant:        vi.fn().mockResolvedValue(true),
    add:                  vi.fn().mockResolvedValue(undefined),
    remove:               vi.fn().mockResolvedValue(undefined),
    updateLastRead:       vi.fn().mockResolvedValue(undefined),
    getRole:              vi.fn().mockResolvedValue(null),
    ...overrides,
  }
}

function mockConversationRepo(overrides = {}) {
  return {
    findById:            vi.fn().mockResolvedValue(mockConversation),
    findByUserId:        vi.fn().mockResolvedValue([]),
    countByUserId:       vi.fn().mockResolvedValue(0),
    create:              vi.fn().mockResolvedValue(mockConversation),
    update:              vi.fn().mockResolvedValue(mockConversation),
    delete:              vi.fn().mockResolvedValue(undefined),
    existsBetweenUsers:  vi.fn().mockResolvedValue(null),
    ...overrides,
  }
}

describe('MessageService', () => {
  let service: MessageService

  beforeEach(() => {
    service = new MessageService(
      mockMessageRepo(),
      mockParticipantRepo(),
      mockConversationRepo()
    )
    vi.clearAllMocks()
  })

  describe('getMessages()', () => {
    it('returns messages and meta for participant', async () => {
      const msgRepo = mockMessageRepo({
        findByConversationId: vi.fn().mockResolvedValue([mockMessage]),
        countByConversationId: vi.fn().mockResolvedValue(1),
      })
      service = new MessageService(
        msgRepo,
        mockParticipantRepo(),
        mockConversationRepo()
      )
      const result = await service.getMessages('conv-id', 'user-id', {})
      expect(result.messages).toHaveLength(1)
      expect(result.meta.total).toBe(1)
    })

    it('throws 403 when user is not participant', async () => {
      const partRepo = mockParticipantRepo({
        isParticipant: vi.fn().mockResolvedValue(false),
      })
      service = new MessageService(
        mockMessageRepo(),
        partRepo,
        mockConversationRepo()
      )
      await expect(
        service.getMessages('conv-id', 'non-participant', {})
      ).rejects.toThrow(HttpError)
    })

    it('updates lastRead after fetching', async () => {
      const partRepo = mockParticipantRepo()
      service = new MessageService(
        mockMessageRepo(),
        partRepo,
        mockConversationRepo()
      )
      await service.getMessages('conv-id', 'user-id', {})
      expect(partRepo.updateLastRead).toHaveBeenCalledWith('conv-id', 'user-id')
    })
  })

  describe('sendMessage()', () => {
    it('creates and returns a message', async () => {
      const result = await service.sendMessage(
        'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
        '5bed31bb-959c-4a24-8f76-30ba4c80fe87',
        { content: 'Hello!', message_type: 'text' }
      )
      expect(result.id).toBe('84e63a38-47ab-4865-a77d-4ee9d05ee1dd')
    })

    it('throws NotFoundError when conversation does not exist', async () => {
      const convRepo = mockConversationRepo({
        findById: vi.fn().mockResolvedValue(null),
      })
      service = new MessageService(
        mockMessageRepo(),
        mockParticipantRepo(),
        convRepo
      )
      await expect(
        service.sendMessage('non-existent', 'sender-id', {
          content: 'Hello',
          message_type: 'text',
        })
      ).rejects.toThrow(NotFoundError)
    })

    it('throws 403 when sender is not participant', async () => {
      const partRepo = mockParticipantRepo({
        isParticipant: vi.fn().mockResolvedValue(false),
      })
      service = new MessageService(
        mockMessageRepo(),
        partRepo,
        mockConversationRepo()
      )
      await expect(
        service.sendMessage('conv-id', 'non-participant', {
          content: 'Hello',
          message_type: 'text',
        })
      ).rejects.toThrow(HttpError)
    })

    it('updates conversation last_message_at after sending', async () => {
      const convRepo = mockConversationRepo()
      service = new MessageService(
        mockMessageRepo(),
        mockParticipantRepo(),
        convRepo
      )
      await service.sendMessage(
        'conv-id',
        '5bed31bb-959c-4a24-8f76-30ba4c80fe87',
        { content: 'Hello', message_type: 'text' }
      )
      expect(convRepo.update).toHaveBeenCalled()
    })
  })

  describe('deleteMessage()', () => {
    it('soft deletes when sender matches', async () => {
      const msgRepo = mockMessageRepo()
      service = new MessageService(
        msgRepo,
        mockParticipantRepo(),
        mockConversationRepo()
      )
      await service.deleteMessage(
        '84e63a38-47ab-4865-a77d-4ee9d05ee1dd',
        '5bed31bb-959c-4a24-8f76-30ba4c80fe87'
      )
      expect(msgRepo.softDelete).toHaveBeenCalled()
    })

    it('throws 403 when user is not the sender', async () => {
      await expect(
        service.deleteMessage(
          '84e63a38-47ab-4865-a77d-4ee9d05ee1dd',
          'different-user-id'
        )
      ).rejects.toThrow(HttpError)
    })

    it('throws NotFoundError when message does not exist', async () => {
      const msgRepo = mockMessageRepo({
        findById: vi.fn().mockResolvedValue(null),
      })
      service = new MessageService(
        msgRepo,
        mockParticipantRepo(),
        mockConversationRepo()
      )
      await expect(
        service.deleteMessage('non-existent', 'user-id')
      ).rejects.toThrow(NotFoundError)
    })
  })
})