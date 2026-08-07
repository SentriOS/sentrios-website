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

## ROI calculator — v2 (two modes, ledger layout)

`construction.html #roi` now carries the two-mode calculator. Mode one is the
trailer-fleet channel model, mode two is the job-site owner model. Three
assumption sets (Conservative / Expected / Aggressive) reset every input.

**Pricing is not rendered anywhere on the page.** `PRICE = 100` lives at the top
of the ROI block in `app.js` and every figure shown is already net of it. The
same is true of `SENT_CHURN = 5` — the page shows the customer's own churn and
the trailers retained, never the 5%. The other hidden constants:

```js
var PRICE = 100;   // $ per stream per month, all features included
var SENT_CHURN = 5;   // % annual churn with SentriOS
var SENT_DEP_HR = 0.25;   // technician hours to deploy one trailer
var SENT_MISS = 2;   // % of events SentriOS misses
var GROWTH_DISC = 0.5;   // haircut on growth + retention lines
```

An automated check runs both modes across all three presets with the basis panel
open and asserts no price, no per-camera rate and no 5% churn figure appears in
the rendered text. It passes.

### Fleet mode

| Input | Range |
|---|---|
| Trailers in your fleet | 10–2,000 |
| Share on monitored contracts | 10–100% |
| Cameras or streams per trailer | **1–5** |
| What monitoring costs you per stream | **$40–$250** |
| What you charge per trailer | $400–$3,000 |
| Hours to deploy your current monitoring solution | **0.5–4 hrs** |
| Your loaded technician rate | $40–$180/hr |
| Months live in year one | 1–12 |
| Your annual churn on monitored contracts | **10–40%** |
| Extra trailers you win — response and recall | 0–60 |
| Extra trailers you win — custom agents | 0–60 |

Ledger lines: cost-of-goods reduction (hard cash, full value) → contracts won on
response and recall → contracts won on customer-defined agents → contracts you
stop losing → technician time released at cut-over → steady-state annual lift.

The three growth-and-retention lines each carry a 50% confidence discount and sit
under their own subtotal, kept visually apart from the contractual cash line.

Technician time is a **saving**, not a cost: the hours your current solution needs
per trailer, less roughly fifteen minutes for a SentriOS cut-over, at your
technician rate. Credited once, in year one. If your trailers redeploy between
sites during the year this recurs and the model does not credit it — deliberately
conservative, and stated in the basis panel.

### Job-site mode

| Input | Range |
|---|---|
| Events your setup misses today | **10–35%** |
| Events SentriOS misses | **fixed at 2%**, shown as a locked fact, not editable |
| What monitoring costs you per stream | $0–$250 |
| Discount on avoided losses | **removed** |

With the discount gone, intercepted losses and recovered reporting time now count
at full value, so job-site numbers come out materially higher than the version
you sent. Reporting time still carries its own 90% factor — someone reviews the
report.

### One thing to know

A determined reader can back out the hidden numbers by arithmetic: they know
their stream count and their own rate, and the page shows the net. Same for
churn — 14 trailers retained on 140 monitored from 15% implies the target. There
is no way to show a net saving without that being derivable. Nothing is *stated*,
which is what you asked for; just don't treat it as a secret in a room with a CFO.

## Two things worth a decision before you publish

1. **Aggressive-preset monitoring rate.** The fleet and job-site sliders both cap
   at $250/stream/month and the Aggressive preset sits right on the cap, which
   makes it the most favourable case the tool can produce. Worth checking that
   $250 is a rate you can point at a real contract.
2. **Number conflict with `agents.html`.** The "Why VLM" section there says
   traditional monitoring is "$200–400 per camera, per month." The calculator's
   slider runs $100–250 and defaults to $150. A prospect reading both pages will
   notice.
