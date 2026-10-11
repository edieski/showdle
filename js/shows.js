import { SHOWS as DATA } from './data.js';
import { norm, stripArticle } from './text.js';

// Each show plus its search keys and Wikipedia title.
export const SHOWS = DATA.map(show => {
  const key = norm(show.name);
  return {
    alias: '', story: '', run: '',
    ...show,
    wiki: show.wiki || show.name,
    key,
    shortKey: stripArticle(key),
  };
});

export const byName = new Map(SHOWS.map(show => [show.name, show]));
