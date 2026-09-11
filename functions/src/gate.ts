import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { Request } from 'firebase-functions/v2/https';

export const PIN_HEADER = 'x-shop-pin';
export const INTEGRITY_HEADER = 'x-integrity-token';
export const HASH_HEADER = 'x-request-hash';

const MAX_PIN_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

type FailState = { count: number; lockedUntil: number };
const pinFailures = new Map<string, FailState>();

export type GateOk = { ok: true };
export type GateFail = { ok: false; status: number; error: string };
export type GateResult = GateOk | GateFail;

export function hashPin(pin: string, saltHex?: string): string {
  const salt = saltHex ? Buffer.from(saltHex, 'hex') : randomBytes(16);
  const digest = scryptSync(pin, salt, 32);
  return `scrypt$${salt.toString('hex')}$${digest.toString('hex')}`;
}

export function verifyPin(pin: string, storedHash: string): boolean {
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    return false;
  }
  const [, saltHex, digestHex] = parts;
  let expected: Buffer;
  let actual: Buffer;
  try {
    expected = Buffer.from(digestHex, 'hex');
    actual = scryptSync(pin, Buffer.from(saltHex, 'hex'), expected.length);
  } catch {
    return false;
  }
  if (expected.length !== actual.length) {
    return false;
  }
  return timingSafeEqual(expected, actual);
}

export function requestBodyHash(rawBody: string): string {
  return createHash('sha256').update(rawBody).digest('hex');
}

export function clientKey(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip ?? 'unknown';
}

export function isLocked(key: string, now = Date.now()): boolean {
  const state = pinFailures.get(key);
  return Boolean(state && state.lockedUntil > now);
}

export function recordPinFailure(key: string, now = Date.now()): { locked: boolean } {
  const current = pinFailures.get(key) ?? { count: 0, lockedUntil: 0 };
  if (current.lockedUntil > now) {
    return { locked: true };
  }
  const count = current.count + 1;
  const locked = count >= MAX_PIN_FAILURES;
  pinFailures.set(key, {
    count,
    lockedUntil: locked ? now + LOCKOUT_MS : 0,
  });
  return { locked };
}

export function clearPinFailures(key: string): void {
  pinFailures.delete(key);
}

export function assertGate(req: Request, env = process.env): GateResult {
  const key = clientKey(req);
  if (isLocked(key)) {
    return { ok: false, status: 429, error: 'Too many PIN failures. Try later.' };
  }

  const pin = headerValue(req, PIN_HEADER);
  const token = headerValue(req, INTEGRITY_HEADER);
  const providedHash = headerValue(req, HASH_HEADER);
  const rawBody = readRawBody(req);
  const expectedHash = requestBodyHash(rawBody);

  if (!token) {
    return { ok: false, status: 403, error: 'Missing integrity token.' };
  }

  const mode = (env.INTEGRITY_MODE ?? 'debug').toLowerCase();
  if (mode === 'debug') {
    if (!token.startsWith('debug.')) {
      return { ok: false, status: 403, error: 'Debug integrity token required.' };
    }
  } else if (mode === 'production') {
    if (token.startsWith('debug.')) {
      return { ok: false, status: 403, error: 'Debug integrity tokens are not accepted in production.' };
    }
    if (!env.CLOUD_PROJECT_NUMBER) {
      return { ok: false, status: 403, error: 'Play Integrity is not configured.' };
    }
    // Full Play Integrity decode lands in F8. F2 still rejects missing/debug tokens.
  } else {
    return { ok: false, status: 403, error: 'Unknown integrity mode.' };
  }

  if (providedHash && providedHash !== expectedHash) {
    return { ok: false, status: 403, error: 'Request hash mismatch.' };
  }

  const storedHash = env.SHOP_PIN_HASH ?? '';
  if (!storedHash) {
    return { ok: false, status: 500, error: 'SHOP_PIN_HASH is not set.' };
  }

  if (!pin || !verifyPin(pin, storedHash)) {
    const { locked } = recordPinFailure(key);
    return {
      ok: false,
      status: locked ? 429 : 403,
      error: locked ? 'Too many PIN failures. Try later.' : 'Invalid PIN.',
    };
  }

  clearPinFailures(key);
  return { ok: true };
}

function headerValue(req: Request, name: string): string {
  const value = req.headers[name];
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? '';
  }
  return typeof value === 'string' ? value.trim() : '';
}

function readRawBody(req: Request): string {
  const raw = (req as Request & { rawBody?: Buffer | string }).rawBody;
  if (typeof raw === 'string') {
    return raw;
  }
  if (raw && Buffer.isBuffer(raw)) {
    return raw.toString('utf8');
  }
  return JSON.stringify(req.body ?? {});
}
