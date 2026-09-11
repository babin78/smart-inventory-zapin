const PREFIX = '[check-api]';
const MAX_LINES = 16;
const logs: string[] = [];

export function getApiDebugText(): string {
  return logs.join('\n');
}

export function logApi(event: string, payload: Record<string, unknown> = {}): void {
  const status = typeof payload.status === 'string' ? payload.status : payload.ok === false ? 'error' : payload.ok === true ? 'success' : undefined;
  const line = JSON.stringify({
    t: new Date().toISOString().slice(11, 23),
    event,
    ...(status ? { status } : {}),
    ...payload,
  });
  logs.push(line);
  if (logs.length > MAX_LINES) {
    logs.shift();
  }
  console.log(PREFIX, line);
}

export function redactRequestBody(body: object): Record<string, unknown> {
  const copy = { ...(body as Record<string, unknown>) };
  delete copy.shopPin;
  if (typeof copy.pin === 'string') {
    copy.pin = '[redacted]';
  }
  return copy;
}

export function signedUrlDebug(uploadUrl: string): { host: string; path: string } {
  try {
    const url = new URL(uploadUrl);
    return { host: url.host, path: url.pathname };
  } catch {
    return { host: 'invalid', path: '' };
  }
}

export function clipBody(text: string, max = 400): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}
