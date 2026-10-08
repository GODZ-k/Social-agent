import { ChevronDown, Globe, MessagesSquare, Search, Users } from "lucide-react";
import type { ResearchView } from "@/lib/types";
import { Panel } from "@repo/ui/components/states";

type Source = ResearchView["sources"][number];

const KIND_ICON: Record<Source["kind"], typeof Globe> = {
  website: Globe,
  reviews: MessagesSquare,
  answers: Users,
  search: Search,
  similar_brand: Globe,
};

const VISIBLE = 5;

const displayUrl = (url: string) => url.replace(/^https?:\/\//, "");

/** S21 "Sources": everything the research read, most useful first, the rest behind "Show all". */
export function SourcesPanel({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;
  const shown = sources.slice(0, VISIBLE);
  const rest = sources.slice(VISIBLE);

  return (
    <Panel aria-labelledby="sources-heading">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 id="sources-heading" className="type-heading">Sources</h2>
          <p className="type-label mt-0.5">Everything the agent read. Open any one to check it.</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="type-number text-2xl leading-none">{sources.length}</p>
          <p className="type-label mt-1">Sources</p>
        </div>
      </div>
      <ul className="divide-y divide-border">
        {shown.map((source) => (
          <SourceRow key={source.url} source={source} />
        ))}
      </ul>
      {rest.length > 0 && (
        <details className="group mt-1">
          <summary className="pressable -ml-1 inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full py-2 pl-1 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
            Show all {sources.length}
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <ul className="divide-y divide-border">
            {rest.map((source) => (
              <SourceRow key={source.url} source={source} />
            ))}
          </ul>
        </details>
      )}
    </Panel>
  );
}

function SourceRow({ source }: { source: Source }) {
  const Icon = KIND_ICON[source.kind];
  const isLink = source.url.startsWith("http");

  return (
    <li className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0 max-[560px]:grid-cols-[2.25rem_minmax(0,1fr)]">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="font-medium">{source.title}</p>
        {isLink ? (
          <a href={source.url} target="_blank" rel="noreferrer" className="block truncate text-[0.8125rem] text-tint-foreground underline underline-offset-2">
            {displayUrl(source.url)}
          </a>
        ) : (
          <p className="truncate text-[0.8125rem] text-muted-foreground">{displayUrl(source.url)}</p>
        )}
      </div>
      <span className="type-label max-w-[14rem] shrink-0 text-right max-[560px]:col-start-2 max-[560px]:max-w-none max-[560px]:text-left">{source.note}</span>
    </li>
  );
}
