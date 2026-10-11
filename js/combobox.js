// The guess box: a text input with a suggestion list (ARIA combobox pattern).
import { el } from './dom.js';

// search(text) -> shows to suggest; onPick(show) makes the guess; onNoMatch(text) explains a failed submit.
export function guessBox({ form, input, list, msg, search, onPick, onNoMatch, isDone }) {
  let found = [], active = -1;

  function close() {
    list.hidden = true;
    list.replaceChildren();
    found = []; active = -1;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }

  function open() {
    found = search(input.value);
    if (!found.length) { close(); return; }
    active = 0;
    list.replaceChildren(...found.map((show, k) => {
      const li = el('li', '', show.name);
      li.id = 'opt-' + k;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(k === active));
      li.addEventListener('mousedown', e => { e.preventDefault(); pick(show); });
      return li;
    }));
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    input.setAttribute('aria-activedescendant', 'opt-0');
  }

  function move(step) {
    if (!found.length) return;
    active = (active + step + found.length) % found.length;
    [...list.children].forEach((li, k) => li.setAttribute('aria-selected', String(k === active)));
    input.setAttribute('aria-activedescendant', 'opt-' + active);
    list.children[active].scrollIntoView({ block: 'nearest' });
  }

  function pick(show) {
    reset();
    onPick(show);
    input.focus();
  }

  function reset() {
    input.value = '';
    msg.textContent = '';
    close();
  }

  input.addEventListener('input', () => { msg.textContent = ''; open(); });
  input.addEventListener('focus', () => { if (input.value) open(); });
  input.addEventListener('blur', () => setTimeout(close, 120));
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden) open(); else move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Escape') close();
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (isDone()) return;
    const text = input.value.trim();
    if (!text) return;
    const options = found.length ? found : search(text);
    if (options.length) pick(options[found.length && active >= 0 ? active : 0]);
    else msg.textContent = onNoMatch(text);
  });

  return { reset };
}
