
// src/modules/conversations/conversation.service.ts

import type { IConversationRepository } from '../../interfaces/IConversationRepository.js'
import type { IParticipantRepository } from '../../interfaces/IParticipantRepository.js'
import type {
  Conversation,
  ConversationWithParticipant,
} from '../../models/conversation.model.js'
import type {
  CreateConversationInput,
  UpdateConversationInput,
} from './conversation.validator.js'
import { ConversationType } from '../../constants/conversationTypes.js'
import { ParticipantRole } from '../../constants/roles.js'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { HttpError } from '../../errors/HttpError.js'
import { getPaginationParams, buildPaginationMeta } from '../../utils/pagination.js'
import { logger } from '../../utils/logger.js'

export class ConversationService {
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly participantRepo: IParticipantRepository
  ) {}

  // ── Get user inbox ──────────────────────────────────────────────────────────
  // async getConversations(
  //   userId: string,
  //   query: { page?: number; limit?: number }
  // ): Promise<{
  //   conversations: ConversationWithParticipant[]
  //   meta: ReturnType<typeof buildPaginationMeta>
  // }> {
  //   const pagination = getPaginationParams(query)
  //   const [conversations, total] = await Promise.all([
  //     this.conversationRepo.findByUserId(userId, pagination),
  //     this.conversationRepo.countByUserId(userId),
  //   ])
  //   const meta = buildPaginationMeta(total, pagination.page, pagination.limit)
  //   return { conversations, meta }
  // }


  // ── Get user inbox ──────────────────────────────────────────────────────────
async getConversations(
  userId: string,
  query: { page?: number; limit?: number }
): Promise<{
  conversations: ConversationWithParticipant[]
  meta: ReturnType<typeof buildPaginationMeta>
}> {
  const pagination = getPaginationParams(query)

  let conversations: ConversationWithParticipant[] = []
  let total = 0

  try {
    const [convResult, countResult] = await Promise.all([
      this.conversationRepo.findByUserId(userId, pagination),
      this.conversationRepo.countByUserId(userId),
    ])
    conversations = convResult
    total         = countResult
  } catch (error: any) {
    // Log the actual SQL error so we can see it in Render logs
    logger.error({ err: error, userId }, 'findByUserId failed — SQL error')
    // Re-throw so we can see the real error in tests
    throw error
  }

  const meta = buildPaginationMeta(total, pagination.page, pagination.limit)
  return { conversations, meta }
}


  // ── Get single conversation ─────────────────────────────────────────────────
  async getConversationById(
    id: string,
    userId: string
  ): Promise<Conversation> {
    const conversation = await this.conversationRepo.findById(id)
    if (!conversation) {
      throw new NotFoundError('Conversation')
    }

    // Verify requesting user is a participant
    const isParticipant = await this.participantRepo.isParticipant(id, userId)
    if (!isParticipant) {
      throw new NotFoundError('Conversation')
    }

    return conversation
  }

  // ── Create conversation ─────────────────────────────────────────────────────
  async createConversation(
    data: CreateConversationInput,
    createdBy: string
  ): Promise<Conversation> {
    // For direct conversations check if one already exists
    if (
      data.type === ConversationType.DIRECT &&
      data.participantIds.length === 1
    ) {
      const existing = await this.conversationRepo.existsBetweenUsers(
        createdBy,
        data.participantIds[0]
      )
      if (existing) {
        logger.info(
          { id: existing.id },
          'Returning existing direct conversation'
        )
        return existing
      }
    }

    // Create the conversation
    const conversation = await this.conversationRepo.create({
      type: data.type as ConversationType,
      title: data.title,
      course_id: data.course_id,
      created_by: createdBy,
      participantIds: data.participantIds,
    })

    // Add creator as participant
    const creatorRole = ParticipantRole.STUDENT
    await this.participantRepo.add({
      conversation_id: conversation.id,
      user_id: createdBy,
      role: creatorRole,
    })

    // Add all other participants
    for (const participantId of data.participantIds) {
      if (participantId !== createdBy) {
        await this.participantRepo.add({
          conversation_id: conversation.id,
          user_id: participantId,
          role: ParticipantRole.INSTRUCTOR,
        })
      }
    }

    logger.info(
      { id: conversation.id, createdBy },
      'Conversation created with participants'
    )

    return conversation
  }

  // ── Update conversation ─────────────────────────────────────────────────────
  async updateConversation(
    id: string,
    data: UpdateConversationInput,
    userId: string
  ): Promise<Conversation> {
    const conversation = await this.conversationRepo.findById(id)
    if (!conversation) {
      throw new NotFoundError('Conversation')
    }

    // Only creator can update
    if (conversation.created_by !== userId) {
      throw new HttpError(
        403,
        'Forbidden — only the conversation creator can update it',
        'FORBIDDEN'
      )
    }

    const updated = await this.conversationRepo.update(id, { title: data.title })
    if (!updated) {
      throw new NotFoundError('Conversation')
    }

    return updated
  }

  // ── Delete conversation ─────────────────────────────────────────────────────
  async deleteConversation(id: string, userId: string): Promise<void> {
    const conversation = await this.conversationRepo.findById(id)
    if (!conversation) {
      throw new NotFoundError('Conversation')
    }

    // Only creator can delete
    if (conversation.created_by !== userId) {
      throw new HttpError(
        403,
        'Forbidden — only the conversation creator can delete it',
        'FORBIDDEN'
      )
    }

    await this.conversationRepo.delete(id)
    logger.info({ id, userId }, 'Conversation deleted')
  }
}