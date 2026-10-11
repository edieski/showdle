// How a guess compares with the answer, one ticket per column.
// Statuses: ok (exact), near (partly right), miss (no match); the "Known so far" strip adds part and unk.

export const COLUMNS = [
  { key: 'opened',  label: 'Opened',   kind: 'year' },
  { key: 'origin',  label: 'Origin',   kind: 'single' },
  { key: 'music',   label: 'Music by', kind: 'list' },
  { key: 'basedOn', label: 'Based on', kind: 'list' },
  { key: 'setting', label: 'Setting',  kind: 'list', oneLine: true },
  { key: 'era',     label: 'Era',      kind: 'list' },
  { key: 'style',   label: 'Style',    kind: 'list' },
  { key: 'tony',    label: 'Tony',     kind: 'tony' },
];

export const NEAR_YEARS = 5;

// The printed lines of one value in one column.
function linesOf(col, value) {
  switch (col.kind) {
    case 'year': return [String(value)];
    case 'tony': return [value ? 'Best Musical' : 'No win'];
    case 'list': return col.oneLine ? [value.join(', ')] : value;
    default: return [value];
  }
}

// Two lists: ok when identical as sets, near when they share anything.
export function overlap(a, b) {
  const shared = a.filter(x => b.includes(x)).length;
  if (shared === a.length && a.length === b.length) return 'ok';
  return shared ? 'near' : 'miss';
}

function compareCell(col, guess, answer) {
  const g = guess[col.key], t = answer[col.key];
  const lines = linesOf(col, g);
  if (col.kind === 'year') {
    const d = t - g;
    return {
      st: d === 0 ? 'ok' : Math.abs(d) <= NEAR_YEARS ? 'near' : 'miss',
      lines,
      arrow: d > 0 ? 'up' : d < 0 ? 'down' : '',
    };
  }
  if (col.kind === 'list') return { st: overlap(g, t), lines };
  return { st: g === t ? 'ok' : 'miss', lines };
}

export const compare = (guess, answer) => COLUMNS.map(col => compareCell(col, guess, answer));

// ---- what the guesses so far prove about the answer ----

const UNKNOWN = { st: 'unk', lines: ['?'] };

function knownYear(guesses, year) {
  let lo = -Infinity, hi = Infinity;
  for (const s of guesses) {
    if (s.opened === year) return { st: 'ok', lines: [String(year)] };
    if (s.opened < year) lo = Math.max(lo, s.opened + 1);
    else hi = Math.min(hi, s.opened - 1);
  }
  if (lo === hi) return { st: 'ok', lines: [String(year)] };
  if (lo > -Infinity && hi < Infinity) return { st: 'part', lines: [`${lo}–${hi}`] };
  if (lo > -Infinity) return { st: 'part', lines: [`after ${lo - 1}`] };
  if (hi < Infinity) return { st: 'part', lines: [`before ${hi + 1}`] };
  return UNKNOWN;
}

// Items of a "no match" guess are ruled out; a "partly right" guess with one item left proves that item.
function knownList(col, guesses, answer) {
  const k = col.key, t = answer[k];
  const results = guesses.map(s => [s[k], overlap(s[k], t)]);
  if (results.some(([, st]) => st === 'ok')) return { st: 'ok', lines: linesOf(col, t) };
  const out = new Set(results.filter(([, st]) => st === 'miss').flatMap(([items]) => items));
  const sure = new Set();
  for (const [items, st] of results) {
    if (st !== 'near') continue;
    const left = items.filter(x => !out.has(x));
    if (left.length === 1) sure.add(left[0]);
  }
  return sure.size ? { st: 'part', lines: linesOf(col, t.filter(x => sure.has(x))) } : UNKNOWN;
}

function knownCell(col, guesses, answer) {
  const t = answer[col.key];
  switch (col.kind) {
    case 'year': return knownYear(guesses, t);
    case 'list': return knownList(col, guesses, answer);
    case 'tony': return guesses.length ? { st: 'ok', lines: linesOf(col, t) } : UNKNOWN;
    default: return guesses.some(s => s[col.key] === t) ? { st: 'ok', lines: linesOf(col, t) } : UNKNOWN;
  }
}

export const knownCells = (guesses, answer) => COLUMNS.map(col => knownCell(col, guesses, answer));

// One line of coloured squares per guess, for sharing.
const SQUARES = { ok: '🟩', near: '🟨', miss: '🟥' };
export const shareGrid = (guesses, answer) =>
  guesses.map(g => compare(g, answer).map(c => SQUARES[c.st]).join(''));
