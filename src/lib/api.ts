import { HASH_HEADER, INTEGRITY_HEADER, PIN_HEADER, getFunctionsBaseUrl, getIntegrityMode } from '@/lib/config';
import { sha256Hex } from '@/lib/hash';
import { loadSession } from '@/lib/session-store';

type ApiError = { error?: string };

export async function postFunction<T>(name: string, body: object): Promise<T> {
  const base = getFunctionsBaseUrl();
  if (!base) {
    throw new Error('Functions URL is not configured.');
  }

  const session = await loadSession();
  if (!session.pin.trim()) {
    throw new Error('Set the store PIN in Settings before Check.');
  }

  const raw = JSON.stringify(body);
  const hash = await sha256Hex(raw);
  const integrityPrefix = getIntegrityMode() === 'debug' ? 'debug.' : '';

  const response = await fetch(`${base}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [PIN_HEADER]: session.pin,
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
    throw new Error(text || `Request failed (${response.status})`);
  }

  if (!response.ok) {
    throw new Error(json.error ?? `Request failed (${response.status})`);
  }
  return json;
}

export function pingGate() {
  return postFunction<{ ok: boolean; phase: string }>('gatePing', {});
}
