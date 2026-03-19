
// tests/unit/websocket.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  registerConnection,
  removeConnection,
  sendToUser,
  sendToUsers,
  getConnectionCount,
  isConnected,
} from '../../src/websocket/websocket.manager.js'
import { WS_EVENTS } from '../../src/websocket/websocket.handler.js'

// ── Mock WebSocket ────────────────────────────────────────────────────────────
function mockWebSocket(readyState = 1) {
  return {
    readyState,
    OPEN: 1,
    send:  vi.fn(),
    close: vi.fn(),
    on:    vi.fn(),
  }
}

describe('WebSocket Manager', () => {
  beforeEach(() => {
    // Clean up all connections between tests
    removeConnection('user-1')
    removeConnection('user-2')
    removeConnection('user-3')
    vi.clearAllMocks()
  })

  describe('registerConnection()', () => {
    it('registers a new connection', () => {
      const ws = mockWebSocket()
      registerConnection('user-1', ws as never)
      expect(isConnected('user-1')).toBe(true)
    })

    it('increments connection count', () => {
      const before = getConnectionCount()
      const ws = mockWebSocket()
      registerConnection('user-2', ws as never)
      expect(getConnectionCount()).toBe(before + 1)
    })

    it('replaces existing connection for same user', () => {
      const ws1 = mockWebSocket()
      const ws2 = mockWebSocket()
      registerConnection('user-1', ws1 as never)
      registerConnection('user-1', ws2 as never)
      expect(getConnectionCount()).toBe(1)
    })
  })

  describe('removeConnection()', () => {
    it('removes an existing connection', () => {
      const ws = mockWebSocket()
      registerConnection('user-1', ws as never)
      removeConnection('user-1')
      expect(isConnected('user-1')).toBe(false)
    })

    it('decrements connection count', () => {
      const ws = mockWebSocket()
      registerConnection('user-1', ws as never)
      const before = getConnectionCount()
      removeConnection('user-1')
      expect(getConnectionCount()).toBe(before - 1)
    })

    it('does not throw when removing non-existent connection', () => {
      expect(() => removeConnection('non-existent')).not.toThrow()
    })
  })

  describe('sendToUser()', () => {
    it('sends message to connected user', () => {
      const ws = mockWebSocket()
      registerConnection('user-1', ws as never)
      const sent = sendToUser('user-1', { type: WS_EVENTS.PING })
      expect(sent).toBe(true)
      expect(ws.send).toHaveBeenCalledWith(
        JSON.stringify({ type: WS_EVENTS.PING })
      )
    })

    it('returns false when user is not connected', () => {
      const sent = sendToUser('non-connected-user', { type: WS_EVENTS.PING })
      expect(sent).toBe(false)
    })

    it('returns false when WebSocket is not open', () => {
      const ws = mockWebSocket(3) // 3 = CLOSED
      registerConnection('user-1', ws as never)
      const sent = sendToUser('user-1', { type: WS_EVENTS.PING })
      expect(sent).toBe(false)
    })

    it('sends JSON stringified payload', () => {
      const ws = mockWebSocket()
      registerConnection('user-1', ws as never)
      const payload = { type: WS_EVENTS.MESSAGE, payload: { messageId: 'abc' } }
      sendToUser('user-1', payload)
      expect(ws.send).toHaveBeenCalledWith(JSON.stringify(payload))
    })
  })

  describe('sendToUsers()', () => {
    it('sends to multiple connected users', () => {
      const ws1 = mockWebSocket()
      const ws2 = mockWebSocket()
      registerConnection('user-1', ws1 as never)
      registerConnection('user-2', ws2 as never)
      sendToUsers(['user-1', 'user-2'], { type: WS_EVENTS.PING })
      expect(ws1.send).toHaveBeenCalledTimes(1)
      expect(ws2.send).toHaveBeenCalledTimes(1)
    })

    it('skips disconnected users silently', () => {
      const ws1 = mockWebSocket()
      registerConnection('user-1', ws1 as never)
      expect(() =>
        sendToUsers(['user-1', 'disconnected-user'], { type: WS_EVENTS.PING })
      ).not.toThrow()
      expect(ws1.send).toHaveBeenCalledTimes(1)
    })
  })

  describe('isConnected()', () => {
    it('returns true for connected user', () => {
      const ws = mockWebSocket()
      registerConnection('user-1', ws as never)
      expect(isConnected('user-1')).toBe(true)
    })

    it('returns false for disconnected user', () => {
      expect(isConnected('never-connected')).toBe(false)
    })
  })

  describe('WS_EVENTS constants', () => {
    it('has correct event type strings', () => {
      expect(WS_EVENTS.MESSAGE).toBe('message')
      expect(WS_EVENTS.DELIVERED).toBe('delivered')
      expect(WS_EVENTS.READ).toBe('read')
      expect(WS_EVENTS.PING).toBe('ping')
      expect(WS_EVENTS.PONG).toBe('pong')
      expect(WS_EVENTS.CONNECTED).toBe('connected')
      expect(WS_EVENTS.ERROR).toBe('error')
    })
  })
})