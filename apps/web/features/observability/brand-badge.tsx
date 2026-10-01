import { avatarColor } from "./format";

/** A client's initial in a coloured circle, then its name. */
export function BrandBadge({ name }: { name: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span aria-hidden className="grid size-5 shrink-0 place-items-center rounded-full text-[0.625rem] font-semibold text-white" style={{ background: avatarColor(name) }}>
        {name.charAt(0)}
      </span>
      {name}
    </span>
  );
}
