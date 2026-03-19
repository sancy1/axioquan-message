
// tests/unit/apiResponse.test.ts

import { describe, it, expect } from 'vitest'
import {
  success,
  created,
  errorResponse,
  noContent,
} from '../../src/utils/apiResponse.js'

describe('success()', () => {
  it('returns success: true', () => {
    const result = success({ id: '123' })
    expect(result.success).toBe(true)
  })

  it('returns data correctly', () => {
    const data = { id: '123', name: 'Test' }
    const result = success(data)
    expect(result.data).toEqual(data)
  })

  it('defaults message to OK', () => {
    const result = success({})
    expect(result.message).toBe('OK')
  })

  it('accepts custom message', () => {
    const result = success({}, 'Fetched successfully')
    expect(result.message).toBe('Fetched successfully')
  })

  it('defaults meta to null', () => {
    const result = success([])
    expect(result.meta).toBeNull()
  })

  it('accepts pagination meta', () => {
    const meta = { total: 50, page: 1, limit: 10, hasMore: true }
    const result = success([], 'OK', meta)
    expect(result.meta).toEqual(meta)
  })

  it('works with array data', () => {
    const result = success([1, 2, 3])
    expect(result.data).toHaveLength(3)
  })

  it('works with null data', () => {
    const result = success(null)
    expect(result.data).toBeNull()
  })
})

describe('created()', () => {
  it('returns success: true', () => {
    const result = created({ id: '123' })
    expect(result.success).toBe(true)
  })

  it('defaults message to Created successfully', () => {
    const result = created({})
    expect(result.message).toBe('Created successfully')
  })

  it('returns data correctly', () => {
    const data = { id: '123' }
    const result = created(data)
    expect(result.data).toEqual(data)
  })

  it('meta is always null', () => {
    const result = created({})
    expect(result.meta).toBeNull()
  })
})

describe('errorResponse()', () => {
  it('returns success: false', () => {
    const result = errorResponse('Not found', 'NOT_FOUND')
    expect(result.success).toBe(false)
  })

  it('returns message and code', () => {
    const result = errorResponse('Not found', 'NOT_FOUND')
    expect(result.error.message).toBe('Not found')
    expect(result.error.code).toBe('NOT_FOUND')
  })

  it('fields is undefined when not provided', () => {
    const result = errorResponse('Error', 'ERROR')
    expect(result.error.fields).toBeUndefined()
  })

  it('includes fields when provided', () => {
    const fields = { email: ['Invalid email format'] }
    const result = errorResponse('Validation failed', 'VALIDATION_ERROR', fields)
    expect(result.error.fields).toEqual(fields)
  })
})

describe('noContent()', () => {
  it('returns success: true', () => {
    const result = noContent()
    expect(result.success).toBe(true)
  })

  it('data is null', () => {
    const result = noContent()
    expect(result.data).toBeNull()
  })

  it('message is Deleted successfully', () => {
    const result = noContent()
    expect(result.message).toBe('Deleted successfully')
  })

  it('meta is null', () => {
    const result = noContent()
    expect(result.meta).toBeNull()
  })
})
