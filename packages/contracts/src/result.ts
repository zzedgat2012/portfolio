/** Success branch of a Result. */
type Success<T> = { readonly success: true; readonly data: T };

/** Failure branch of a Result. */
type Failure<E> = { readonly success: false; readonly error: E };

/**
 * Discriminated union for expected failures in pure code.
 *
 * Use `ok` and `err` to construct, `isOk` / `isErr` to narrow.
 * Throw `AppError` subclasses for unexpected failures instead.
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/** Create a success result. */
export function ok<T>(data: T): Success<T> {
  return { success: true, data };
}

/** Create a failure result. */
export function err<E>(error: E): Failure<E> {
  return { success: false, error };
}

/** Type guard: narrows to the success branch. */
export function isOk<T, E>(result: Result<T, E>): result is Success<T> {
  return result.success;
}

/** Type guard: narrows to the failure branch. */
export function isErr<T, E>(result: Result<T, E>): result is Failure<E> {
  return !result.success;
}
