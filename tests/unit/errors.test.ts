
// tests/unit/errors.test.ts

import { describe, it, expect } from 'vitest'
import { AppError } from '../../src/errors/AppError.js'
import { HttpError } from '../../src/errors/HttpError.js'
import { NotFoundError } from '../../src/errors/NotFoundError.js'
import { ValidationError } from '../../src/errors/ValidationError.js'

describe('AppError', () => {
  it('sets statusCode, message and code correctly', () => {
    const error = new AppError(400, 'Bad request', 'BAD_REQUEST')
    expect(error.statusCode).toBe(400)
    expect(error.message).toBe('Bad request')
    expect(error.code).toBe('BAD_REQUEST')
  })

  it('defaults code to APP_ERROR', () => {
    const error = new AppError(500, 'Something broke')
    expect(error.code).toBe('APP_ERROR')
  })

  it('is an instance of Error', () => {
    const error = new AppError(400, 'test')
    expect(error).toBeInstanceOf(Error)
  })

  it('isOperational defaults to true', () => {
    const error = new AppError(400, 'test')
    expect(error.isOperational).toBe(true)
  })

  it('name equals class name', () => {
    const error = new AppError(400, 'test')
    expect(error.name).toBe('AppError')
  })
})

describe('HttpError', () => {
  it('extends AppError', () => {
    const error = new HttpError(401, 'Unauthorised')
    expect(error).toBeInstanceOf(AppError)
  })

  it('sets statusCode correctly', () => {
    const error = new HttpError(403, 'Forbidden', 'FORBIDDEN')
    expect(error.statusCode).toBe(403)
    expect(error.code).toBe('FORBIDDEN')
  })

  it('defaults code to HTTP_ERROR', () => {
    const error = new HttpError(500, 'Server error')
    expect(error.code).toBe('HTTP_ERROR')
  })
})

describe('NotFoundError', () => {
  it('statusCode is 404', () => {
    const error = new NotFoundError()
    expect(error.statusCode).toBe(404)
  })

  it('code is NOT_FOUND', () => {
    const error = new NotFoundError()
    expect(error.code).toBe('NOT_FOUND')
  })

  it('includes resource name in message', () => {
    const error = new NotFoundError('Conversation')
    expect(error.message).toBe('Conversation not found')
  })

  it('defaults resource to Resource', () => {
    const error = new NotFoundError()
    expect(error.message).toBe('Resource not found')
  })
})

describe('ValidationError', () => {
  it('statusCode is 422', () => {
    const error = new ValidationError({ email: ['Invalid email'] })
    expect(error.statusCode).toBe(422)
  })

  it('code is VALIDATION_ERROR', () => {
    const error = new ValidationError({})
    expect(error.code).toBe('VALIDATION_ERROR')
  })

  it('carries fields object', () => {
    const fields = { email: ['Required'], name: ['Too short'] }
    const error = new ValidationError(fields)
    expect(error.fields).toEqual(fields)
  })

  it('extends AppError', () => {
    const error = new ValidationError({})
    expect(error).toBeInstanceOf(AppError)
  })
})