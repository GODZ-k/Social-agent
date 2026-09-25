const TIMEOUT_MS = 15_000;

/** The network's message, never a token. */
export class SocialConnectError extends Error {
  readonly status: number;

  constructor(network: string, status: number, message: string) {
    super(`${network} answered ${status}: ${message}`);
    this.name = "SocialConnectError";
    this.status = status;
  }
}

export async function postForm(network: string, url: string, form: URLSearchParams): Promise<unknown> {
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  const response = await fetch(url, { method: "POST", body: form, signal });
  return readJson(network, response);
}

export async function getJson(network: string, url: string, query: Record<string, string>): Promise<unknown> {
  const target = new URL(url);
  target.search = new URLSearchParams(query).toString();
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  const response = await fetch(target, { signal });
  return readJson(network, response);
}

async function readJson(network: string, response: Response): Promise<unknown> {
  const body: unknown = await response.json().catch(() => undefined);
  if (response.ok) return body;
  throw new SocialConnectError(network, response.status, errorMessage(body));
}

// Meta: `error_message` or `error.message`. OAuth 2 networks: `error_description`.
function errorMessage(body: unknown): string {
  const record = (body ?? {}) as { error_message?: unknown; error_description?: unknown; error?: { message?: unknown } };
  const message = record.error_message ?? record.error_description ?? record.error?.message;
  return typeof message === "string" ? message : "no details";
}
