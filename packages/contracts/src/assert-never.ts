/**
 * Exhaustiveness check for discriminated unions.
 *
 * Called in the `default` branch of a `switch` over a union — if a new
 * variant is added without a matching case, TypeScript flags it as
 * unreachable `never` and this throws at runtime.
 */
export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(x)} — this should never happen.`);
}
