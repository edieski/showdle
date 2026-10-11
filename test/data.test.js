import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SHOWS } from '../js/shows.js';
import { dailyIndex } from '../js/daily.js';

test('every show is complete and unique', () => {
  const lists = ['music', 'basedOn', 'setting', 'era', 'style'];
  for (const s of SHOWS) {
    assert.ok(s.name && Number.isInteger(s.opened) && s.origin && s.song, s.name);
    assert.equal(typeof s.tony, 'boolean', s.name);
    for (const k of lists) assert.ok(Array.isArray(s[k]) && s[k].length, `${s.name}.${k}`);
    assert.ok(['', 'B', 'W', 'BW'].includes(s.run), s.name);
  }
  assert.equal(new Set(SHOWS.map(s => s.name)).size, SHOWS.length);
  assert.equal(new Set(SHOWS.map(s => s.key)).size, SHOWS.length);
});

test('no daily show repeats within a cycle', () => {
  const N = SHOWS.length, start = 20 * N;
  const seen = new Set(Array.from({ length: N }, (_, i) => dailyIndex(start + i, N)));
  assert.equal(seen.size, N);
});
