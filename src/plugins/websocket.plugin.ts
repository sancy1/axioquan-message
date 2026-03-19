// src/plugins/websocket.plugin.ts

import fp from 'fastify-plugin'
import fastifyWebSocket from '@fastify/websocket'
import type { FastifyInstance } from 'fastify'
import { env } from '../config/env.js'

export default fp(async (app: FastifyInstance) => {
  if (env.WS_ENABLED) {
    await app.register(fastifyWebSocket, {
      options: {
        maxPayload: 1048576, // 1MB max message size
      },
    })
  }
})