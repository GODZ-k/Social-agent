export function OrDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5 text-[0.8125rem] text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
      {children}
    </div>
  );
}
