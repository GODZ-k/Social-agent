# apps/api/src/mastra/workflows/brand-scan/run.ts

- RunBrandScanOptions · type · L8-L11 — type RunBrandScanOptions = { /** Called as each step starts. Phase 2 writes brand_scans.current_step from here. */ onStep?: (step: ScanStepId) => void | Promise<void>; };
- runBrandScan · function · L17-L38 — async function runBrandScan(input: string, options: RunBrandScanOptions = {}): Promise<ScanOutcome>
