import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel } from "@repo/ui/components/states";
import { PanelHeader } from "@repo/ui/components/panel-header";
import { PanelStat } from "@repo/ui/components/panel-stat";

export interface RowListColumn<T> {
  header: string;
  align?: "left" | "right";
  /** A fixed track width for a short numeric column; the main column stays `minmax(0,1fr)`. */
  width?: string;
  /** The row's headline value (name, message, task): shown full-width above the rest on a phone, without its own label. Defaults to the first column. */
  main?: boolean;
  render: (row: T) => React.ReactNode;
}

/** Breakpoint classes for the table/card split, keyed so Tailwind sees full class names, not built strings. */
const TABLE_AT = { md: "hidden border-b md:grid", lg: "hidden border-b lg:grid" } as const;
const CELLS_AT = { md: "hidden md:contents", lg: "hidden lg:contents" } as const;
const CARD_BELOW = { md: "flex flex-col gap-2.5 py-3.5 md:hidden", lg: "flex flex-col gap-2.5 py-3.5 lg:hidden" } as const;
const ROW_AT = { md: "border-b md:grid md:items-center", lg: "border-b lg:grid lg:items-center" } as const;

/**
 * One small table shape reused across every observability list (routes, jobs,
 * services, errors, runs): a header row plus data rows, each row a link when
 * `href` resolves to one. Each row is its own grid, so its divider always
 * spans the full row. Below `cardBelow` (`md` by default; `lg` for a table
 * with columns too wide to fit at `md`, like Recent runs) a row becomes a
 * labelled card instead of a table that scrolls sideways, matching the
 * design; the main column (name, message, task) gets a wider share of the
 * track than the numeric columns beside it, unless a column sets its own
 * fixed `width`.
 */
export function RowList<T>({
  columns,
  rows,
  rowKey,
  href,
  cardBelow = "md",
}: {
  columns: RowListColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  href?: (row: T) => string | undefined;
  cardBelow?: "md" | "lg";
}) {
  const mainColumn = columns.find((col) => col.main) ?? columns[0];
  const cardColumns = columns.filter((col) => col !== mainColumn);
  const tracks = columns.map((col) => col.width ?? (col === mainColumn ? "minmax(0,3fr)" : "minmax(0,1fr)")).join(" ");
  const gridCols = href ? `${tracks} 1.25rem` : tracks;

  return (
    <div>
      <div className={TABLE_AT[cardBelow]} style={{ gridTemplateColumns: gridCols }}>
        {columns.map((col) => (
          <div key={col.header} className={cn("type-label px-3 py-2", col.align === "right" && "text-right")}>
            {col.header}
          </div>
        ))}
        {href && <div />}
      </div>
      {rows.map((row) => {
        const target = href?.(row);
        const cells = (
          <>
            <div className={CELLS_AT[cardBelow]}>
              {columns.map((col) => (
                <div
                  key={col.header}
                  className={cn(
                    "flex min-w-0 items-center px-3 py-2.5 text-sm",
                    col.align === "right" && "justify-end text-right",
                  )}
                >
                  {col.render(row)}
                </div>
              ))}
              {href && (
                <div className="flex items-center justify-center px-1 py-2.5 text-muted-foreground">
                  {target && <ChevronRight className="size-4" />}
                </div>
              )}
            </div>
            <div className={CARD_BELOW[cardBelow]}>
              <div className="text-sm font-medium">{mainColumn?.render(row)}</div>
              <div className="grid grid-cols-3 gap-x-3 gap-y-2.5">
                {cardColumns.map((col) => (
                  <div key={col.header} className="min-w-0">
                    <p className="type-label truncate">{col.header}</p>
                    <p className="mt-0.5 truncate text-sm">{col.render(row)}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
        const rowClassName = cn(ROW_AT[cardBelow], target && "hover:bg-tint/60");
        return target ? (
          <Link key={rowKey(row)} href={target} className={rowClassName} style={{ gridTemplateColumns: gridCols }}>
            {cells}
          </Link>
        ) : (
          <div key={rowKey(row)} className={rowClassName} style={{ gridTemplateColumns: gridCols }}>
            {cells}
          </div>
        );
      })}
    </div>
  );
}

/**
 * A titled panel whose whole body is one `RowList`: the shape most observability panels have, so
 * they carry only their columns and their one headline number. A panel that needs anything else in
 * the body — a filter, a footer note, a link out — composes `Panel`, `PanelHeader` and `RowList`
 * itself rather than growing a slot prop here.
 */
export function ListPanel<T>({
  title,
  description,
  stat,
  columns,
  rows,
  rowKey,
  href,
  cardBelow,
}: {
  title: string;
  description: string;
  stat?: { value: React.ReactNode; caption: string };
  columns: RowListColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  href?: (row: T) => string | undefined;
  cardBelow?: "md" | "lg";
}) {
  return (
    <Panel>
      <PanelHeader title={title} description={description} right={stat && <PanelStat value={stat.value} caption={stat.caption} />} />
      <RowList columns={columns} rows={rows} rowKey={rowKey} href={href} cardBelow={cardBelow} />
    </Panel>
  );
}
