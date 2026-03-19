
// tests/unit/interfaces.test.ts

import { describe, it, expect, vi } from 'vitest'
import type {
  IConversationRepository,
} from '../../src/interfaces/IConversationRepository.js'
import type {
  IMessageRepository,
} from '../../src/interfaces/IMessageRepository.js'
import type {
  IParticipantRepository,
} from '../../src/interfaces/IParticipantRepository.js'
import type {
  INotificationService,
} from '../../src/interfaces/INotificationService.js'
import { ConversationType } from '../../src/constants/conversationTypes.js'
import { ParticipantRole } from '../../src/constants/roles.js'

// ── Mock implementations ──────────────────────────────────────────────────────
// These verify that a class implementing the interface
// compiles and behaves correctly — no real DB calls

const mockConversation = {
  id: 'uuid',
  type: ConversationType.DIRECT,
  title: null,
  course_id: null,
  created_by: 'uuid',
  last_message_at: null,
  created_at: new Date(),
  updated_at: new Date(),
}

const mockMessage = {
  id: 'uuid',
  conversation_id: 'uuid',
  sender_id: 'uuid',
  receiver_id: 'uuid',
  course_id: null,
  message: 'Hello',
  message_type: 'text',
  attachment_url: null,
  attachment_type: null,
  attachment_size: null,
  is_delivered: false,
  is_read: false,
  delivered_at: null,
  read_at: null,
  is_edited: false,
  edited_at: null,
  reply_to_id: null,
  reactions: null,
  is_reported: false,
  reported_at: null,
  created_at: new Date(),
}

const mockParticipant = {
  id: 'uuid',
  conversation_id: 'uuid',
  user_id: 'uuid',
  role: ParticipantRole.STUDENT,
  joined_at: new Date(),
  last_read_at: null,
}

const mockNotification = {
  id: 'uuid',
  user_id: 'uuid',
  conversation_id: 'uuid',
  message_id: 'uuid',
  sender_id: 'uuid',
  is_read: false,
  read_at: null,
  created_at: new Date(),
}

describe('IConversationRepository', () => {
  it('mock implementation satisfies the interface', () => {
    const repo: IConversationRepository = {
      findById: vi.fn().mockResolvedValue(mockConversation),
      findByUserId: vi.fn().mockResolvedValue([]),
      countByUserId: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue(mockConversation),
      update: vi.fn().mockResolvedValue(mockConversation),
      delete: vi.fn().mockResolvedValue(undefined),
      existsBetweenUsers: vi.fn().mockResolvedValue(null),
    }
    expect(repo.findById).toBeDefined()
    expect(repo.create).toBeDefined()
    expect(repo.existsBetweenUsers).toBeDefined()
  })

  it('findById returns conversation or null', async () => {
    const repo: IConversationRepository = {
      findById: vi.fn().mockResolvedValue(mockConversation),
      findByUserId: vi.fn().mockResolvedValue([]),
      countByUserId: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue(mockConversation),
      update: vi.fn().mockResolvedValue(null),
      delete: vi.fn().mockResolvedValue(undefined),
      existsBetweenUsers: vi.fn().mockResolvedValue(null),
    }
    const result = await repo.findById('uuid')
    expect(result).toEqual(mockConversation)
  })

  it('existsBetweenUsers returns null when no conversation', async () => {
    const repo: IConversationRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByUserId: vi.fn().mockResolvedValue([]),
      countByUserId: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue(mockConversation),
      update: vi.fn().mockResolvedValue(null),
      delete: vi.fn().mockResolvedValue(undefined),
      existsBetweenUsers: vi.fn().mockResolvedValue(null),
    }
    const result = await repo.existsBetweenUsers('uuid1', 'uuid2')
    expect(result).toBeNull()
  })
})

describe('IMessageRepository', () => {
  it('mock implementation satisfies the interface', () => {
    const repo: IMessageRepository = {
      findById: vi.fn().mockResolvedValue(mockMessage),
      findByConversationId: vi.fn().mockResolvedValue([]),
      countByConversationId: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue(mockMessage),
      update: vi.fn().mockResolvedValue(mockMessage),
      softDelete: vi.fn().mockResolvedValue(undefined),
      markDelivered: vi.fn().mockResolvedValue(undefined),
      markRead: vi.fn().mockResolvedValue(undefined),
    }
    expect(repo.softDelete).toBeDefined()
    expect(repo.markDelivered).toBeDefined()
    expect(repo.markRead).toBeDefined()
  })

  it('create returns a message', async () => {
    const repo: IMessageRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByConversationId: vi.fn().mockResolvedValue([]),
      countByConversationId: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue(mockMessage),
      update: vi.fn().mockResolvedValue(null),
      softDelete: vi.fn().mockResolvedValue(undefined),
      markDelivered: vi.fn().mockResolvedValue(undefined),
      markRead: vi.fn().mockResolvedValue(undefined),
    }
    const result = await repo.create({
      conversation_id: 'uuid',
      sender_id: 'uuid',
      receiver_id: 'uuid',
      message: 'Hello',
    })
    expect(result.message).toBe('Hello')
  })
})

describe('IParticipantRepository', () => {
  it('mock implementation satisfies the interface', () => {
    const repo: IParticipantRepository = {
      findByConversationId: vi.fn().mockResolvedValue([]),
      findByUserId: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue(null),
      isParticipant: vi.fn().mockResolvedValue(false),
      add: vi.fn().mockResolvedValue(mockParticipant),
      remove: vi.fn().mockResolvedValue(undefined),
      updateLastRead: vi.fn().mockResolvedValue(undefined),
      getRole: vi.fn().mockResolvedValue(null),
    }
    expect(repo.isParticipant).toBeDefined()
    expect(repo.getRole).toBeDefined()
  })

  it('isParticipant returns boolean', async () => {
    const repo: IParticipantRepository = {
      findByConversationId: vi.fn().mockResolvedValue([]),
      findByUserId: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue(mockParticipant),
      isParticipant: vi.fn().mockResolvedValue(true),
      add: vi.fn().mockResolvedValue(mockParticipant),
      remove: vi.fn().mockResolvedValue(undefined),
      updateLastRead: vi.fn().mockResolvedValue(undefined),
      getRole: vi.fn().mockResolvedValue(ParticipantRole.STUDENT),
    }
    const result = await repo.isParticipant('uuid', 'uuid')
    expect(result).toBe(true)
  })
})

describe('INotificationService', () => {
  it('mock implementation satisfies the interface', () => {
    const service: INotificationService = {
      findByUserId: vi.fn().mockResolvedValue([]),
      countUnread: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue(mockNotification),
      markAsRead: vi.fn().mockResolvedValue(undefined),
      markAllAsRead: vi.fn().mockResolvedValue(undefined),
      deleteByMessageId: vi.fn().mockResolvedValue(undefined),
    }
    expect(service.countUnread).toBeDefined()
    expect(service.markAllAsRead).toBeDefined()
  })

  it('countUnread returns number', async () => {
    const service: INotificationService = {
      findByUserId: vi.fn().mockResolvedValue([]),
      countUnread: vi.fn().mockResolvedValue(3),
      create: vi.fn().mockResolvedValue(mockNotification),
      markAsRead: vi.fn().mockResolvedValue(undefined),
      markAllAsRead: vi.fn().mockResolvedValue(undefined),
      deleteByMessageId: vi.fn().mockResolvedValue(undefined),
    }
    const result = await service.countUnread('uuid')
    expect(result).toBe(3)
  })
})