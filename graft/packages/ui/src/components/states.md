# packages/ui/src/components/states.tsx

- PageHeader · function · L5-L23 — function PageHeader({ title, description, actions, }: { title: string; description?: string; actions?: React.ReactNode; })
- Panel · function · L25-L27 — function Panel({ className, ...props }: React.ComponentProps<"section">)
- ErrorState · function · L30-L43 — function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void })
- EmptyState · function · L45-L64 — function EmptyState({ icon, title, description, action, }: { icon?: React.ReactNode; title: string; description: string; action?: React.ReactNode; })
- SkeletonRows · function · L66-L74 — function SkeletonRows({ rows = 4, className }: { rows?: number; className?: string })
