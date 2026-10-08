import type { Platform, PostFormat } from "@social-agent/shared";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { FORMAT_NAME } from "@repo/ui/components/social/format-badge";

interface Props {
  platform: Platform;
  format: PostFormat;
  /** "5 slides" or "45 seconds", from `formatDetail`, when the format carries a count. */
  detail: string | null;
}

/** Table cell: icon, "Instagram reel", and its detail when the format carries one. Same fields
 * as `PlatformFormatLine`, laid out for a table row rather than a card. */
export function PlatformFormatCell({ platform, format, detail }: Props) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <PlatformIcon platform={platform} className="text-muted-foreground" />
      <span>
        <b className="font-medium">
          {PLATFORM_LABEL[platform]} {FORMAT_NAME[format].toLowerCase()}
        </b>
        {detail && <span className="text-muted-foreground">, {detail}</span>}
      </span>
    </span>
  );
}

/** Card row: same platform, format and detail as `PlatformFormatCell`, on one compact line. */
export function PlatformFormatLine({ platform, format, detail }: Props) {
  return (
    <span className="flex items-center gap-1.5 text-sm">
      <PlatformIcon platform={platform} className="size-3.5 text-muted-foreground" />
      <b className="font-medium">
        {PLATFORM_LABEL[platform]} {FORMAT_NAME[format].toLowerCase()}
      </b>
      {detail && <span className="text-muted-foreground">, {detail}</span>}
    </span>
  );
}
