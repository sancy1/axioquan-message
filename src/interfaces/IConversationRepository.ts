
// src/interfaces/IConversationRepository.ts

import {
  Conversation,
  ConversationWithParticipant,
  CreateConversationInput,
  UpdateConversationInput,
} from '../models/conversation.model.js'
import { PaginationParams } from '../utils/pagination.js'

export interface IConversationRepository {
  findById(id: string): Promise<Conversation | null>

  findByUserId(
    userId: string,
    pagination: PaginationParams
  ): Promise<ConversationWithParticipant[]>

  countByUserId(userId: string): Promise<number>

  create(data: CreateConversationInput): Promise<Conversation>

  update(
    id: string,
    data: UpdateConversationInput
  ): Promise<Conversation | null>

  delete(id: string): Promise<void>

  existsBetweenUsers(
    userIdA: string,
    userIdB: string
  ): Promise<Conversation | null>
}