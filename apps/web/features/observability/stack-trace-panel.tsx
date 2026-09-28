import type { FrontendErrorDetail } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";

/** Our code first, in a folded stack: library lines are collapsed to a count. */
export function StackTracePanel({ message, stack, foldedLibraryLines }: { message: string; stack: FrontendErrorDetail["stack"]; foldedLibraryLines: number }) {
  return (
    <Panel>
      <h2 className="type-heading">Where in the code</h2>
      <p className="type-label mt-1 mb-4">Our code first. Library lines are folded.</p>
      <pre className="overflow-x-auto rounded-lg bg-secondary p-4 font-mono text-[0.8125rem] leading-relaxed whitespace-pre-wrap">
        {message}
        {"\n"}
        {stack.map((frame) => `  at ${frame.frame} (${frame.file}:${frame.line}:${frame.column})\n`)}
        {foldedLibraryLines > 0 && <span className="text-muted-foreground">{`  ${foldedLibraryLines} lines from react-dom, folded`}</span>}
      </pre>
    </Panel>
  );
}
