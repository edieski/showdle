// Saved progress. The JSON shape is shared with earlier versions, so players keep their streaks.
//   { mode, daily: Game & { day }, practice: Game, stats }
//   Game = { target, guesses: [names], done, gaveUp, song, shape }

const KEY = 'showdle.v1';

export const blankGame = extra => ({ guesses: [], done: false, gaveUp: false, song: false, shape: false, ...extra });
const blankStats = () => ({ streak: 0, best: 0, solved: 0, total: 0, lastDay: -1 });

function read(storage) {
  try { return JSON.parse(storage.getItem(KEY)) || {}; } catch { return {}; }
}

export function save(store, storage = globalThis.localStorage) {
  try { storage.setItem(KEY, JSON.stringify(store)); } catch { /* private mode or storage full */ }
}

// isShow(name) says whether a name is still in the repertoire.
// scheduled: today's show was hand-picked, so it replaces whatever answer was saved for today.
export function load({ today, dailyTarget, scheduled = false, isShow, storage = globalThis.localStorage }) {
  const store = read(storage);

  let daily = store.daily;
  if (!daily || daily.day !== today || !Array.isArray(daily.guesses)) daily = blankGame({ day: today });
  if (scheduled && daily.target !== dailyTarget) daily = blankGame({ day: today, target: dailyTarget });
  daily.guesses = daily.guesses.filter(isShow);
  // Pin today's answer, so growing the repertoire mid-day never swaps the show under a game in progress.
  if (!isShow(daily.target)) {
    if (daily.done && !daily.gaveUp && daily.guesses.length) daily.target = daily.guesses.at(-1);
    else daily = blankGame({ day: today, target: dailyTarget });
  }
  store.daily = daily;

  const p = store.practice;
  if (!p || !isShow(p.target) || !Array.isArray(p.guesses)) delete store.practice;
  else p.guesses = p.guesses.filter(isShow);

  store.stats ??= blankStats();
  if (store.mode !== 'practice') store.mode = 'daily';
  return store;
}

export function recordWin(stats, today, guessCount) {
  stats.streak = stats.lastDay === today - 1 ? stats.streak + 1 : 1;
  stats.best = Math.max(stats.best, stats.streak);
  stats.lastDay = today;
  stats.solved += 1;
  stats.total += guessCount;
}

export function recordGiveUp(stats) {
  stats.streak = 0;
}
