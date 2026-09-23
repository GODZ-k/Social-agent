# apps/web/features/onboarding/use-scan.ts

- ScanStatus · type · L9-L9 — type ScanStatus = "idle" | "scanning" | "done" | "error";
- Job · interface · L11-L17 — interface Job
- useScan · function · L27-L78 — function useScan(url: string | null): { status: ScanStatus; step: number; result: ScanResult | null; error: string | null; restart: () => void; }
- report · function · L43-L46 — function report(patch: Partial<Job>)
- poll · function · L48-L56 — async function poll(scanId: string)
- statusOf · function · L80-L85 — function statusOf(url: string | null, job: Job | null): ScanStatus
