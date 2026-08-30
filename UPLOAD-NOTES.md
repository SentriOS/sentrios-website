# SentriOS site update — RTCC / RTIC launch + security repositioning

**August 2026.** Implements *Website Changes Required* (team meeting, Aug 2026) plus the
new RTCC/RTIC vertical. Drop everything in this folder into the web root, overwriting
existing files.

**Do not delete** images already on the server that are not in this zip:
`queen-bee.png`, `autodesk.png`, `procore.png`.
(`rapidsos.png` is now superseded — see below, but leaving it in place is harmless.)

---

## New files

| File | Purpose |
|---|---|
| `rtcc.html` | **New RTCC / RTIC vertical page.** The main deliverable. |
| `rapidsos.svg` | Updated RapidSOS logo, replaces `rapidsos.png` everywhere it was referenced |
| `rtcc-alerts.jpg` | Live-alert interface visual (weapon, fight, vandalism, vehicle of interest) |
| `rtcc-chat.jpg` | Operator chat interface visual (dynamic use cases) |
| `rtcc-room.jpg` | RTCC illustration — video wall, analysts, SentriOS server highlighted in the rack |

## Changed files

| File | What changed |
|---|---|
| `index.html` | Hero, positioning, audience grid, CTA, meta — see below |
| `agents.html` | New `#publicsafety` section; hero copy expanded to cover public safety |
| `construction.html` | Added `id="remote"` anchor for the new "Remote sites" nav entry |
| `styles.css` | Appended RTCC page components + 4-up audience grid (nothing removed) |
| All pages | "Who is this for" dropdown, footer Company column, RapidSOS reference, footer tagline |

---

## What was implemented, by item

**1 · Homepage messaging.** All "job site" copy removed sitewide. Headline is now
*"Turn your cameras into autonomous agents."* The talk callout became
*"A camera that 'talks'? Yes. Just ask it what happened, or tell it what to watch for."*
Stat band reads "Communities live today".

**2 · Built for security.** Hero eyebrow is *"Agentic AI · Built for security"*, with the
supporting line *"Construction tough, utility ready, RTCC deployable"* in the hero sub,
the audience lead and the closing CTA.

**3 · Industries.** Audience grid is now four cards — Construction, Remote sites,
Utilities, RTCC / RTIC. "Inspection companies" is removed as a standalone category;
inspection is folded into the Construction and Utilities cards (Utilities already carries
a full inspection-VLM use case). Closing CTA tags now include Police departments and
Communities. `inspection.html` is left in place so existing links do not 404, but it is
no longer in the nav.

**4 · Agents / public safety.** `agents.html` hero rewritten to cover both private
property and public safety, plus a new public-safety section with situation chips and a
link through to the RTCC page.

**5 · RTCC vertical.** `rtcc.html` covers: two starting points (established Tier 1/2
centers vs. new and growing centers), four pain points with the corresponding fix,
the category argument, situations covered, dynamic use cases, architecture, integrations
and a how-we-start sequence. Copy is drawn from the RTCC deck and from Lt. Raymond Diaz's
NRTCCA 2026 session on Miami Beach PD's first year running its RTIC.

**6 · Architecture visual.** Inline SVG on `rtcc.html` (`#stack`): video wall and analysts
on the left, cameras and sensors, VMS and aggregation layer, and the **SentriOS on-prem GPU
server highlighted in gold** on the right, with the return path for incidents and clips.
Scales cleanly and needs no image asset. Supported by `rtcc-room.jpg` below it.

**7 · RapidSOS.** New SVG in place on `index.html` and `rtcc.html`.

**8 · SEO.** "RTCC" and "RTIC" appear in the `rtcc.html` title, description, canonical, OG
tags, H1 and body copy, in the homepage meta description, nav, hero CTA and audience card,
and in the footer of every page. Construction and utilities keywords are unchanged.

---

## Decisions worth confirming

- **No pricing anywhere.** The deck's per-camera licensing is deliberately absent from the
  site — RTCC/RTIC buyers procure through a quote, not a price list.
- **"CenturyOS"** in the requirements document is read as a typo for **SentriOS**; the
  diagram is labelled SentriOS.
- **Interface visuals are labelled "Illustrative"** in their captions. They are rendered
  product mockups, not screenshots of a live customer deployment. Swap in real screenshots
  when they are cleared.
- **SOC 2** is stated as a fact on `rtcc.html`. Confirm the certification status before this
  goes live to police IT audiences.
- **Legacy files** `index_3.html`, `construction_1.html`, `inspection_1.html`,
  `who-is-this-for.html` and `sentrios-godaddy-embed.html` are not in the primary nav.
  They were patched where trivial but not rewritten — consider deleting them.
