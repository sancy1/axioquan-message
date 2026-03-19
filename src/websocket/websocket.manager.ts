
// src/websocket/websocket.manager.ts

import type { WebSocket } from '@fastify/websocket'
import { logger } from '../utils/logger.js'

// ── Connection registry ───────────────────────────────────────────────────────
// Maps userId → active WebSocket connection
// One connection per user (latest connection wins)
const connections = new Map<string, WebSocket>()

// ── Register connection ───────────────────────────────────────────────────────
export function registerConnection(userId: string, ws: WebSocket): void {
  // Close existing connection if user reconnects
  const existing = connections.get(userId)
  if (existing && existing.readyState === existing.OPEN) {
    existing.close(1000, 'New connection established')
  }

  connections.set(userId, ws)
  logger.info({ userId, totalConnections: connections.size }, 'WebSocket connected')
}

// ── Remove connection ─────────────────────────────────────────────────────────
export function removeConnection(userId: string): void {
  connections.delete(userId)
  logger.info({ userId, totalConnections: connections.size }, 'WebSocket disconnected')
}

// ── Send message to a specific user ──────────────────────────────────────────
export function sendToUser(userId: string, payload: object): boolean {
  const ws = connections.get(userId)
  if (!ws || ws.readyState !== ws.OPEN) {
    logger.info({ userId }, 'WebSocket not connected — skipping push')
    return false
  }

  try {
    ws.send(JSON.stringify(payload))
    return true
  } catch (error) {
    logger.error({ err: error, userId }, 'Failed to send WebSocket message')
    removeConnection(userId)
    return false
  }
}

// ── Send to multiple users ────────────────────────────────────────────────────
export function sendToUsers(userIds: string[], payload: object): void {
  for (const userId of userIds) {
    sendToUser(userId, payload)
  }
}

// ── Get connection count ──────────────────────────────────────────────────────
export function getConnectionCount(): number {
  return connections.size
}

// ── Check if user is connected ────────────────────────────────────────────────
export function isConnected(userId: string): boolean {
  const ws = connections.get(userId)
  return !!ws && ws.readyState === ws.OPEN
}