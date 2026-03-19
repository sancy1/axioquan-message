
// tests/unit/logger.test.ts:

import { describe, it, expect } from 'vitest'
import { logger } from '../../src/utils/logger.js'

describe('Logger', () => {
  it('logger instance is defined', () => {
    expect(logger).toBeDefined()
  })

  it('logger has required log methods', () => {
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.debug).toBe('function')
  })

  it('logger.info does not throw', () => {
    expect(() => logger.info('test log message')).not.toThrow()
  })

  it('logger.error does not throw', () => {
    expect(() => logger.error('test error message')).not.toThrow()
  })

  it('logger.warn does not throw', () => {
    expect(() => logger.warn('test warn message')).not.toThrow()
  })

  it('logger has a level property', () => {
    expect(logger.level).toBeDefined()
    expect(typeof logger.level).toBe('string')
  })
})

