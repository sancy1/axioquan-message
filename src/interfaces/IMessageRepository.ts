
// src/interfaces/IMessageRepository.ts

import {
  Message,
  MessageWithSender,
  CreateMessageInput,
  UpdateMessageInput,
} from '../models/message.model.js'
import { PaginationParams } from '../utils/pagination.js'

export interface IMessageRepository {
  findById(id: string): Promise<Message | null>

  findByConversationId(
    conversationId: string,
    recipientId: string,
    pagination: PaginationParams
  ): Promise<MessageWithSender[]>

  countByConversationId(conversationId: string): Promise<number>

  create(data: CreateMessageInput): Promise<Message>

  update(
    id: string,
    data: UpdateMessageInput
  ): Promise<Message | null>

  softDelete(id: string): Promise<void>

  markDelivered(id: string): Promise<void>

  markRead(id: string, userId: string): Promise<void>
}