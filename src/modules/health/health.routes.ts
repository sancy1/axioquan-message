
// src/modules/health/health.routes.ts

import type { FastifyInstance } from 'fastify'
import { healthCheck, healthDbCheck } from './health.controller.js'

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', healthCheck)
  app.get('/health/db', healthDbCheck)
}