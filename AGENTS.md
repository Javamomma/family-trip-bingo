# AGENTS.md

## What this is
Family Trip Bingo: one self-contained web page. Each family member opens it on
their phone, types a name, and gets a repeatable 5×5 bingo card (the name seeds
the shuffle). Marks are saved per phone in `localStorage`. `index.html` is the
current trip; `trips/` holds dated snapshots of past trips. Live on GitHub Pages
from `main` (https://javamomma.github.io/family-trip-bingo/), so anything merged
and pushed reaches the family.

## Stack
- Plain HTML + CSS + vanilla JS in a single file. No framework, no build, no
  runtime dependencies, no backend.
- Node (18+) is used only by the maintainer test script. The family never needs it.

## Run
Open `index.html` directly in a browser (file:// must keep working).

## Verify
```sh
node tests/bingo.test.mjs
```
Dependency-free; loads the `<script>` from `index.html` into a fake browser and
exits non-zero on any failure. Also open `index.html` from the file once by hand.

## Conventions
- Keep it one self-contained HTML file that opens straight from disk.
- Match the existing terse style: small functions, short names, few comments.
- **Cards must not change:** the same name must deal the same card. Do not touch
  `hash`, `rng`, `buildCard`, or the order of `SQUARES` unless the task says so.
- Every `localStorage` call goes through the `load`/`save` helpers.
- Put user text into the page with `textContent`, never `innerHTML`.

## Do not touch
- `trips/*.html` are frozen keepsakes. Do not edit them unless the task says so.
- Do not push, deploy, or open pull requests; the lead handles that.

## Base branch
main
