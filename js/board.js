// The guess board: a header row, then one strip of eight tickets per guess.
import { el } from './dom.js';
import { COLUMNS, compare, knownCells } from './scoring.js';

const SAID = { ok: 'exact match', near: 'partly right', miss: 'no match' };

function rowShell(cls, title, no) {
  const row = el('div', cls);
  row.setAttribute('role', 'row');
  const name = el('div', 'name');
  name.setAttribute('role', 'rowheader');
  if (no) name.append(el('span', 'no', String(no)));
  name.append(el('span', 'ttl', title));
  row.append(name);
  return row;
}

function tile(cls, col, lines, lineCls, label) {
  const t = el('div', cls);
  t.setAttribute('role', 'cell');
  t.setAttribute('aria-label', label);
  const val = el('span', 'val');
  lines.forEach(line => val.append(el('span', lineCls(line), line)));
  t.append(el('span', 'cap', col.label), val);
  return t;
}

export function headEl() {
  const head = el('div', 'head');
  head.setAttribute('role', 'row');
  for (const label of ['Musical', ...COLUMNS.map(c => c.label)]) {
    const cell = el('div', '', label);
    cell.setAttribute('role', 'columnheader');
    head.append(cell);
  }
  return head;
}

export function rowEl(show, answer, { fresh = false, no } = {}) {
  const row = rowShell('row' + (fresh ? ' fresh' : ''), show.name, no);
  compare(show, answer).forEach((c, i) => {
    const col = COLUMNS[i];
    const isYear = col.kind === 'year';
    let said = SAID[c.st];
    if (c.arrow) said += c.arrow === 'up' ? ', the answer opened later' : ', the answer opened earlier';
    const t = tile('tile ' + c.st, col, c.lines, () => isYear ? 'year' : '', `${col.label}: ${c.lines.join(', ')}. ${said}.`);
    if (c.arrow) {
      const hint = (c.st === 'near' ? 'close, ' : '') + (c.arrow === 'up' ? 'try later' : 'try earlier');
      t.querySelector('.val').append(el('span', 'dir', hint));
    }
    row.append(t);
  });
  return row;
}

// The summary strip: what the guesses so far prove about the answer.
export function knownEl(guesses, answer) {
  const row = rowShell('row known', 'Known so far');
  knownCells(guesses, answer).forEach((c, i) => {
    const col = COLUMNS[i];
    const isYearLine = line => col.kind === 'year' && /^\d{4}(–\d{4})?$/.test(line);
    const what = c.st === 'unk' ? 'not known yet' : (c.st === 'part' ? 'at least ' : '') + c.lines.join(', ');
    row.append(tile('tile k-' + c.st, col, c.lines, line => isYearLine(line) ? 'year' : '', `${col.label}: ${what}.`));
  });
  return row;
}
