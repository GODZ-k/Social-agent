# apps/web/lib/api/result.ts

- ActionResult · type · L5-L5 — type ActionResult<T> = { ok: true; data: T } | { ok: false; message: string };
- ok · function · L7-L7 — ok = <T,>(data: T): ActionResult<T>
- fail · function · L8-L8 — fail = <T,>(message: string): ActionResult<T>
