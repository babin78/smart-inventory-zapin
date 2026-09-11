import { HASH_HEADER, INTEGRITY_HEADER, PIN_HEADER, getFunctionsBaseUrl, getIntegrityMode } from '@/lib/config';
import { clipBody, logApi, redactRequestBody } from '@/lib/debug-log';
import { sha256Hex } from '@/lib/hash';
import { loadSession } from '@/lib/session-store';

type ApiError = { error?: string };

export async function postFunction<T>(name: string, body: object): Promise<T> {
  const base = getFunctionsBaseUrl();
  if (!base) {
    throw new Error('Functions URL is not configured.');
  }

  const session = await loadSession();
  const pin = session.pin.trim();
  if (!pin) {
    throw new Error('Set the store PIN in Settings before Check.');
  }

  const payload = { ...body, shopPin: pin };
  const raw = JSON.stringify(payload);
  const hash = await sha256Hex(raw);
  const integrityPrefix = getIntegrityMode() === 'debug' ? 'debug.' : '';
  const url = `${base}/${name}`;

  logApi('POST req', {
    name,
    url,
    req: redactRequestBody(payload),
    pinPresent: pin.length > 0,
    integrityMode: getIntegrityMode(),
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [PIN_HEADER]: pin,
      [INTEGRITY_HEADER]: `${integrityPrefix}${hash}`,
      [HASH_HEADER]: hash,
    },
    body: raw,
  });

  const text = await response.text();
  let json: (T & ApiError) | null = null;
  try {
    json = JSON.parse(text) as T & ApiError;
  } catch {
    logApi('POST res', {
      name,
      httpStatus: response.status,
      status: 'error',
      ok: false,
      parse: 'non-json',
      body: clipBody(text),
    });
    throw new Error(text || `Request failed (${response.status})`);
  }

  if (!response.ok) {
    logApi('POST res', {
      name,
      httpStatus: response.status,
      status: 'error',
      ok: false,
      error: json.error ?? null,
      res: json,
    });
    throw new Error(json.error ?? `Request failed (${response.status})`);
  }

  logApi('POST res', {
    name,
    httpStatus: response.status,
    status: 'success',
    ok: true,
    resKeys: json && typeof json === 'object' ? Object.keys(json) : [],
  });
  return json;
}

export function pingGate() {
  return postFunction<{ ok: boolean; phase: string }>('gatePing', {});
}
