// The ticket shown when a round ends: the answer, where to see it, stats, share and play-again.
import { el } from './dom.js';
import { RUN_DATE } from './data.js';
import { shareGrid } from './scoring.js';
import { untilMidnight } from './daily.js';

const WHERE = {
  BW: 'Playing now on Broadway and in the West End.',
  B: 'Playing now on Broadway.',
  W: 'Playing now in the West End.',
  '': 'Not on Broadway or in the West End right now.',
};

const dateLabel = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const countdownText = () => `Next daily show in ${untilMidnight()}`;
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export function shareText({ daily, game, guesses, answer }) {
  const rows = shareGrid(guesses, answer);
  return [
    daily ? `Showdle, ${dateLabel}` : 'Showdle practice',
    game.gaveUp ? `Not solved after ${rows.length}` : `Solved in ${rows.length}`,
    ...rows,
  ].join('\n');
}

function linksEl(show) {
  const links = el('p', 'links');
  const q = encodeURIComponent;
  for (const [label, href] of [
    ['Listen: cast album on Spotify', 'https://open.spotify.com/search/' + q(show.name + ' cast recording')],
    ['Watch: clips on YouTube', 'https://www.youtube.com/results?search_query=' + q(show.name + ' musical')],
    ['Read: Wikipedia', 'https://en.wikipedia.org/wiki/Special:Search?go=Go&search=' + q(show.wiki)],
  ]) {
    const a = el('a', '', label);
    a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
    links.append(a);
  }
  return links;
}

function statsLine(st) {
  const avg = st.solved ? `, average ${(st.total / st.solved).toFixed(1)} guesses.` : '.';
  return `Daily streak: ${plural(st.streak, 'day', 'days')}, best ${st.best}` + avg;
}

function shareButton(body, getText) {
  const btn = el('button', 'primary', 'Copy result');
  btn.type = 'button';
  // Clipboard can be blocked (http, iframes): show the text in a box to copy by hand.
  const fallback = text => {
    let ta = body.querySelector('#share-fallback');
    if (!ta) {
      ta = el('textarea');
      ta.id = 'share-fallback'; ta.readOnly = true;
      ta.setAttribute('aria-label', 'Result to copy');
      body.append(ta);
    }
    ta.value = text; ta.focus(); ta.select();
    btn.textContent = 'Select and copy below';
  };
  btn.addEventListener('click', () => {
    const text = getText();
    try { navigator.clipboard.writeText(text).then(() => { btn.textContent = 'Copied'; }, () => fallback(text)); }
    catch { fallback(text); }
  });
  return btn;
}

// round = { daily, game, guesses, answer, stats }
export function renderEnd(end, round, onPractice) {
  const { daily, game, guesses, answer: t, stats } = round;
  document.body.classList.toggle('win', game.done && !game.gaveUp);
  if (!game.done) { end.hidden = true; end.replaceChildren(); return; }

  end.className = 'end ' + (game.gaveUp ? 'lost' : 'won');
  const n = guesses.length;
  const stub = el('div', 'end-stub');
  stub.append(el('b', '', String(n)), el('span', '', n === 1 ? 'guess' : 'guesses'));

  const body = el('div', 'end-body');
  body.append(
    el('p', 'verdict', game.gaveUp ? 'The answer was' : 'You got it'),
    el('h2', 'answer', t.name),
  );
  if (t.story) body.append(el('p', 'story', t.story));
  body.append(
    el('p', 'sub', `Music by ${t.music.join(', ')}. Opened ${t.opened}. Top song: "${t.song}".`),
    el('p', 'sub', `${WHERE[t.run]} Checked ${RUN_DATE}.`),
    linksEl(t),
    el('div', 'rule'),
  );
  if (daily) {
    const cd = el('p', 'sub', countdownText());
    cd.id = 'countdown';
    body.append(el('p', 'sub', statsLine(stats)), cd);
  }

  const next = el('button', '', daily ? 'Play a practice round' : 'New practice round');
  next.type = 'button';
  next.addEventListener('click', onPractice);
  const actions = el('div', 'actions');
  actions.append(shareButton(body, () => shareText(round)), next);
  body.append(actions);

  end.replaceChildren(stub, body);
  end.hidden = false;
}

export function tickCountdown() {
  const cd = document.getElementById('countdown');
  if (cd) cd.textContent = countdownText();
}
