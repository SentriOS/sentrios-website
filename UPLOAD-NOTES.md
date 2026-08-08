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
| What monitoring costs you per stream | **$100–$250** |
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
| What monitoring costs you per stream | **$0, or $100–$250** — nothing in between |
| Discount on avoided losses | **removed** |

**The no-monitoring case.** The rate slider's first stop is $0 and its second is
$100; there is no dead zone to drag through and a typed $45 snaps to $0 while
$60 snaps to $100. Entering $0 changes three things:

- The miss rate is forced to **100%** and locked — the slider disappears, the
  field turns red and carries the line "with no monitoring in place, nothing is
  intercepted before it happens."
- Theft events are set to **3 per site per year**, and stay editable. If a
  prospect changes that number, their value survives even after they put a
  monitoring rate back in — we only restore the pre-$0 value if they never
  touched it.
- The monitoring line goes negative, correctly: with nothing to cancel, they are
  starting a new spend. At the Conservative preset that reads −$86,400 of cash
  against $441,000 of intercepted loss, netting $367,236.

Put a rate back in and the miss rate unlocks at whatever they last set it to.

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

The clearest tell is the job-site slider: at exactly $100 per stream the
"Monitoring cash, net" line reads $0. Anyone who drags the slider looking for the
crossover finds the rate in about four seconds.

## v2.1 — changes from the review

**The disclaimer is now written per mode.** The old one described the fleet model's
50% growth discount and said nothing about the job-site side, where the discount
had been removed entirely. Each mode now names which of its own lines are
contractual and which are probabilistic, and the copied summary tags every line
`[contractual]` or `[probabilistic]` to match.

**"Every figure is net" is now stated precisely.** The sentence was true of this
build — there is no gross-spend line with the cost subtracted underneath, because
hiding the price meant collapsing them — but it read like the boilerplate from a
version where it wasn't. The basis now says exactly why it's true: the monitoring
line *is* the net movement, and nothing is netted off anywhere you can't see it.

**A fixed 40% haircut is back on the job-site loss and reporting lines.** It's a
constant, not a slider, so nobody can quietly discount the headline to nothing —
but the cash-versus-risk distinction it was protecting is restored. Both lines now
show gross, then the discount, then the net. Conservative job-site net drops from
$29,136 to about $22,000 as a result.

**The 2% miss rate no longer claims to be measured.** It was described as a
production figure alongside the 95% accuracy and <5% false-positive numbers. Those
are *precision*; the model monetises *recall*, and one cannot be derived from the
other. The basis now carries a section saying so and calls 2% a planning
assumption with a validated recall benchmark in progress. It stays locked.

**Every probabilistic line shows its gross before the discount.** Previously they
showed inputs and the discount but not the intermediate figure, so a reader could
not check the arithmetic without doing it themselves.

**The page no longer renders $0 before scripts run.** The conservative fleet result
is hard-coded into the markup — hero, all four ledger rows with their working, and
the three stat tiles — and an automated check asserts the static text is character
for character what the script computes, so nothing flashes or contradicts. A
`<noscript>` block states the defaults in plain language.

**New: send this summary to yourself.** Never gated — the result is fully visible
without it. `CAPTURE_ENDPOINT` in `app.js` is null, so nothing leaves the browser
and the button hands the summary to the visitor's own mail client. Point it at a
collector and it will POST `{email, mode, preset, inputs, summary}` instead, which
is the input-distribution data the review asked for. **Publish a privacy notice
before you enable that.**

**New: banded-pricing flag.** Above 100 cameras on a single site the ledger says
pricing converts to a monthly site fee with a camera allowance. The job-site camera
slider went from 2–40 to 2–400 so that case is actually reachable — at 40 it was
unreachable code.

**New: null-case flag.** Enter zero theft events and the page says so, and credits
zero loss avoidance.

### Still open from the review

- **Falsifiability.** "Set the incumbent miss rate to 0% and watch the benefit go
  to zero" is the strongest answer to a skeptic, and your 10–35% floor makes it
  unreachable. Same for the fleet: the $100 rate floor equals the price exactly, so
  the monitoring line can never go negative and the under-price warning I built is
  currently dead code. Both are one number away from being testable.
- **The price is $100 here, and the review is written against $80.** Every
  competitive argument in it — the GC multiplying 250 × $80, the margin floor —
  is computed on the wrong number. Worth correcting before it drives a decision.
- **Hiding it buys less than it looks like.** At exactly $100 per stream the
  job-site monitoring line reads $0. Anyone dragging the slider finds the crossover
  in seconds.

## Capturing the submissions

`CAPTURE_ENDPOINT` in `app.js` is still `null`, so nothing leaves the browser
until you deploy the receiver in the `roi-capture/` folder and paste its URL in.

An MCP connector cannot do this job — those let Claude talk to Airtable, they do
not run in a visitor's browser. The site needs a public HTTPS endpoint, and the
Airtable token must never appear in client JavaScript, because anyone reading the
page source would then have write access to the whole CRM base.

**What is already built.** A table called **ROI Submissions**
(`tblqjCnK41sDnwMHx`) now exists in *SentriOS Key Accounts CRM*, with a column
per input, the headline figures, the verbatim summary, raw JSON of every input
so old rows survive a schema change, referrer, status and a link to Contacts.

**The receiver** is a Cloudflare Worker in `roi-capture/`. It holds the token as
a Worker secret, accepts POSTs only from sentrios.ai, drops honeypot hits
silently, throttles by IP, clamps every number before writing, and never echoes
an Airtable error to the browser. `npm test` runs fifteen tests against it,
including that the token cannot leak into a response. `DEPLOY.md` is a ten-minute
walkthrough. Use a `data.records:write`-only token scoped to that one base — the
Worker never reads, so a stolen token would be worthless.

**Two kinds of record land in the table.** A named one when somebody enters an
address, and an anonymous one on page-leave when somebody moved a slider but
never gave an address. The second is the input-distribution data — what the
market actually pays per stream, real camera counts, which assumption set people
drift toward — with no personal data attached.

**The button is "Get the full working," and the address is optional.** It briefly
said "Open in my mail app", which did not work: assigning `location.href` to a
`mailto:` does nothing at all when the browser has no registered mail handler,
which is most people, because most people use webmail. There is no way to detect
that from JavaScript, so the page was claiming success that never happened. The
summary is now delivered as a downloaded `.txt` and copied to the clipboard —
both work everywhere, with no handler and no third party — and the mail app is
offered as a link underneath for anyone who does have one. Capture fires either
way, and leaving the address blank still gets you the file.

**Before switching it on:** the address plus a visitor's own operating numbers is
personal data. The consent line under the field points at a deletion route; add a
matching paragraph to the privacy policy covering what is stored, why, and for
how long.

## Two things worth a decision before you publish

1. **Aggressive-preset monitoring rate.** The fleet and job-site sliders both cap
   at $250/stream/month and the Aggressive preset sits right on the cap, which
   makes it the most favourable case the tool can produce. Worth checking that
   $250 is a rate you can point at a real contract.
2. **Number conflict with `agents.html`.** The "Why VLM" section there says
   traditional monitoring is "$200–400 per camera, per month." The calculator's
   slider runs $100–250 and defaults to $150. A prospect reading both pages will
   notice.
