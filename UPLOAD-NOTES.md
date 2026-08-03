# SentriOS site update — new logo + embedded ROI calculator

Drop everything in this folder into the web root, overwriting the existing files.
**Do not delete** the images that already live on the server and are not in this
zip: `queen-bee.png`, `axis.png`, `hanwha.png`, `avigilon.png`, `honeywell.png`,
`ubiquiti.png`, `milestone.png`, `genetec.png`, `autodesk.png`, `procore.png`,
`rapidsos.png`.

## New / replaced image assets

| File | Where it's used |
|---|---|
| `logo-light.png` | Nav + footer (white wordmark, gold "OS", gold-and-white bee) — replaces the old file of the same name, so no HTML change was needed |
| `logo-dark.png` | Same lockup with the dark wordmark, for light backgrounds. Not referenced yet — decks, PDFs, light landing pages |
| `mark-light.png` / `mark-dark.png` | Bee mark on its own, transparent |
| `favicon.ico`, `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png` | Bee mark on a dark rounded square |
| `og-image.png` | 1200×630 link-preview card |

All PNGs have a transparent background. The source you sent was black artwork on
an opaque white rectangle, which would have shown as a white box in the dark nav.

## HTML / CSS / JS changes

**Every page** — added canonical + Open Graph + Twitter card tags (so the new
logo appears when a link is shared), and an "ROI calculator" link in the footer
Product column.

**`construction.html`** — new `<section id="roi">` between the Queen Bee block and
the closing Book-a-Demo CTA, plus a "Calculate your ROI" button in the hero.

**`styles.css`** — appended two blocks at the end: the `.roi-*` calculator styles
and a small brand-logo sizing block (nav 50px, footer 46px, mobile 42px) tuned
to the new lockup's proportions.

**`app.js`** — appended the calculator logic inside the existing IIFE, guarded by
`if(document.getElementById('roi-cams'))` so it's a no-op on every other page.

The calculator math is identical to the standalone `roicalculator_12.html`
(verified against the original formulas at four slider positions). Constants live
at the top of the ROI block in `app.js`:

```js
var SENT_MON=80, AVG_LOSS=10000, DOWN_WEEKS=1, DOWN_COST=8000,
    MISS_RATE=0.03, LABOR=65, RH_SENT=0.25;
```

## Filename note

The nav and footer on every page link to `five-generations.html` (hyphenated).
The file you sent was named `fivegenerations.html`. It's shipped here as
`five-generations.html` to match the links — if the live server is actually
serving the unhyphenated name, those nav links are currently 404ing and this
fixes them.

## Two things worth a decision before you publish

1. **Pricing goes public.** The assumptions line reads "SentriOS replaces
   traditional monitoring at a flat $80/camera/month." That was fine on a
   standalone page you sent to prospects; on `construction.html` it publishes
   your price list. Say the word and I'll swap it for "a flat monthly rate per
   camera" and keep the $80 in the math.
2. **Number conflict with `agents.html`.** The "Why VLM" section there says
   traditional monitoring is "$200–400 per camera, per month." The calculator's
   slider runs $100–250 and defaults to $150. A prospect reading both pages will
   notice.
