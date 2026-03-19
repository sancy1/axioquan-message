
// src/errors/NotFoundError.ts

import { AppError } from './AppError.js'

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(404, `${resource} not found`, 'NOT_FOUND')
  }
}