# @repo/ui

The shared design system: tokens, primitives, motion and theme helpers, plus the product's presentational components. Consumed as TypeScript source by the apps (no build step).

Read [`apps/web/DESIGN.md`](../../apps/web/DESIGN.md) before changing anything here. Section 14 covers what belongs in this package, the rules for code inside it, and how a new app adopts it.

```ts
import { Button } from "@repo/ui/components/button";
import { PostArt } from "@repo/ui/components/social/post-art";
import { spring } from "@repo/ui/lib/motion";
```
