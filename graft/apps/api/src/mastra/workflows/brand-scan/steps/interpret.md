# apps/api/src/mastra/workflows/brand-scan/steps/interpret.ts

- BrandAnalystAgent · type · L11-L11 — type BrandAnalystAgent = Pick<typeof brandAnalyst, "generate">;
- assemble · function · L14-L31 — function assemble(analysis: BrandAnalysis, facts: SiteFacts): ScanResult
- isAnswerRejected · function · L47-L51 — function isAnswerRejected(error: unknown): error is Error
- analyse · function · L54-L59 — async function analyse(agent: BrandAnalystAgent, prompt: string): Promise<BrandAnalysis>
- rejectionNote · function · L61-L63 — function rejectionNote(error: Error): string
- analyseWithOneRetry · function · L69-L81 — async function analyseWithOneRetry( agent: BrandAnalystAgent, prompt: string, onRejected: (message: string) => void, ): Promise<BrandAnalysis>
