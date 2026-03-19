
// src/websocket/websocket.handler.ts

import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { WebSocket } from '@fastify/websocket'
import {
  registerConnection,
  removeConnection,
  sendToUser,
} from './websocket.manager.js'
import { logger } from '../utils/logger.js'

// ── WebSocket message types ───────────────────────────────────────────────────
export const WS_EVENTS = {
  MESSAGE:   'message',
  DELIVERED: 'delivered',
  READ:      'read',
  TYPING:    'typing',
  PING:      'ping',
  PONG:      'pong',
  ERROR:     'error',
  CONNECTED: 'connected',
} as const

interface WsMessage {
  type: string
  payload?: unknown
}

// ── Register WebSocket route ──────────────────────────────────────────────────
export async function registerWebSocketHandler(
  app: FastifyInstance
): Promise<void> {
  app.get(
    '/ws',
    { websocket: true },
    (socket: WebSocket, request: FastifyRequest) => {
      let userId: string | null = null

      try {
        // ── Verify JWT from query param ───────────────────────────────────────
        const token = (request.query as Record<string, string>).token

        if (!token) {
          socket.send(JSON.stringify({
            type: WS_EVENTS.ERROR,
            payload: { message: 'Missing token', code: 'MISSING_TOKEN' },
          }))
          socket.close(1008, 'Missing token')
          return
        }

        // Verify JWT using Fastify's JWT instance
        let decoded: { userId: string; email: string; role: string }
        try {
          decoded = app.jwt.verify(token) as typeof decoded
        } catch {
          socket.send(JSON.stringify({
            type: WS_EVENTS.ERROR,
            payload: { message: 'Invalid token', code: 'INVALID_TOKEN' },
          }))
          socket.close(1008, 'Invalid token')
          return
        }

        userId = decoded.userId

        // Register the connection
        registerConnection(userId, socket)

        // Send connected confirmation
        socket.send(JSON.stringify({
          type: WS_EVENTS.CONNECTED,
          payload: {
            userId,
            message: 'Connected to messag real-time server',
            timestamp: new Date().toISOString(),
          },
        }))

        // ── Handle incoming messages from client ──────────────────────────────
        socket.on('message', (rawMessage: Buffer) => {
          try {
            const data = JSON.parse(rawMessage.toString()) as WsMessage

            switch (data.type) {
              case WS_EVENTS.PING:
                socket.send(JSON.stringify({
                  type: WS_EVENTS.PONG,
                  payload: { timestamp: new Date().toISOString() },
                }))
                break

              case WS_EVENTS.TYPING:
                logger.info(
                  { userId, payload: data.payload },
                  'Typing indicator received'
                )
                break

              default:
                logger.info(
                  { userId, type: data.type },
                  'Unknown WS message type'
                )
            }
          } catch {
            logger.error({ userId }, 'Failed to parse WebSocket message')
          }
        })

        // ── Handle disconnect ─────────────────────────────────────────────────
        socket.on('close', () => {
          if (userId) {
            removeConnection(userId)
          }
        })

        // ── Handle errors ─────────────────────────────────────────────────────
        socket.on('error', (error: Error) => {
          logger.error({ err: error, userId }, 'WebSocket error')
          if (userId) {
            removeConnection(userId)
          }
        })

      } catch (error) {
        logger.error({ err: error }, 'WebSocket handler error')
        socket.close(1011, 'Server error')
      }
    }
  )
}