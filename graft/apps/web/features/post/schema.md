# apps/web/features/post/schema.ts

- Values · type · L21-L21 — type Values = z.infer<typeof schema>;
- toValues · function · L23-L30 — toValues = (post: Post): Values
- toPatch · function · L33-L42 — function toPatch(values: Values, status?: PostStatus): PostPatch
