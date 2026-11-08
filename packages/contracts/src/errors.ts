/**
 * Base error for all application errors.
 *
 * Services throw `AppError` subclasses; UI boundaries catch them.
 * Never use a bare `Error` in business logic.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** Thrown by `get…` functions when the item must exist but was not found. */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND');
  }
}

/** Thrown when input fails validation (schema or business rule). */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}
