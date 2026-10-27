# Plan

## 1. safe-saves — never fail to show a card because of saving
Source: audit 2026-10-26, moves 1 + 2 (`~/audits/reports/family-trip-bingo/`).
Branch: `task/safe-saves`. Status: done — merged to main 2026-10-26 (36614e9), not pushed.

**Goal.** Saving can never stop the page from showing a card. Fix the three save
bugs in `index.html` and add a small test script that proves it.

**Acceptance criteria**
- One `TRIP_ID` constant near the top of the script (`"2026-07-myc-fest"`).
  Player saves live at `bingo:<TRIP_ID>:player:<name>`, the remembered name at
  `bingo:<TRIP_ID>:meta:last`. A player named "last" (any capitalisation) works.
- Every storage call goes through `load`/`save` helpers wrapped in try/catch,
  including the case where merely touching `localStorage` throws.
- A save is used only if it is exactly 25 true/false values; anything else
  (bad JSON, an object, 25 strings, wrong length) starts a fresh card. The centre
  square (index 12) is always marked.
- If storage refuses, the game keeps working in memory for this visit
  (switching names and back keeps marks) and a quiet "not saved on this phone"
  note shows; it goes away once a save works again.
- Clear always shows a fresh card, even if storage refuses.
- The status line is built with `textContent`, not `innerHTML`.
- Cards are unchanged: `hash`, `rng`, `buildCard`, `SQUARES` order untouched.
- July's `ycb:` saves are deliberately not carried over (trip is over); old keys
  are left alone, not deleted.
- `node tests/bingo.test.mjs` (no dependencies) covers: same name same card, FREE
  in the centre, all 12 win lines, the name "last" in any case, malformed save,
  wrong-type save, 25-strings save, denied reads, denied writes, reload keeps marks.
- README gets the one-line test command and the TRIP_ID step in the reuse recipe;
  `NEXT-TRIP.md` step "Change the storage prefix" becomes "change `TRIP_ID`".
- Page still opens straight from the file.

**Files:** `index.html`, `tests/bingo.test.mjs` (new), `README.md`, `NEXT-TRIP.md`.

**Open question for Arshia:** does `trips/2026-07-myc-fest.html` get the same fix
or stay frozen? Not touched until answered.

**Out of scope:** the "trip pack" redesign (audit move 3).
