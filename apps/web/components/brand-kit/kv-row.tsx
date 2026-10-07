import { Globe } from "lucide-react";

/** One label/value row inside a read-only brand-kit card ("Name", "Tagline", …). `source` shows where the scan found it; omit it when the fact has no known source. */
export function KvRow({ label, source, children }: { label: string; source?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t py-2.5 first:border-t-0 first:pt-0 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-3">
      <span className="type-label">{label}</span>
      <div>
        {children}
        {source && (
          <p className="type-label mt-1 flex items-center gap-1 text-[0.72rem]">
            <Globe className="size-3" />
            {source}
          </p>
        )}
      </div>
    </div>
  );
}
