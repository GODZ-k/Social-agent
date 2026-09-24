import type { BrandKit } from "@social-agent/shared";
import { Panel } from "@repo/ui/components/states";

export function BrandKitSummary({ brand }: { brand: BrandKit }) {
  return (
    <Panel aria-labelledby="brand-heading">
      <h2 id="brand-heading" className="type-heading mb-5">Brand kit</h2>
      <div className="grid gap-7 md:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="max-w-[62ch]">{brand.summary}</p>
          <p className="type-label mt-4">Written for</p>
          <p>{brand.audience}</p>
          <p className="type-label mt-4">Sounds</p>
          <p>{brand.voice.join(", ")}</p>
        </div>
        <div>
          <ul className="flex overflow-hidden rounded-lg ring-1 ring-border">
            {brand.colors.map((c) => (
              <li key={c.hex} className="h-16 flex-1" style={{ background: c.hex }} title={`${c.name} ${c.hex}`} />
            ))}
          </ul>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
            {brand.colors.map((c) => (
              <li key={c.hex} className="flex items-baseline justify-between gap-2 text-[0.8125rem]">
                <span className="truncate">{c.name}</span>
                <span className="text-muted-foreground uppercase tabular-nums">{c.hex}</span>
              </li>
            ))}
          </ul>
          <p className="type-label mt-4">Typefaces</p>
          <p>{[...new Set([brand.fonts.heading, brand.fonts.body])].join(" with ")}</p>
        </div>
      </div>
    </Panel>
  );
}
