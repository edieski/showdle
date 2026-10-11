// Game controller: daily and practice rounds, guesses, hints, giving up, and wiring the page.
import { $, el } from './dom.js';
import { SHOWS, byName } from './shows.js';
import { shape } from './text.js';
import { dayNumber, dailyIndex } from './daily.js';
import { matches, exactMatch } from './search.js';
import { load, save, blankGame, recordWin, recordGiveUp } from './store.js';
import { headEl, rowEl, knownEl } from './board.js';
import { renderEnd, tickCountdown } from './end.js';
import { guessBox } from './combobox.js';

const HINTS = {
  song:  { at: 4, label: 'Song clue',   value: t => `"${t.song}"`, cls: '' },
  shape: { at: 7, label: 'Title shape', value: t => shape(t.name), cls: 'shape' },
};

const today = dayNumber();
const store = load({
  today,
  dailyTarget: SHOWS[dailyIndex(today, SHOWS.length)].name,
  isShow: name => byName.has(name),
});

const isDaily = () => store.mode === 'daily';
const game = () => isDaily() ? store.daily : store.practice;
const answer = () => byName.get(game().target);
const guessed = () => game().guesses.map(name => byName.get(name));
const persist = () => save(store);

function newPractice() {
  let t;
  do { t = SHOWS[Math.floor(Math.random() * SHOWS.length)]; } while (t.name === store.daily.target);
  store.practice = blankGame({ target: t.name });
}

function setMode(mode) {
  store.mode = mode;
  if (mode === 'practice' && !store.practice) newPractice();
  persist();
  box.reset();
  render();
}

function makeGuess(show) {
  const g = game();
  if (g.done || g.guesses.includes(show.name)) return;
  g.guesses.push(show.name);
  if (show === answer()) {
    g.done = true;
    if (isDaily()) recordWin(store.stats, today, g.guesses.length);
  }
  persist();
  render({ fresh: true });
}

function revealHint(kind) {
  const g = game();
  if (g[kind] || g.done || g.guesses.length < HINTS[kind].at) return;
  g[kind] = true;
  persist();
  render();
}

// "Reveal the answer" needs a second tap within 4 seconds.
const giveUp = $('giveup');
let armed = false;
function disarm() { armed = false; giveUp.textContent = 'Reveal the answer'; }
giveUp.addEventListener('click', () => {
  const g = game();
  if (g.done) return;
  if (!armed) {
    armed = true;
    giveUp.textContent = 'Tap again to reveal';
    setTimeout(() => { if (armed) disarm(); }, 4000);
    return;
  }
  g.done = true; g.gaveUp = true;
  if (isDaily()) recordGiveUp(store.stats);
  persist();
  render();
});

// ---- rendering ----

function renderHint(kind) {
  const { at, label, value, cls } = HINTS[kind];
  const btn = $('hint-' + kind), g = game();
  btn.className = 'hint';
  if (g[kind]) {
    btn.hidden = false;
    btn.classList.add('open');
    btn.setAttribute('aria-disabled', 'true');
    btn.replaceChildren(el('b', '', label), el('span', cls, value(answer())));
  } else if (!g.done && g.guesses.length >= at) {
    btn.hidden = false;
    btn.removeAttribute('aria-disabled');
    btn.replaceChildren(el('span', '', 'Reveal ' + label.toLowerCase()));
  } else {
    btn.hidden = true;
  }
  return !btn.hidden;
}

function renderControls(n, done) {
  const tog = $('mode-toggle');
  tog.textContent = isDaily() ? 'Practice' : 'Daily show';
  tog.setAttribute('aria-label', isDaily() ? 'Switch to practice rounds' : 'Switch to the daily show');
  $('prompt').textContent = isDaily() ? "Guess today's musical" : 'Practice round: guess the musical';
  $('tip').textContent = n ? `${n} ${n === 1 ? 'guess' : 'guesses'} so far` : 'Every guess prints eight clues about the answer.';
  for (const id of ['prompt', 'guess-form', 'tip', 'giveup']) $(id).hidden = done;
  disarm();
}

function renderBoard(guesses, t, done, fresh) {
  const n = guesses.length;
  const rows = [headEl()];
  if (n && !done) rows.push(knownEl(guesses, t));
  guesses.slice().reverse().forEach((show, i) => rows.push(rowEl(show, t, { fresh: fresh && i === 0, no: n - i })));
  $('board').replaceChildren(...rows);
  $('board-wrap').hidden = !n;
}

function render({ fresh = false } = {}) {
  const g = game(), t = answer(), guesses = guessed();
  renderControls(guesses.length, g.done);
  renderBoard(guesses, t, g.done, fresh);
  const anyHint = [renderHint('song'), renderHint('shape')].some(Boolean);
  $('hints').hidden = g.done || !anyHint;
  renderEnd($('end'), { daily: isDaily(), game: g, guesses, answer: t, stats: store.stats }, () => {
    newPractice();
    setMode('practice');
    $('guess-input').focus();
  });
}

// ---- wiring ----

const box = guessBox({
  form: $('guess-form'),
  input: $('guess-input'),
  list: $('suggest'),
  msg: $('form-msg'),
  search: text => matches(text, SHOWS, game().guesses),
  onPick: makeGuess,
  onNoMatch: text => {
    const dup = exactMatch(text, SHOWS);
    return dup ? `You already tried ${dup.name}.` : 'That show is not in the repertoire. Pick one from the list.';
  },
  isDone: () => game().done,
});

$('mode-toggle').addEventListener('click', () => setMode(isDaily() ? 'practice' : 'daily'));
$('hint-song').addEventListener('click', () => revealHint('song'));
$('hint-shape').addEventListener('click', () => revealHint('shape'));
setInterval(tickCountdown, 1000);

const help = $('help');
$('help-open').addEventListener('click', () => help.showModal());
$('help-close').addEventListener('click', () => help.close());
help.addEventListener('click', e => { if (e.target === help) help.close(); }); // backdrop click

// ---- static parts ----
$('bulbs').append(...Array.from({ length: 30 }, () => document.createElement('i')));
$('example').replaceChildren(headEl(), rowEl(byName.get('Dear Evan Hansen'), byName.get('Hamilton')));
$('rep-summary').textContent = `The repertoire: all ${SHOWS.length} musicals in the game`;
$('repertoire').replaceChildren(
  ...SHOWS.slice().sort((a, b) => a.shortKey.localeCompare(b.shortKey)).map(s => el('li', '', s.name)),
);

if (store.mode === 'practice' && !store.practice) newPractice();
persist();
render();
