
// pagination.test.ts

import { describe, it, expect } from 'vitest'
import {
  getPaginationParams,
  buildPaginationMeta,
  getPaginatedResponse,
} from '../../src/utils/pagination.js'

describe('getPaginationParams()', () => {
  it('returns defaults when no params provided', () => {
    const result = getPaginationParams()
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.offset).toBe(0)
  })

  it('calculates offset correctly for page 2', () => {
    const result = getPaginationParams({ page: 2, limit: 10 })
    expect(result.offset).toBe(10)
  })

  it('calculates offset correctly for page 3', () => {
    const result = getPaginationParams({ page: 3, limit: 10 })
    expect(result.offset).toBe(20)
  })

  it('caps limit at 100', () => {
    const result = getPaginationParams({ page: 1, limit: 500 })
    expect(result.limit).toBe(100)
  })

  it('enforces minimum limit of 1', () => {
    const result = getPaginationParams({ page: 1, limit: 0 })
    expect(result.limit).toBe(1)
  })

  it('enforces negative limit to 1', () => {
    const result = getPaginationParams({ page: 1, limit: -10 })
    expect(result.limit).toBe(1)
  })

  it('enforces minimum page of 1 for page 0', () => {
    const result = getPaginationParams({ page: 0, limit: 10 })
    expect(result.page).toBe(1)
  })

  it('enforces minimum page of 1 for negative page', () => {
    const result = getPaginationParams({ page: -5, limit: 10 })
    expect(result.page).toBe(1)
  })

  it('handles undefined page', () => {
    const result = getPaginationParams({ limit: 10 })
    expect(result.page).toBe(1)
    expect(result.offset).toBe(0)
  })

  it('handles undefined limit', () => {
    const result = getPaginationParams({ page: 2 })
    expect(result.limit).toBe(20)
    expect(result.offset).toBe(20)
  })
})

describe('buildPaginationMeta()', () => {
  it('hasMore is true when more pages exist', () => {
    const meta = buildPaginationMeta(50, 1, 10)
    expect(meta.hasMore).toBe(true)
  })

  it('hasMore is false on last page', () => {
    const meta = buildPaginationMeta(10, 1, 10)
    expect(meta.hasMore).toBe(false)
  })

  it('hasMore is false when total is less than limit', () => {
    const meta = buildPaginationMeta(5, 1, 10)
    expect(meta.hasMore).toBe(false)
  })

  it('hasMore is false when total is 0', () => {
    const meta = buildPaginationMeta(0, 1, 20)
    expect(meta.hasMore).toBe(false)
  })

  it('returns correct total, page and limit', () => {
    const meta = buildPaginationMeta(100, 3, 20)
    expect(meta.total).toBe(100)
    expect(meta.page).toBe(3)
    expect(meta.limit).toBe(20)
  })

  it('hasMore is true mid-pagination', () => {
    const meta = buildPaginationMeta(100, 3, 20)
    expect(meta.hasMore).toBe(true)
  })
})

describe('getPaginatedResponse()', () => {
  it('returns data and meta together', () => {
    const data = [{ id: '1' }, { id: '2' }]
    const result = getPaginatedResponse(data, 50, { page: 1, limit: 10 })
    expect(result.data).toEqual(data)
    expect(result.meta.total).toBe(50)
    expect(result.meta.hasMore).toBe(true)
  })

  it('returns empty data with correct meta', () => {
    const result = getPaginatedResponse([], 0, { page: 1, limit: 20 })
    expect(result.data).toHaveLength(0)
    expect(result.meta.total).toBe(0)
    expect(result.meta.hasMore).toBe(false)
  })

  it('uses default pagination when no query provided', () => {
    const result = getPaginatedResponse([1, 2, 3], 3)
    expect(result.meta.page).toBe(1)
    expect(result.meta.limit).toBe(20)
  })
})