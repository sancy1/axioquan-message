
// src/utils/pagination.ts

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface PaginationResult {
  page: number
  limit: number
  offset: number
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100
const MIN_LIMIT = 1
const MIN_PAGE = 1

// ── getPaginationParams ───────────────────────────────────────────────────────
// Accepts raw query params (potentially undefined or invalid)
// Returns safe, validated page/limit/offset values for SQL queries

export function getPaginationParams(
  query: Partial<PaginationParams> = {}
): PaginationResult {
  const page = Math.max(MIN_PAGE, Math.floor(query.page ?? DEFAULT_PAGE))
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(MIN_LIMIT, Math.floor(query.limit ?? DEFAULT_LIMIT))
  )
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

// ── buildPaginationMeta ───────────────────────────────────────────────────────
// Builds the meta object returned to the client in every list response

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  return {
    total,
    page,
    limit,
    hasMore: page * limit < total,
  }
}

// ── getPaginatedResponse ──────────────────────────────────────────────────────
// Convenience function — combines both above into one call
// Used directly in repositories that return total + rows together

export function getPaginatedResponse<T>(
  data: T[],
  total: number,
  query: Partial<PaginationParams> = {}
): { data: T[]; meta: PaginationMeta } {
  const { page, limit } = getPaginationParams(query)
  const meta = buildPaginationMeta(total, page, limit)
  return { data, meta }
}
