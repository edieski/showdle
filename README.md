# Showdle

A daily guessing game for musicals. Every guess prints a strip of eight ticket clues
(year, origin, composer, source, setting, era, style, Tony) comparing it with the answer.

Play: https://edieski.github.io/showdle/

## Run locally

ES modules need a web server, so opening `index.html` from disk won't work:

```sh
python -m http.server 8000   # then open http://localhost:8000
```

## Tests

```sh
npm test   # node --test, no dependencies
```

`test/golden.test.js` checks the game against outputs recorded from the original
single-file version: daily answers, ticket colours, the "Known so far" strip and autocomplete.

## Layout

| File | What it does |
| --- | --- |
| `js/data.js` | The repertoire, one musical per line. Add shows here. |
| `js/shows.js` | Adds search keys to the data |
| `js/scoring.js` | Column definitions, guess comparison, "Known so far" inference, share grid |
| `js/daily.js` | Daily answer (seeded shuffle per cycle) and countdown |
| `js/search.js` | Autocomplete ranking |
| `js/store.js` | Saved progress and streaks in `localStorage` |
| `js/board.js`, `js/end.js`, `js/combobox.js` | Rendering the board, end ticket and guess box |
| `js/main.js` | Game controller and page wiring |
| `css/style.css` | All styles |

Adding shows changes the daily order for future cycles; today's answer stays pinned for anyone mid-game.
