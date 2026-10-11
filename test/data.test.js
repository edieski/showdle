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

test('scheduled days name real shows and override the shuffle', async () => {
  const { SCHEDULE } = await import('../js/data.js');
  const { dailyShow } = await import('../js/daily.js');
  for (const name of Object.values(SCHEDULE)) assert.ok(SHOWS.some(s => s.name === name), name);
  const picked = dailyShow(SHOWS, { '2026-10-11': 'El Alma al Aire' }, new Date(2026, 9, 11));
  assert.equal(picked.show.name, 'El Alma al Aire');
  assert.equal(picked.scheduled, true);
  assert.equal(dailyShow(SHOWS, {}, new Date(2026, 9, 12)).scheduled, false);
});
