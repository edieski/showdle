// Search key: accents and punctuation dropped, lower case, '&' read as 'and'.
export const norm = s => s
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/&/g, 'and')
  .replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

// The same key without a leading article, so "Phantom" finds "The Phantom of the Opera".
export const stripArticle = key => key.replace(/^(the|a|les|le|la) /, '');

// "Les Misérables" -> "L··  M·········": first letter of each word, punctuation kept.
export function shape(name) {
  return name.split(' ').map(word => {
    let first = true;
    return [...word].map(ch => {
      if (!/[\p{L}\p{N}]/u.test(ch)) return ch;
      if (first) { first = false; return ch; }
      return '·';
    }).join('');
  }).join('  ');
}
