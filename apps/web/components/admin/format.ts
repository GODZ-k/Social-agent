/** "Priya" / "Priya and Hannah" / "Priya, Hannah and 2 more". */
export function summarizeNames(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names[0]}, ${names[1]} and ${names.length - 2} more`;
}

/** "Research failed" or "Website scan failed", naming the run that failed instead of a generic count. */
export function failedRunLabel(kind: "research" | "scan"): string {
  return kind === "research" ? "Research failed" : "Website scan failed";
}
