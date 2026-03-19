
// src/modules/notifications/notification.routes.ts

import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authenticate.js'
import {
  getNotifications,
  getNotificationCount,
  markAsRead,
  markAllAsRead,
} from './notification.controller.js'

export async function notificationRoutes(
  app: FastifyInstance
): Promise<void> {
  app.addHook('preHandler', authenticate)

  // GET /api/notifications
  app.get('/', getNotifications)

  // GET /api/notifications/count
  app.get('/count', getNotificationCount)

  // PATCH /api/notifications/:id/read
  app.patch('/:id/read', markAsRead)

  // PATCH /api/notifications/read-all
  app.patch('/read-all', markAllAsRead)
}