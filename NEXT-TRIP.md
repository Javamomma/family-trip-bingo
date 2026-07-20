# Next-Trip Checklist

Spin up a new card in ~20 minutes.

- [ ] **Snapshot check** — make sure the *current* `index.html` is already saved as `trips/YYYY-MM-slug.html`. If not, copy it there first.
- [ ] **Swap the per-trip squares** — in `index.html`, replace the ~30 lineup/day-specific squares (the first three commented blocks of `SQUARES`) with new-trip material. Keep the family + generic blocks; keep or swap the Minnesota block depending on destination. Aim for ~60+ total so cards differ meaningfully.
- [ ] **Update the header strings** — the `burgee` (location + dates), the `<h1>` title, the `.sub` line, and the `<title>` tag.
- [ ] **Change the storage prefix** — search for `ycb:` (3 places) and replace with a trip-specific prefix like `bingo-2027-03:`. Otherwise everyone's marks from the *last* trip bleed onto the new cards.
- [ ] **Optional retheme** — the whole look lives in the six CSS variables at the top of `<style>`.
- [ ] **Test** — open locally; confirm the same name deals the same card twice, marks stick after a reload, and the free space is centered.
- [ ] **Commit & push** — GitHub Pages redeploys automatically (or drag onto Netlify Drop for a fresh link).
- [ ] **Drop the link in the family chat.**
- [ ] **After the trip** — copy `index.html` to `trips/YYYY-MM-slug.html` and commit, so the card set is preserved as a keepsake.
