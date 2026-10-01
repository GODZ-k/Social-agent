/**
 * A fresh, unshared copy of a mock record, so a caller can never mutate what the
 * store holds. `server.ts` and `actions.ts` both return through this before
 * handing a record to a component or a brand.
 */
export function clone<T>(record: T): T {
  return structuredClone(record);
}
