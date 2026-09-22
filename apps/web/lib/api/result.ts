/**
 * What every Server Action returns. Errors travel as data because Next.js
 * strips the message from errors thrown inside actions in production.
 */
export type ActionResult<T> = { ok: true; data: T } | { ok: false; message: string };

export const ok = <T,>(data: T): ActionResult<T> => ({ ok: true, data });
export const fail = <T,>(message: string): ActionResult<T> => ({ ok: false, message });
