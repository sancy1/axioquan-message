
// tests/unit/constants.test.ts:

import { describe, it, expect } from 'vitest'
import { MessageStatus } from '../../src/constants/messageStatus.js'
import { ConversationType } from '../../src/constants/conversationTypes.js'
import {
  ParticipantRole,
  SystemRole,
  MESSAGING_ALLOWED_ROLES,
  CONVERSATION_MANAGER_ROLES,
} from '../../src/constants/roles.js'

describe('MessageStatus', () => {
  it('SENT equals sent', () => {
    expect(MessageStatus.SENT).toBe('sent')
  })

  it('DELIVERED equals delivered', () => {
    expect(MessageStatus.DELIVERED).toBe('delivered')
  })

  it('READ equals read', () => {
    expect(MessageStatus.READ).toBe('read')
  })

  it('FAILED equals failed', () => {
    expect(MessageStatus.FAILED).toBe('failed')
  })

  it('has exactly 4 values', () => {
    const values = Object.values(MessageStatus)
    expect(values).toHaveLength(4)
  })
})

describe('ConversationType', () => {
  it('DIRECT equals direct', () => {
    expect(ConversationType.DIRECT).toBe('direct')
  })

  it('GROUP equals group', () => {
    expect(ConversationType.GROUP).toBe('group')
  })

  it('has exactly 2 values', () => {
    const values = Object.values(ConversationType)
    expect(values).toHaveLength(2)
  })
})

describe('ParticipantRole', () => {
  it('STUDENT equals student', () => {
    expect(ParticipantRole.STUDENT).toBe('student')
  })

  it('INSTRUCTOR equals instructor', () => {
    expect(ParticipantRole.INSTRUCTOR).toBe('instructor')
  })

  it('ADMIN equals admin', () => {
    expect(ParticipantRole.ADMIN).toBe('admin')
  })

  it('has exactly 3 values', () => {
    const values = Object.values(ParticipantRole)
    expect(values).toHaveLength(3)
  })
})

describe('SystemRole', () => {
  it('has TEACHING_ASSISTANT value', () => {
    expect(SystemRole.TEACHING_ASSISTANT).toBe('teaching_assistant')
  })

  it('has exactly 4 values', () => {
    const values = Object.values(SystemRole)
    expect(values).toHaveLength(4)
  })
})

describe('MESSAGING_ALLOWED_ROLES', () => {
  it('includes student', () => {
    expect(MESSAGING_ALLOWED_ROLES).toContain(SystemRole.STUDENT)
  })

  it('includes instructor', () => {
    expect(MESSAGING_ALLOWED_ROLES).toContain(SystemRole.INSTRUCTOR)
  })

  it('includes admin', () => {
    expect(MESSAGING_ALLOWED_ROLES).toContain(SystemRole.ADMIN)
  })

  it('includes teaching_assistant', () => {
    expect(MESSAGING_ALLOWED_ROLES).toContain(SystemRole.TEACHING_ASSISTANT)
  })

  it('has exactly 4 entries', () => {
    expect(MESSAGING_ALLOWED_ROLES).toHaveLength(4)
  })
})

describe('CONVERSATION_MANAGER_ROLES', () => {
  it('includes instructor', () => {
    expect(CONVERSATION_MANAGER_ROLES).toContain(SystemRole.INSTRUCTOR)
  })

  it('includes admin', () => {
    expect(CONVERSATION_MANAGER_ROLES).toContain(SystemRole.ADMIN)
  })

  it('does NOT include student', () => {
    expect(CONVERSATION_MANAGER_ROLES).not.toContain(SystemRole.STUDENT)
  })

  it('has exactly 2 entries', () => {
    expect(CONVERSATION_MANAGER_ROLES).toHaveLength(2)
  })
})