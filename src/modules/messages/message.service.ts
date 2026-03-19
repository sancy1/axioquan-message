
//  src/modules/messages/message.service.ts

import type { IMessageRepository } from '../../interfaces/IMessageRepository.js'
import type { IParticipantRepository } from '../../interfaces/IParticipantRepository.js'
import type { IConversationRepository } from '../../interfaces/IConversationRepository.js'
import type {
  Message,
  MessageWithSender,
} from '../../models/message.model.js'
import type { SendMessageInput } from './message.validator.js'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { HttpError } from '../../errors/HttpError.js'
import {
  getPaginationParams,
  buildPaginationMeta,
} from '../../utils/pagination.js'
import { logger } from '../../utils/logger.js'
import { emitter } from '../../events/eventEmitter.js'
import { MESSAGE_EVENTS } from '../../events/message.events.js'

export class MessageService {
  constructor(
    private readonly messageRepo: IMessageRepository,
    private readonly participantRepo: IParticipantRepository,
    private readonly conversationRepo: IConversationRepository
  ) {}

  // ── Get messages in a conversation ─────────────────────────────────────────
  async getMessages(
    conversationId: string,
    userId: string,
    query: { page?: number; limit?: number }
  ): Promise<{
    messages: MessageWithSender[]
    meta: ReturnType<typeof buildPaginationMeta>
  }> {
    // Verify user is participant
    const isParticipant = await this.participantRepo.isParticipant(
      conversationId,
      userId
    )
    if (!isParticipant) {
      throw new HttpError(
        403,
        'Forbidden — you are not a participant in this conversation',
        'FORBIDDEN'
      )
    }

    const pagination = getPaginationParams(query)
    const [messages, total] = await Promise.all([
      this.messageRepo.findByConversationId(
        conversationId,
        userId,
        pagination
      ),
      this.messageRepo.countByConversationId(conversationId),
    ])

    // Update last read timestamp for this participant
    await this.participantRepo.updateLastRead(conversationId, userId)

    const meta = buildPaginationMeta(total, pagination.page, pagination.limit)
    return { messages, meta }
  }

  // ── Send a message ──────────────────────────────────────────────────────────
  async sendMessage(
    conversationId: string,
    senderId: string,
    data: SendMessageInput
  ): Promise<Message> {
    // Verify conversation exists
    const conversation = await this.conversationRepo.findById(conversationId)
    if (!conversation) {
      throw new NotFoundError('Conversation')
    }

    // Verify sender is participant
    const isParticipant = await this.participantRepo.isParticipant(
      conversationId,
      senderId
    )
    if (!isParticipant) {
      throw new HttpError(
        403,
        'Forbidden — you are not a participant in this conversation',
        'FORBIDDEN'
      )
    }

    // Get all participants to find the receiver
    const participants = await this.participantRepo.findByConversationId(
      conversationId
    )
    const receiver = participants.find((p) => p.user_id !== senderId)
    if (!receiver) {
      throw new HttpError(
        400,
        'Cannot send message — no other participant found',
        'NO_RECEIVER'
      )
    }

    // Create the message
    const message = await this.messageRepo.create({
      conversation_id:  conversationId,
      sender_id:        senderId,
      receiver_id:      receiver.user_id,
      message:          data.content,
      message_type:     data.message_type,
      reply_to_id:      data.reply_to_id,
      attachment_url:   data.attachment_url,
      attachment_type:  data.attachment_type,
      attachment_size:  data.attachment_size,
    })

    // Update conversation last_message_at
    await this.conversationRepo.update(conversationId, {
      last_message_at: message.created_at,
    })

    // Fire MessageSent event for notifications and WebSocket
    emitter.emit(MESSAGE_EVENTS.SENT, {
      messageId:      message.id,
      conversationId,
      senderId,
      receiverId:     receiver.user_id,
      participantIds: participants.map((p) => p.user_id),
    })

    logger.info(
      { messageId: message.id, conversationId, senderId },
      'Message sent'
    )

    return message
  }

  // ── Delete message (soft delete) ────────────────────────────────────────────
  async deleteMessage(id: string, userId: string): Promise<void> {
    const message = await this.messageRepo.findById(id)
    if (!message) {
      throw new NotFoundError('Message')
    }

    // Only sender can delete their own message
    if (message.sender_id !== userId) {
      throw new HttpError(
        403,
        'Forbidden — you can only delete your own messages',
        'FORBIDDEN'
      )
    }

    await this.messageRepo.softDelete(id)
    logger.info({ id, userId }, 'Message deleted')
  }

  // ── Mark message as delivered ───────────────────────────────────────────────
  async markDelivered(id: string): Promise<void> {
    const message = await this.messageRepo.findById(id)
    if (!message) {
      throw new NotFoundError('Message')
    }
    await this.messageRepo.markDelivered(id)
  }

  // ── Mark message as read ────────────────────────────────────────────────────
  async markRead(id: string, userId: string): Promise<void> {
    const message = await this.messageRepo.findById(id)
    if (!message) {
      throw new NotFoundError('Message')
    }
    await this.messageRepo.markRead(id, userId)

    emitter.emit(MESSAGE_EVENTS.READ, {
      messageId: id,
      userId,
      conversationId: message.conversation_id,
    })
  }
}