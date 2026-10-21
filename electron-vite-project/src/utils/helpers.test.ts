// Run with `npm test` (Node.js >= 22.6, uses the built-in test runner with type stripping)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  clamp,
  createId,
  faderToPercent,
  groupFaderUpdates,
  isValidIpv4,
  isValidPort,
  parseDecimal,
  percentToFader,
  sanitizeDecimalInput,
} from './helpers.ts';

test('clamp keeps values within the bounds', () => {
  assert.equal(clamp(-1, 0, 255), 0);
  assert.equal(clamp(300, 0, 255), 255);
  assert.equal(clamp(42, 0, 255), 42);
});

test('sanitizeDecimalInput removes everything except digits and separators', () => {
  assert.equal(sanitizeDecimalInput('12,5 %'), '12,5');
  assert.equal(sanitizeDecimalInput('abc'), '');
  assert.equal(sanitizeDecimalInput('3.25s'), '3.25');
});

test('parseDecimal accepts comma and dot as decimal separator', () => {
  assert.equal(parseDecimal('12,5'), 12.5);
  assert.equal(parseDecimal('12.5'), 12.5);
  assert.equal(parseDecimal('50%'), 50);
  assert.ok(Number.isNaN(parseDecimal('')));
  assert.ok(Number.isNaN(parseDecimal('abc')));
});

test('fader values and percentages convert into each other', () => {
  assert.equal(faderToPercent(0), 0);
  assert.equal(faderToPercent(255), 100);
  assert.equal(percentToFader(0), 0);
  assert.equal(percentToFader(100), 255);
  assert.equal(percentToFader(50), 128);
  for (let value = 0; value <= 255; value++) {
    assert.equal(percentToFader(faderToPercent(value)), value);
  }
});

test('percentToFader clamps out of range input', () => {
  assert.equal(percentToFader(150), 255);
  assert.equal(percentToFader(-10), 0);
});

test('isValidIpv4 matches the electron-store ipv4 format', () => {
  for (const ip of ['127.0.0.1', '192.168.2.119', '0.0.0.0', '255.255.255.255']) {
    assert.ok(isValidIpv4(ip), ip);
  }
  for (const ip of ['', '1.2.3', '1.2.3.4.5', '256.1.1.1', '01.2.3.4', '1.2.3.a', '1..2.3']) {
    assert.ok(!isValidIpv4(ip), ip);
  }
});

test('isValidPort accepts 1 to 65535', () => {
  for (const port of ['1', '80', '5000', '65535']) {
    assert.ok(isValidPort(port), port);
  }
  for (const port of ['', '0', '65536', '123456', 'abc', '-1', '50.5']) {
    assert.ok(!isValidPort(port), port);
  }
});

test('groupFaderUpdates groups channel updates by device in order', () => {
  assert.deepEqual(
    groupFaderUpdates([
      { deviceId: 3, channelId: 0, value: 255 },
      { deviceId: 1, channelId: 2, value: 10 },
      { deviceId: 3, channelId: 1, value: 128 },
    ]),
    [
      {
        deviceId: 3,
        channels: [
          { channelId: 0, value: 255 },
          { channelId: 1, value: 128 },
        ],
      },
      { deviceId: 1, channels: [{ channelId: 2, value: 10 }] },
    ]
  );
  assert.deepEqual(groupFaderUpdates([]), []);
});

test('createId returns unique ids, also without crypto.randomUUID (insecure context)', () => {
  const ids = new Set(Array.from({ length: 100 }, createId));
  assert.equal(ids.size, 100);

  const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  Object.defineProperty(globalThis, 'crypto', { value: {}, configurable: true });
  try {
    const fallbackIds = new Set(Array.from({ length: 100 }, createId));
    assert.equal(fallbackIds.size, 100);
  } finally {
    if (original) Object.defineProperty(globalThis, 'crypto', original);
  }
});
