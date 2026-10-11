import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byName } from '../js/shows.js';
import { COLUMNS, compare, knownCells, overlap, shareGrid } from '../js/scoring.js';

const show = name => byName.get(name);
const fake = over => ({ ...show('Hamilton'), ...over });

test('help-dialog example: Dear Evan Hansen against Hamilton', () => {
  const cells = compare(show('Dear Evan Hansen'), show('Hamilton'));
  assert.equal(cells.length, COLUMNS.length);
  assert.deepEqual(cells.map(c => c.st), ['near', 'ok', 'miss', 'miss', 'near', 'miss', 'miss', 'ok']);
  assert.equal(cells[0].arrow, 'down');
});

test('year bands: exact, within 5, further', () => {
  const t = fake({ opened: 2000 });
  assert.deepEqual(compare(fake({ opened: 2000 }), t)[0], { st: 'ok', lines: ['2000'], arrow: '' });
  assert.equal(compare(fake({ opened: 1995 }), t)[0].st, 'near');
  assert.equal(compare(fake({ opened: 1994 }), t)[0].st, 'miss');
  assert.equal(compare(fake({ opened: 1994 }), t)[0].arrow, 'up');
});

test('overlap', () => {
  assert.equal(overlap(['a', 'b'], ['b', 'a']), 'ok');
  assert.equal(overlap(['a'], ['a', 'b']), 'near');
  assert.equal(overlap(['a'], ['b']), 'miss');
});

test('known years narrow to a range', () => {
  const t = fake({ opened: 2000 });
  const year = gs => knownCells(gs.map(y => fake({ opened: y })), t)[0];
  assert.deepEqual(year([1990]), { st: 'part', lines: ['after 1990'] });
  assert.deepEqual(year([2010]), { st: 'part', lines: ['before 2010'] });
  assert.deepEqual(year([1990, 2010]), { st: 'part', lines: ['1991–2009'] });
  assert.deepEqual(year([1999, 2001]), { st: 'ok', lines: ['2000'] });
});

test('a partly-right list with one item left proves that item', () => {
  const t = fake({ style: ['Pop', 'Rock'] });
  const style = gs => knownCells(gs, t)[6];
  const miss = fake({ style: ['Jazz'] });
  const near = fake({ style: ['Jazz', 'Rock'] });
  assert.equal(style([near]).st, 'unk');
  assert.deepEqual(style([miss, near]), { st: 'part', lines: ['Rock'] });
});

test('share grid', () => {
  assert.deepEqual(shareGrid([show('Hamilton')], show('Hamilton')), ['🟩'.repeat(8)]);
});
