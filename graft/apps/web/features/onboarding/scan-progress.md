# apps/web/features/onboarding/scan-progress.tsx

- ScanProgress · function · L13-L60 — function ScanProgress({ url, activeIndex }: { url: string; activeIndex: number })
- StepState · type · L62-L62 — type StepState = "done" | "active" | "waiting";
- stepState · function · L64-L67 — function stepState(index: number, activeIndex: number): StepState
- markerTone · function · L69-L72 — function markerTone(state: StepState): string
- marker · function · L74-L84 — function marker(state: StepState)
