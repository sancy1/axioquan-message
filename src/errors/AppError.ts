
// src/errors/AppError.ts

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean

  constructor(
    statusCode: number,
    message: string,
    code: string = 'APP_ERROR',
    isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational

    // Maintains proper stack trace in V8
    Error.captureStackTrace(this, this.constructor)
  }
}