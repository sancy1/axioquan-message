
// src/interfaces/IParticipantRepository.ts

import {
  Participant,
  ParticipantWithUser,
  AddParticipantInput,
} from '../models/participant.model.js'
import { ParticipantRole } from '../constants/roles.js'

export interface IParticipantRepository {
  findByConversationId(
    conversationId: string
  ): Promise<ParticipantWithUser[]>

  findByUserId(userId: string): Promise<Participant[]>

  findOne(
    conversationId: string,
    userId: string
  ): Promise<Participant | null>

  isParticipant(
    conversationId: string,
    userId: string
  ): Promise<boolean>

  add(data: AddParticipantInput): Promise<Participant>

  remove(conversationId: string, userId: string): Promise<void>

  updateLastRead(
    conversationId: string,
    userId: string
  ): Promise<void>

  getRole(
    conversationId: string,
    userId: string
  ): Promise<ParticipantRole | null>
}