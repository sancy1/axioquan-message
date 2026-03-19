
// tests/unit/models.test.ts:

import { describe, it, expect } from 'vitest'
import { ConversationType } from '../../src/constants/conversationTypes.js'
import { MessageStatus } from '../../src/constants/messageStatus.js'
import { ParticipantRole } from '../../src/constants/roles.js'
import type { Conversation, ConversationWithParticipant, CreateConversationInput } from '../../src/models/conversation.model.js'
import type { Message, MessageWithSender, CreateMessageInput } from '../../src/models/message.model.js'
import type { Participant, AddParticipantInput } from '../../src/models/participant.model.js'
import type { MessageNotification, CreateNotificationInput } from '../../src/models/notification.model.js'

describe('Conversation model', () => {
  it('accepts a valid Conversation object', () => {
    const conversation: Conversation = {
      id: 'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
      type: ConversationType.DIRECT,
      title: 'Question about course',
      course_id: null,
      created_by: '5bed31bb-959c-4a24-8f76-30ba4c80fe87',
      last_message_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    }
    expect(conversation.id).toBeDefined()
    expect(conversation.type).toBe(ConversationType.DIRECT)
  })

  it('accepts null optional fields', () => {
    const conversation: Conversation = {
      id: 'uuid',
      type: ConversationType.DIRECT,
      title: null,
      course_id: null,
      created_by: 'uuid',
      last_message_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    }
    expect(conversation.title).toBeNull()
    expect(conversation.course_id).toBeNull()
    expect(conversation.last_message_at).toBeNull()
  })

  it('accepts a valid CreateConversationInput', () => {
    const input: CreateConversationInput = {
      type: ConversationType.DIRECT,
      created_by: 'uuid',
      participantIds: ['uuid1', 'uuid2'],
    }
    expect(input.participantIds).toHaveLength(2)
  })

  it('ConversationWithParticipant extends Conversation', () => {
    const conv: ConversationWithParticipant = {
      id: 'uuid',
      type: ConversationType.DIRECT,
      title: null,
      course_id: null,
      created_by: 'uuid',
      last_message_at: null,
      created_at: new Date(),
      updated_at: new Date(),
      my_role: 'student',
      last_read_at: null,
      other_participant_id: 'uuid',
      other_participant_username: 'sancy1',
      other_participant_name: 'Alexander Sanchez',
      other_participant_image: null,
      last_message_preview: 'Hello!',
    }
    expect(conv.other_participant_username).toBe('sancy1')
    expect(conv.my_role).toBe('student')
  })
})

describe('Message model', () => {
  it('accepts a valid Message object', () => {
    const message: Message = {
      id: '84e63a38-47ab-4865-a77d-4ee9d05ee1dd',
      conversation_id: 'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
      sender_id: '5bed31bb-959c-4a24-8f76-30ba4c80fe87',
      receiver_id: '18477825-b6b4-42ff-8367-b5e9c1343989',
      course_id: null,
      message: 'Hello instructor!',
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
    expect(message.id).toBeDefined()
    expect(message.is_delivered).toBe(false)
    expect(message.is_read).toBe(false)
  })

  it('accepts a valid CreateMessageInput', () => {
    const input: CreateMessageInput = {
      conversation_id: 'uuid',
      sender_id: 'uuid',
      receiver_id: 'uuid',
      message: 'Hello!',
    }
    expect(input.message).toBe('Hello!')
    expect(input.message_type).toBeUndefined()
  })

  it('MessageWithSender includes sender fields', () => {
    const msg: MessageWithSender = {
      id: 'uuid',
      conversation_id: 'uuid',
      sender_id: 'uuid',
      receiver_id: 'uuid',
      course_id: null,
      message: 'Hi',
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
      sender_username: 'williams1',
      sender_name: 'John Williams',
      sender_image: null,
      recipient_has_read: false,
      recipient_read_at: null,
    }
    expect(msg.sender_username).toBe('williams1')
    expect(msg.recipient_has_read).toBe(false)
  })
})

describe('Participant model', () => {
  it('accepts a valid Participant object', () => {
    const participant: Participant = {
      id: 'uuid',
      conversation_id: 'uuid',
      user_id: 'uuid',
      role: ParticipantRole.STUDENT,
      joined_at: new Date(),
      last_read_at: null,
    }
    expect(participant.role).toBe(ParticipantRole.STUDENT)
    expect(participant.last_read_at).toBeNull()
  })

  it('accepts a valid AddParticipantInput', () => {
    const input: AddParticipantInput = {
      conversation_id: 'uuid',
      user_id: 'uuid',
      role: ParticipantRole.INSTRUCTOR,
    }
    expect(input.role).toBe(ParticipantRole.INSTRUCTOR)
  })
})

describe('MessageNotification model', () => {
  it('accepts a valid MessageNotification object', () => {
    const notification: MessageNotification = {
      id: 'e8403cef-e1c1-4e51-9484-d844eca54cdb',
      user_id: '18477825-b6b4-42ff-8367-b5e9c1343989',
      conversation_id: 'b3a90d51-8ac1-48ea-9d76-74130a62a8c0',
      message_id: '84e63a38-47ab-4865-a77d-4ee9d05ee1dd',
      sender_id: '5bed31bb-959c-4a24-8f76-30ba4c80fe87',
      is_read: false,
      read_at: null,
      created_at: new Date(),
    }
    expect(notification.is_read).toBe(false)
    expect(notification.read_at).toBeNull()
  })

  it('accepts a valid CreateNotificationInput', () => {
    const input: CreateNotificationInput = {
      user_id: 'uuid',
      conversation_id: 'uuid',
      message_id: 'uuid',
      sender_id: 'uuid',
    }
    expect(input.user_id).toBeDefined()
    expect(input.sender_id).toBeDefined()
  })
})