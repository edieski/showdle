import { norm } from './text.js';

// Autocomplete: title or alias starts with the query, then a word starts with it, then it appears anywhere.
export function matches(query, shows, exclude = [], limit = 8) {
  const q = norm(query);
  if (!q) return [];
  const ranked = [];
  for (const show of shows) {
    if (exclude.includes(show.name)) continue;
    let rank;
    if (show.key.startsWith(q) || show.shortKey.startsWith(q) || (show.alias && show.alias.startsWith(q.replace(/ /g, '')))) rank = 0;
    else if ((' ' + show.key).includes(' ' + q)) rank = 1;
    else if (show.key.includes(q)) rank = 2;
    else continue;
    ranked.push({ show, rank });
  }
  ranked.sort((a, b) => a.rank - b.rank || a.show.shortKey.localeCompare(b.show.shortKey));
  return ranked.slice(0, limit).map(r => r.show);
}

// The show a typed title names exactly, if any.
export function exactMatch(query, shows) {
  const q = norm(query);
  return shows.find(s => s.key === q || s.shortKey === q);
}
