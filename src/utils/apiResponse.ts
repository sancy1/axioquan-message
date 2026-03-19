
// src/utils/apiResponse.ts

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface SuccessResponse<T> {
  success: true
  message: string
  data: T
  meta: PaginationMeta | null
}

export interface ErrorResponse {
  success: false
  error: {
    message: string
    code: string
    fields?: Record<string, string[]>
  }
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// ── Success response factory ──────────────────────────────────────────────────

export function success<T>(
  data: T,
  message: string = 'OK',
  meta: PaginationMeta | null = null
): SuccessResponse<T> {
  return {
    success: true,
    message,
    data,
    meta,
  }
}

// ── Created response factory (201) ────────────────────────────────────────────

export function created<T>(
  data: T,
  message: string = 'Created successfully'
): SuccessResponse<T> {
  return {
    success: true,
    message,
    data,
    meta: null,
  }
}

// ── Error response factory ────────────────────────────────────────────────────

export function errorResponse(
  message: string,
  code: string,
  fields?: Record<string, string[]>
): ErrorResponse {
  return {
    success: false,
    error: {
      message,
      code,
      ...(fields && { fields }),
    },
  }
}

// ── No content response (for deletes) ────────────────────────────────────────

export function noContent(): SuccessResponse<null> {
  return {
    success: true,
    message: 'Deleted successfully',
    data: null,
    meta: null,
  }
}