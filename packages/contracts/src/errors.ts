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

/** Thrown when the CMS is unreachable or returns a non-2xx status. */
export class CmsUnavailableError extends AppError {
  constructor(
    public readonly status: number,
    public readonly path: string,
  ) {
    super(`CMS responded with status ${status} for ${path}`, 'CMS_UNAVAILABLE');
  }
}
