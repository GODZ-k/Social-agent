# apps/web/features/agent/agent-connection.ts

- setAgentContext · function · L16-L18 — setAgentContext = (client: Client | undefined)
- delay · function · L20-L25 — function delay(ms: number, signal?: AbortSignal)
- lastUserText · function · L27-L35 — function lastUserText(messages: readonly unknown[]): string
- reply · function · L37-L59 — function reply(question: string): string
- run · function · L61-L73 — async function* run(text: string, threadId: string, runId: string, signal?: AbortSignal): AsyncGenerator<StreamChunk>
- connect · method · L77-L79 — connect(messages, _data, abortSignal, runContext)
