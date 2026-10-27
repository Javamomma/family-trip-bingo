# Family Trip Bingo

A single-file bingo web app for family trips. Everyone opens the same link on their own phone, types their name, and gets their own 5×5 card. First built for the **Minnesota Yacht Club Festival** (Harriet Island, July 17–19 2026) — that original card set is preserved in [`trips/2026-07-myc-fest.html`](trips/2026-07-myc-fest.html). `index.html` is always the *current* trip.

## How it works

- **Type a name → deterministic card.** The name is hashed (FNV-1a) and the hash seeds a small xorshift RNG that shuffles the square pool. Same name = same card, on any phone, every time — no server needed to keep cards consistent.
- **Marks persist per phone.** Tapping a square saves to `localStorage` under a per-name, per-trip key (`TRIP_ID`), so your marks survive closing the browser and a new trip starts clean. Each person keeps their own marks on their own phone.
- **Free space** is the center square, pre-marked.
- **Win detection** — any full row, column, or diagonal pops a "Bingo!" banner.
- No build, no dependencies, no backend. One HTML file.

## Run it

- **Just open it:** double-click `index.html` (or AirDrop/text the file). Works fully offline.
- **Host it** (so the family gets one shareable link):
  - **Netlify Drop** — drag the project folder onto [app.netlify.com/drop](https://app.netlify.com/drop) → instant public URL. Easiest for a one-off trip.
  - **GitHub Pages** — repo Settings → Pages → deploy from `main`. Permanent URL that updates every time you push a new trip's card.

## Making a card for the next trip

Full checklist in [`NEXT-TRIP.md`](NEXT-TRIP.md). Short version: edit the `SQUARES` array in `index.html` — swap the ~30 lineup/day-specific squares for the new trip, keep the portable ones, update the header strings, change `TRIP_ID` to the new trip's slug, save a dated copy into `trips/` when the trip is over.

### Which squares are portable

The `SQUARES` pool (~69 strings) is organized in commented blocks:

| Block | Count | Portability |
|---|---|---|
| Friday / Saturday / Sunday (lineup) | ~30 | **Per-trip.** Replace these every time — they name specific bands/sets. |
| Minnesota | ~12 | Portable for Minnesota trips; swap for local-color squares elsewhere. |
| Javaherian family | ~15 | **Portable everywhere.** The family's greatest hits — tune the inside jokes as they evolve. |
| Festival generic | ~12 | Portable to any festival/fair/big event; swap for museum/road-trip flavor otherwise. |

## Tests

Maintainer only (Node 18+): `node tests/bingo.test.mjs`

## Repo layout

```
index.html                    ← current trip's card
trips/2026-07-myc-fest.html   ← dated snapshot per past trip
NEXT-TRIP.md                  ← spin-up checklist for the next trip
tests/bingo.test.mjs          ← dependency-free test script
```
