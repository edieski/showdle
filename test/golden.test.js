// The refactor must play exactly like the original single-file game.
// fixtures/golden.json was recorded from that original before the code was split up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SHOWS, byName } from '../js/shows.js';
import { compare, knownCells } from '../js/scoring.js';
import { dailyIndex } from '../js/daily.js';
import { matches } from '../js/search.js';
import { shape } from '../js/text.js';

const golden = JSON.parse(readFileSync(new URL('./fixtures/golden.json', import.meta.url)));
const show = name => byName.get(name);
// The fixtures cover the original repertoire. New shows are appended after it, so test against that slice.
const ORIGINAL = SHOWS.slice(0, 148);

test('daily answers are unchanged', () => {
  golden.daily.forEach((name, i) => {
    assert.equal(ORIGINAL[dailyIndex(golden.firstDay + i, ORIGINAL.length)].name, name, `day ${golden.firstDay + i}`);
  });
});

test('ticket colours and text are unchanged', () => {
  for (const g of golden.games) {
    g.guesses.forEach((name, i) => assert.deepEqual(compare(show(name), show(g.target)), g.compare[i]));
  }
});

test('"Known so far" strip is unchanged', () => {
  for (const g of golden.games) {
    assert.deepEqual(knownCells(g.guesses.map(show), show(g.target)), g.known, `${g.target} <- ${g.guesses}`);
  }
});

test('autocomplete results are unchanged', () => {
  for (const [q, names] of golden.search) assert.deepEqual(matches(q, ORIGINAL).map(s => s.name), names, q);
});

test('title shapes are unchanged', () => {
  for (const [name, s] of golden.shapes) assert.equal(shape(name), s);
});
