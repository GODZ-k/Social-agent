import { Calendar } from "lucide-react";
import { PLATFORM_LABEL } from "./platform-names";
import { PlatformIcon } from "./platform";
import { FORMAT_ICON, FORMAT_NAME } from "./format-badge";
import { postDetail, type PostKindFields } from "./post-kind";
import { cn } from "../../lib/utils";

interface Props extends PostKindFields {
  /** "Thu 1 Oct, 1:00 PM"; omit on a panel that shows the date elsewhere ("Goes out"). */
  date?: string;
  /** Jumps to the schedule field instead of just labelling the date. */
  dateHref?: string;
  /** The viewer's dark stage needs light-on-dark chips instead of the app's tinted ones. */
  tone?: "light" | "dark";
  size?: "default" | "sm";
  className?: string;
  /** A status badge or similar, appended to the same row. */
  children?: React.ReactNode;
}

/** Platform, format and (optionally) date as pills: how every review surface names a post. */
export function PostFacts({ platform, format, slides, durationSec, date, dateHref, tone = "light", size = "default", className, children }: Props) {
  const FormatIcon = FORMAT_ICON[format];
  const detail = postDetail({ platform, format, slides, durationSec });
  const chip = size === "sm" ? "gap-1 px-2.5 py-1 text-xs" : "gap-1.5 px-3 py-[0.3125rem] text-[0.8125rem]";
  const strong = cn(
    "inline-flex items-center rounded-full font-semibold",
    tone === "dark" ? "bg-white/20 text-white" : "bg-tint text-tint-foreground",
    chip,
  );
  const plain = cn(
    "inline-flex items-center rounded-full",
    tone === "dark" ? "bg-white/10 text-white/80" : "bg-secondary text-foreground",
    chip,
  );
  const DateTag = dateHref ? "a" : "span";

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <span className={strong}>
        <PlatformIcon platform={platform} className="size-3.5" />
        {PLATFORM_LABEL[platform]}
      </span>
      <span className={strong}>
        <FormatIcon aria-hidden className="size-3.5" />
        {FORMAT_NAME[format]}
        {detail && `, ${detail}`}
      </span>
      {date && (
        <DateTag {...(dateHref ? { href: dateHref } : {})} className={cn(plain, dateHref && "hover:opacity-80")}>
          <Calendar className="size-3.5" /> {date}
        </DateTag>
      )}
      {children}
    </div>
  );
}
