# apps/api/src/scan/types.ts

- ScanStepId · type · L11-L11 — type ScanStepId = (typeof SCAN_STEP_IDS)[number];
- ScanErrorCode · type · L21-L21 — type ScanErrorCode = z.infer<typeof scanErrorCodeSchema>;
- ScanError · class · L34-L42 — class ScanError extends Error
- constructor · method · L35-L41 — constructor( public readonly code: ScanErrorCode, message: string = SCAN_MESSAGES[code], )
- ScanFailure · type · L58-L58 — type ScanFailure = z.infer<typeof scanFailureSchema>;
- ScanSuccess · type · L59-L59 — type ScanSuccess = z.infer<typeof scanSuccessSchema>;
- ScanOutcome · type · L60-L60 — type ScanOutcome = z.infer<typeof scanOutcomeSchema>;
- PageFacts · type · L84-L84 — type PageFacts = z.infer<typeof pageFactsSchema>;
- StyleFacts · type · L91-L91 — type StyleFacts = z.infer<typeof styleFactsSchema>;
- SiteFacts · type · L102-L102 — type SiteFacts = z.infer<typeof siteFactsSchema>;
- Discovery · type · L113-L113 — type Discovery = z.infer<typeof discoverySchema>;
