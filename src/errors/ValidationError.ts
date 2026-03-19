
// src/errors/ValidationError.ts

import { AppError } from './AppError.js'

export interface ValidationFields {
  [field: string]: string[]
}

export class ValidationError extends AppError {
  public readonly fields: ValidationFields

  constructor(fields: ValidationFields) {
    super(422, 'Validation failed', 'VALIDATION_ERROR')
    this.fields = fields
  }
}