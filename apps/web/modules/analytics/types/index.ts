/** Types the analytics screens use and the API never sees. */

export interface ComparisonRow {
  key: string;
  label: string;
  icon: React.ReactNode;
  posts: number;
  avgReach: number;
  savesPer100: number;
}
