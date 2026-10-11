import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load, save, recordWin, recordGiveUp } from '../js/store.js';

const memory = (data = {}) => ({ data, getItem: k => data[k] ?? null, setItem(k, v) { data[k] = v; } });
const known = new Set(['Hamilton', 'Wicked', 'Cats']);
const opts = (storage, today = 100) => ({ today, dailyTarget: 'Wicked', isShow: n => known.has(n), storage });

test('fresh store starts a daily game on today\'s show', () => {
  const s = load(opts(memory()));
  assert.equal(s.mode, 'daily');
  assert.equal(s.daily.target, 'Wicked');
  assert.equal(s.daily.day, 100);
  assert.deepEqual(s.stats, { streak: 0, best: 0, solved: 0, total: 0, lastDay: -1 });
});

test('saved progress round-trips, and a new day resets the daily game', () => {
  const storage = memory();
  const s = load(opts(storage));
  s.daily.guesses.push('Cats', 'Gone Show');
  save(s, storage);
  assert.deepEqual(load(opts(storage)).daily.guesses, ['Cats']);
  assert.deepEqual(load(opts(storage, 101)).daily.guesses, []);
});

test('practice game survives a reload', () => {
  const storage = memory();
  const s = load(opts(storage));
  s.mode = 'practice';
  s.practice = { target: 'Cats', guesses: ['Hamilton'], done: false, gaveUp: false, song: false, shape: false };
  save(s, storage);
  const again = load(opts(storage));
  assert.equal(again.mode, 'practice');
  assert.equal(again.practice.target, 'Cats');
});

test('streaks', () => {
  const st = { streak: 0, best: 0, solved: 0, total: 0, lastDay: -1 };
  recordWin(st, 10, 3);
  recordWin(st, 11, 5);
  assert.deepEqual(st, { streak: 2, best: 2, solved: 2, total: 8, lastDay: 11 });
  recordWin(st, 13, 1);
  assert.equal(st.streak, 1);
  recordGiveUp(st);
  assert.equal(st.streak, 0);
  assert.equal(st.best, 2);
});
