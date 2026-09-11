import assert from 'node:assert/strict';
import test from 'node:test';

import {
  HASH_HEADER,
  INTEGRITY_HEADER,
  PIN_HEADER,
  assertGate,
  clearPinFailures,
  hashPin,
  requestBodyHash,
  verifyPin,
} from './gate';

function fakeReq(headers: Record<string, string>, body: object = {}) {
  const rawBody = JSON.stringify(body);
  return {
    headers,
    body,
    rawBody,
    ip: '203.0.113.10',
  } as never;
}

test('verifyPin accepts a matching scrypt hash', () => {
  const stored = hashPin('2468', 'aabbccddeeff00112233445566778899');
  assert.equal(verifyPin('2468', stored), true);
  assert.equal(verifyPin('0000', stored), false);
});

test('assertGate rejects missing integrity token', () => {
  const pinHash = hashPin('2468');
  const result = assertGate(fakeReq({ [PIN_HEADER]: '2468' }), {
    SHOP_PIN_HASH: pinHash,
    INTEGRITY_MODE: 'debug',
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.status, 403);
  }
});

test('assertGate rejects wrong PIN', () => {
  const pinHash = hashPin('2468');
  const body = { ping: true };
  const result = assertGate(
    fakeReq(
      {
        [PIN_HEADER]: '0000',
        [INTEGRITY_HEADER]: 'debug.token',
        [HASH_HEADER]: requestBodyHash(JSON.stringify(body)),
      },
      body,
    ),
    { SHOP_PIN_HASH: pinHash, INTEGRITY_MODE: 'debug' },
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.status, 403);
  }
});

test('assertGate accepts debug token and correct PIN', () => {
  clearPinFailures('203.0.113.10');
  const pinHash = hashPin('2468');
  const body = { ping: true };
  const result = assertGate(
    fakeReq(
      {
        [PIN_HEADER]: '2468',
        [INTEGRITY_HEADER]: 'debug.token',
        [HASH_HEADER]: requestBodyHash(JSON.stringify(body)),
      },
      body,
    ),
    { SHOP_PIN_HASH: pinHash, INTEGRITY_MODE: 'debug' },
  );
  assert.equal(result.ok, true);
});

test('assertGate accepts PIN from JSON body when header is missing', () => {
  clearPinFailures('203.0.113.10');
  const pinHash = hashPin('2468');
  const body = { ping: true, shopPin: '2468' };
  const result = assertGate(
    fakeReq(
      {
        [INTEGRITY_HEADER]: 'debug.token',
        [HASH_HEADER]: requestBodyHash(JSON.stringify(body)),
      },
      body,
    ),
    { SHOP_PIN_HASH: pinHash, INTEGRITY_MODE: 'debug' },
  );
  assert.equal(result.ok, true);
});

test('assertGate rejects a plaintext PIN stored as SHOP_PIN_HASH', () => {
  const body = { ping: true };
  const result = assertGate(
    fakeReq(
      {
        [PIN_HEADER]: '1234',
        [INTEGRITY_HEADER]: 'debug.token',
        [HASH_HEADER]: requestBodyHash(JSON.stringify(body)),
      },
      body,
    ),
    { SHOP_PIN_HASH: '1234', INTEGRITY_MODE: 'debug' },
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.status, 500);
    assert.match(result.error, /malformed/i);
  }
});
test('assertGate rejects debug tokens in production', () => {
  const pinHash = hashPin('2468');
  const result = assertGate(
    fakeReq({
      [PIN_HEADER]: '2468',
      [INTEGRITY_HEADER]: 'debug.token',
    }),
    {
      SHOP_PIN_HASH: pinHash,
      INTEGRITY_MODE: 'production',
      CLOUD_PROJECT_NUMBER: '123456789',
    },
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.status, 403);
  }
});
