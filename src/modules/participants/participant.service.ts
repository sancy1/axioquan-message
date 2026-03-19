
// src/modules/participants/participant.dto.ts

import type { IParticipantRepository } from '../../interfaces/IParticipantRepository.js'
import type { IConversationRepository } from '../../interfaces/IConversationRepository.js'
import type { ParticipantWithUser } from '../../models/participant.model.js'
import type { AddParticipantBody } from './participant.validator.js'
import { ParticipantRole } from '../../constants/roles.js'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { HttpError } from '../../errors/HttpError.js'
import { logger } from '../../utils/logger.js'

export class ParticipantService {
  constructor(
    private readonly participantRepo: IParticipantRepository,
    private readonly conversationRepo: IConversationRepository
  ) {}

  // ── Get participants in a conversation ──────────────────────────────────────
  async getParticipants(
    conversationId: string,
    requestingUserId: string
  ): Promise<ParticipantWithUser[]> {
    // Verify conversation exists
    const conversation = await this.conversationRepo.findById(conversationId)
    if (!conversation) {
      throw new NotFoundError('Conversation')
    }

    // Verify requesting user is a participant
    const isParticipant = await this.participantRepo.isParticipant(
      conversationId,
      requestingUserId
    )
    if (!isParticipant) {
      throw new HttpError(
        403,
        'Forbidden — you are not a participant in this conversation',
        'FORBIDDEN'
      )
    }

    return this.participantRepo.findByConversationId(conversationId)
  }

  // ── Add participant ─────────────────────────────────────────────────────────
  async addParticipant(
    conversationId: string,
    data: AddParticipantBody,
    requestingUserId: string
  ): Promise<ParticipantWithUser> {
    // Verify conversation exists
    const conversation = await this.conversationRepo.findById(conversationId)
    if (!conversation) {
      throw new NotFoundError('Conversation')
    }

    // Only instructor or admin can add participants
    const requestingRole = await this.participantRepo.getRole(
      conversationId,
      requestingUserId
    )
    if (
      !requestingRole ||
      ![ParticipantRole.INSTRUCTOR, ParticipantRole.ADMIN].includes(
        requestingRole
      )
    ) {
      throw new HttpError(
        403,
        'Forbidden — only instructors and admins can add participants',
        'FORBIDDEN'
      )
    }

    // Check if user is already a participant
    const alreadyParticipant = await this.participantRepo.isParticipant(
      conversationId,
      data.userId
    )
    if (alreadyParticipant) {
      throw new HttpError(
        409,
        'User is already a participant in this conversation',
        'ALREADY_PARTICIPANT'
      )
    }

    // Add the participant
    await this.participantRepo.add({
      conversation_id: conversationId,
      user_id:         data.userId,
      role:            data.role,
    })

    // Return updated participant list entry with user details
    const participants = await this.participantRepo.findByConversationId(
      conversationId
    )
    const added = participants.find((p) => p.user_id === data.userId)
    if (!added) {
      throw new HttpError(500, 'Failed to retrieve added participant', 'SERVER_ERROR')
    }

    logger.info({ conversationId, userId: data.userId }, 'Participant added')
    return added
  }

  // ── Remove participant ──────────────────────────────────────────────────────
  async removeParticipant(
    conversationId: string,
    userIdToRemove: string,
    requestingUserId: string
  ): Promise<void> {
    // Verify conversation exists
    const conversation = await this.conversationRepo.findById(conversationId)
    if (!conversation) {
      throw new NotFoundError('Conversation')
    }

    // Cannot remove the conversation creator
    if (conversation.created_by === userIdToRemove) {
      throw new HttpError(
        400,
        'Cannot remove the conversation creator',
        'CANNOT_REMOVE_CREATOR'
      )
    }

    // Only instructor or admin can remove participants
    const requestingRole = await this.participantRepo.getRole(
      conversationId,
      requestingUserId
    )
    if (
      !requestingRole ||
      ![ParticipantRole.INSTRUCTOR, ParticipantRole.ADMIN].includes(
        requestingRole
      )
    ) {
      throw new HttpError(
        403,
        'Forbidden — only instructors and admins can remove participants',
        'FORBIDDEN'
      )
    }

    // Verify user to remove is actually a participant
    const isParticipant = await this.participantRepo.isParticipant(
      conversationId,
      userIdToRemove
    )
    if (!isParticipant) {
      throw new NotFoundError('Participant')
    }

    await this.participantRepo.remove(conversationId, userIdToRemove)
    logger.info(
      { conversationId, userIdToRemove, requestingUserId },
      'Participant removed'
    )
  }
}