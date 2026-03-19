
// src/constants/roles.ts

export enum ParticipantRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}

// Maps to the axioquan roles table
export enum SystemRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
  TEACHING_ASSISTANT = 'teaching_assistant',
}

// Roles that can initiate conversations
export const MESSAGING_ALLOWED_ROLES = [
  SystemRole.STUDENT,
  SystemRole.INSTRUCTOR,
  SystemRole.ADMIN,
  SystemRole.TEACHING_ASSISTANT,
] as const

// Roles that can add/remove participants
export const CONVERSATION_MANAGER_ROLES = [
  SystemRole.INSTRUCTOR,
  SystemRole.ADMIN,
] as const