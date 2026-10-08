/** Types the observability screens use and the API never sees. */

export interface RowListColumn<T> {
  header: string;
  align?: "left" | "right";
  /** A fixed track width for a short numeric column; the main column stays `minmax(0,1fr)`. */
  width?: string;
  /** The row's headline value (name, message, task): shown full-width above the rest on a phone, without its own label. Defaults to the first column. */
  main?: boolean;
  render: (row: T) => React.ReactNode;
}
