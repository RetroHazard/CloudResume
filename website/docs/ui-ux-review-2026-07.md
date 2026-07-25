# UI/UX review — "RAPID" Tokyo transit redesign

Scope: the redesign shipped by `feat/site-redesign` (`a4ef425..0132e4c`), reviewed
against `main` (`3c97f89`) as the baseline.

Method: read of every route and shared primitive, plus a rendered sweep of all 8
routes at 1440 / 820 / 390 / 320 px in Chromium, `axe-core` on every route at
desktop and mobile widths, keyboard-focus and touch-target measurement, print-media
emulation, and a `prefers-reduced-motion` pass. Findings marked **fixed** are
addressed on this branch; the rest are recorded for follow-up.

---

## Verdict

The design language is strong and unusually coherent. The transit metaphor is
carried all the way down — routes are platform boards, jobs are departures with
line roundels and service status, the 404 is a "no service" notice, the ambient
backdrop is a procedurally generated network map. The ARIA hygiene is genuinely
good: after one heading-order fix, `axe-core` reports zero violations on every
route at both desktop and mobile widths, and `prefers-reduced-motion` is honoured
throughout.

The problem is that essentially all of that design work only exists above 740px.
Below the `sm` breakpoint the redesign was not adapted, and the result was not
merely cramped — it was unusable. That was the dominant finding and the bulk of
the work here.

---

## P0 — Mobile was unusable

### 1. Primary navigation rendered as seven unlabelled dots — **fixed**

`navbar.jsx` hid the icon below `sm` (`max-sm:hidden`) while the label was already
`max-sm:sr-only`. The only remaining visible child of each `NavLink` was the
decorative, `aria-hidden` station node. Every nav destination was therefore an
anonymous coloured circle.

This is a regression the redesign introduced: `main` showed icon tiles on mobile.

Fixed by giving the nav a distinct mobile mode — the stops wrap into a labelled
chip grid above the content, the desktop rail is unchanged from `sm` up, and the
rail line (which only reads as a line when the stops are stacked) is desktop-only.

### 2. Content column was ~218px wide at a 390px viewport — **fixed**

`App.js` used an unconditional `flex` row with `w-3/5` on the content column, so a
390px phone got a 66px nav plus a 218px board. This layout predates the redesign,
but the redesign is far less tolerant of it: `main`'s content was plain prose that
merely looked cramped, whereas the new boards, condensed uppercase titles and
charts overflow it.

Fixed by stacking below `sm` — nav on top, content at full width — and keeping the
two-column line map from `sm` up.

### 3. Section titles and status pills were clipped, not wrapped — **fixed**

`SectionShell` is `overflow-hidden`, so anything wider than the column was cut off
silently rather than wrapping. Measured at 390px: the `Certifications` header
extended to x=420 in a 390px viewport; users saw `CONCOURS`, `EXPERIENC`,
`928 CONTRIBUTIO`, and a `StatusPill` reduced to a single green dot.

`html { overflow-x: hidden }` in `index.css` is what kept this from showing up as a
horizontal scrollbar — the page reported `scrollWidth === clientWidth` while
content was being discarded. Worth knowing that rule masks this class of bug.

Fixed by letting the header wrap, adding `min-w-0` to the flex children, and
dropping the title to `text-xl` below `sm`.

---

## P1

### 4. Scroll-revealed content printed blank — **fixed**

`Reveal` starts at `opacity: 0` and animates on `whileInView`. Anything never
scrolled into view stays fully transparent, including in print. Confirmed under
print emulation on `/skills`: *Under Construction*, *Crew — Soft Skills* and
*Announcements — Languages* were all at `opacity: 0` in the print snapshot.

Compounding it, collapsed `<details>` rows meant a printed `/experience` showed one
job out of six, and the dark palette prints as white-on-white whenever the reader
leaves "background graphics" off.

This matters more than usual here: the site *is* a résumé, so "save as PDF" is a
first-class path. Fixed with a print stylesheet that forces reveals visible,
expands every departure row, drops ambient chrome, and flips the content to
black-on-white. `/experience` now prints all six roles with full bullet lists.

### 5. Raw data sentinels and inconsistent dates reached the UI — **fixed**

The JSON is hand-maintained and uses three different markers for "still running"
(`---` in `career_data`, `NOW` in `project_data`, empty elsewhere) and pads months
inconsistently (`2024-8-16` sat next to `2024-10-19` on adjacent certification
cards). The current role rendered as `2025-09 — ---`.

Fixed with `src/utils/dates.js` — a single place that absorbs the sentinels and
zero-pads partial dates — used by all four list components, with unit tests.

### 6. Expired certifications were presented as valid passes — **fixed**

The page frames itself as "Fare Gate · Valid Passes", but SSCP (expiry
`2017-11-30`) was listed identically to the current AWS certifications. Fixed:
cards now carry a Valid/Expired status pill and a lapsed expiry date is shown in
the alert colour.

### 7. Heading structure — **fixed**

- `/certifications` skipped `h1 → h3` (the only `axe-core` violation found).
- Home had two `h1`s: the board label "Concourse" and the name. The name's `h1`
  also contained the split-flap's scrambled glyphs rather than readable text.
- `SplitFlap` used `role="text"`, which is not a real ARIA role, so the `aria-label`
  it carried would be dropped by most screen readers.

Fixed: `SectionShell` takes a `titleAs` prop so Home's board label is a `<p>` and
the name is the page's single `h1`; certification titles are `h2`; the split-flap
exposes its settled text through an `sr-only` span instead of an invalid role.

### 8. Duplicate React keys on `/certifications` — **fixed**

Cards were keyed on `credential_id`, and three AWS certifications share
`credential_id: "N/A"` — React logged a duplicate-key warning on every render.
Now keyed on certification name plus issue date.

### 9. Split-flap held the headline unreadable for ~4 seconds — **fixed**

`settleAt = 8 + i*2 + rand(6)` at 90ms/tick puts "Alexander Bracken" (17 cells) at
roughly 4.1s before the last cell settles. The page's most important text — and its
largest contentful paint — is a glyph reel for that whole time. Retimed to settle
in ~1.5s; the effect still reads, the wait doesn't.

### 10. No explicit focus ring — **fixed**

The design system defines `--color-ring: #2ee08a` and never used it; keyboard focus
fell back to Chrome's `outline: auto 1px`, which is close to invisible against this
palette. Added a signal-green `:focus-visible` ring.

### 11. Chart labels below the legibility floor — **fixed**

`github_heatmap.tsx` clamped month labels to a 5px minimum and weekday labels to
4px. At the mobile column width both bottomed out. Raised the floor to 8px and
dropped the weekday gutter entirely on narrow containers rather than shrink it
into decoration.

### 12. Proficiency bars used a colour that contradicted the design language — **fixed**

`SkillHighlight` cycled the line-badge palette by index, so Terraform got a bar in
`--color-alert` red — the exact colour this design uses for "suspended service" —
while conveying nothing. Bars now derive their colour from the proficiency value
itself.

### 13. Contact form on narrow screens — **fixed**

First/Last name were an unconditional `flex-row`, giving two ~76px fields whose
placeholders and contents were both truncated. Inputs were also `text-sm` (14px),
which makes iOS Safari zoom the viewport on focus and strand the user mid-form.
Fields now stack below `sm` and inputs are 16px on small screens.

### 14. Touch targets — **fixed**

Mobile nav links measured 40×36px. Now 44px minimum, along with the CV download,
404 return and contact submit buttons (which were three copies of the same class
list, now a single `.ticket-button`).

### 15. Truncated board titles were unrecoverable — **fixed**

`DepartureRow` truncates by design (on-brand for a departure board), but
"Japan Immigration Statistics Das…" had no way to reveal the rest. Added `title`
attributes to the destination and operator.

---

## Recorded, not changed

These are judgement calls or larger pieces of work; flagging rather than acting.

- **Fonts are render-blocking third-party requests.** `index.html` pulls Inter,
  Barlow Condensed and JetBrains Mono from Google Fonts. `display=swap` is set, but
  the fallback for Barlow Condensed is `'Arial Narrow'`, which is absent on most
  Linux and Android devices — so the fallback is a normal-width sans and the swap
  produces a large reflow of every heading. Self-hosting the subset, or picking a
  metric-compatible fallback, would remove both the third-party dependency and the
  shift. (Google Fonts is also blocked outright in some corporate networks, in
  which case the condensed signage look never loads at all.)
- **Icons are fetched from a third-party CDN at runtime.** `@iconify-icon/react`
  resolves every icon against `api.iconify.design`. With that host unreachable,
  every social link, nav icon and technology chip renders as an empty tile — which
  is exactly what happened in this review environment. Predates the redesign, but
  the redesign leans on icons more heavily. Bundling the ~30 icons actually used
  would make the UI self-contained.
- **The desktop content column is 672px inside a 1152px container.** Fine for
  prose, tight for the Skills page, where the contribution heatmap and radar chart
  both have to compress into it. Consider letting `/skills` break out wider.
- **Radar axis tick labels (100/80/60/40/20) overlap the plot** near the top
  vertex. Cosmetic, but it is the first thing on the Skills page.
- **Departure rows are an exclusive accordion** (shared `name` on `<details>`), so
  opening one job closes another and the page height jumps under the pointer. It
  keeps the board compact; it also prevents comparing two roles. Worth a deliberate
  decision either way.
- **Line-roundel letters are frequently ambiguous** — three certifications show
  "A", every project shows the same studio as its operator. The roundel and the
  stripe colour both cycle by index and carry no meaning, which is a lot of visual
  weight for no signal.
- **Uppercase mono for long strings.** Industry-knowledge chips like
  "COMPLIANCE-DRIVEN SECURITY CONTROLS (NIST-ALIGNED HARDENING)" are hard to scan
  in uppercase monospace. The style suits short route labels better than sentences.
- **`html { overflow-x: hidden; margin-right: calc(-1 * (100vw - 100%)) }`** hides
  horizontal overflow rather than preventing it, which is what let finding #3 ship
  unnoticed. Consider removing it and fixing overflow at the source.
- **Visitor count is `max-sm:hidden`**, so the counter — the point of the Cloud
  Resume Challenge — is invisible on mobile. Predates the redesign.
- **`prettier --write` fails repo-wide**: `.prettierrc` points
  `tailwindConfig` at `./tailwind.config.js`, which no longer exists under Tailwind
  v4. Formatting could not be applied automatically.

---

## Verification

- `vitest run` — 17 files, 41 tests passing (4 snapshots updated, 7 new tests for
  the date helpers).
- `tsc --noEmit` — clean.
- `axe-core` — zero violations across all 8 routes at 1280px and 390px.
- Rendered sweep at 1440 / 820 / 390 / 320px — no horizontal overflow, no clipped
  content, no console errors on any route.
- Print emulation — no zero-opacity blocks; all departure rows expand.
- `prefers-reduced-motion: reduce` — split-flap renders settled text immediately,
  ambient map drift and train markers suppressed.
