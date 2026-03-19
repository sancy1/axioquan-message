// src/errors/HttpError.ts

import { AppError } from './AppError.js'

export class HttpError extends AppError {
  constructor(
    statusCode: number,
    message: string,
    code: string = 'HTTP_ERROR'
  ) {
    super(statusCode, message, code)
  }
}