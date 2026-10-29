# Generated CV

The Download CV button no longer serves a hand-made PDF. The CV is compiled from the same
JSON the site renders, so updating the site updates the CV, and there is no resume file to
keep in step by hand.

## How it works

```
site build (pnpm build-prod)
  └─ scripts/cv-source.mjs emits data/cv-source.json  ← the seven résumé JSON files, verbatim
       └─ deploy syncs it to S3 alongside the bundle

Download CV click → GET /download → λ downloadResume
  ├─ GetObject data/cv-source.json  If-None-Match: <ETag seen last time>
  │     304 → this container already resolved the CV: sign it, done
  ├─ renderResume.build_model()     project the data into exactly what the CV prints
  ├─ GetItem crc-mail-alias #current  the forwarding address to print (minted if none)
  ├─ key = files/cv/<sha256(model + RENDERER_VERSION)[:24]>/BRACKEN_ALEXANDER_Resume.pdf
  ├─ ListObjectsV2 prefix=key       already rendered? sign it, done
  └─ render_pdf() → PutObject       only when the CV's content actually changed,
                                    then prune CVs rendered from older data
  └─ sign the key (unchanged signed-URL flow, see signed-downloads.md)
```

What a click costs, cheapest first:

| Situation | S3 requests | Renders |
| --- | --- | --- |
| Warm container, site unchanged | 1 conditional GET (304, no body) + 1 alias GetItem | 0 |
| Deploy that didn't change CV content (a logo, an icon, a link) | GET + LIST | 0 |
| Cold container, CV already cached | GET + LIST | 0 |
| First click after the CV content changed | GET + LIST + PUT (+ prune) | 1 |

The cache key is a digest of the *projected* model rather than of the source file, so
anything the CV doesn't print (logos, icons, skill-bar URLs) can change without a re-render.
A render costs tens of milliseconds, and the result is a text PDF of around 13 KB.

The production smoke test (`cv-download-live.cy.js`) clicks Download CV after every deploy,
so in practice the first render after a content change happens in CI, not for a visitor.

## The renderer

`infrastructure/codebase/renderResume.py` is stdlib only and writes PDF 1.4 by hand, for
the same reason the URL signer is hand-rolled: the Lambda runtime bundles nothing that can
lay out a PDF, and functions here ship as bare `.py` files rather than layers.

The output is built to get through applicant tracking systems: one column, real text in
reading order, the standard Helvetica family (nothing embedded), clickable links, and
document metadata (title, author, keywords). Characters outside WinAnsi are folded to their
nearest ASCII equivalent, so a stray `→` turns into `->` rather than failing the render.

### Controlling the CV

The site is the long form and the CV is the two-minute read. How hard the CV edits the site
is set in data, not code, so a change goes out with a normal site deploy and the cache
re-renders on the next click.

**`cv_data.json`** (one per data set, next to the other résumé JSON):

| Key | Default | Effect |
| --- | --- | --- |
| `maxPages` | `2` | Page budget. Over budget, content is trimmed in a fixed order until it fits (below). `0` turns it off. |
| `skillMinLevel` | `50` | Core skills below this proficiency stay on the site only. |
| `recentYears` | `10` | Roles that ended longer ago than this many years stay on the site only, to the month where the data gives one. A job with no role in the window drops out entirely. |
| `projectBullets` | `2` | Bullets kept per project. |
| `sections` | all seven | Which sections print, in this order. Leave one out to drop it. Names: `summary`, `skills`, `experience`, `projects`, `certifications`, `education`, `languages`. |
| `contactEmail` | `true` | Print the forwarding address in the header (see [`cv-contact.md`](cv-contact.md)). |

A missing key or a malformed value falls back to its default rather than failing a render.

**Per-item flags**, on any entry in the other JSON files (a job, a role, a project, a skill,
a certification, a degree, a language, a social link):

- `"cv": false` keeps it on the site and off the CV.
- `"cv": "always"` exempts it from every rule: a skill under the threshold prints anyway, a
  role outside the recent window prints in full, and the page budget never trims it. On a multi-role job it
  applies to all of that job's roles.
- `"cvBullets": 3` (roles and projects) sets how many bullets that entry keeps.

Bullets are always taken in the order the JSON lists them, so put the strongest first.

**The page budget** trims the least important content first, one step at a time, and stops
as soon as the CV fits. It never drops a whole role inside the recent window, since a gap in
a career reads worse than a long CV:

1. Technologies lines under projects
2. Project bullets beyond the first, last project first
3. Technologies lines under roles, oldest first
4. Bullets beyond the third on any role, oldest first
5. Whole projects, last listed first
6. Bullets beyond the second on any role, oldest first
7. Bullets beyond the first on any role, oldest first

If pinned content alone exceeds the budget, the CV runs long rather than dropping it. The
search takes about six layouts (around 50 ms), and only on a render, never on a cached click.

### Things to know when editing

- **The summary is data now.** It moved from `PersonalSummary` into
  `personal_data.json` → `summary`, written with `**bold**` and `*italic*`. The site
  (`src/utils/markup.js`) and the CV (`parse_markup`) use the same pattern for both.
- **Bump `RENDERER_VERSION` when you change the layout or the trimming order in code.** It
  is part of the cache key. Settings and flags in the data don't need a bump: they are in
  the model, so changing them already changes the key.
- **The keys in `cv-source.mjs` are a contract** with `build_model`. Renaming one silently
  drops that section from the CV. Both sides are covered by tests
  (`src/__tests__/cvSource.test.js`, `infrastructure/tests/`).
- **Preview locally** without AWS:

  ```bash
  cd website && pnpm build-prod
  ```

  ```bash
  python3 -c "import json,sys; sys.path.insert(0,'infrastructure/codebase'); import renderResume as r; m=r.build_model(json.load(open('website/build/prod/data/cv-source.json')),'https://example.com'); open('cv.pdf','wb').write(r.render_pdf(m))"
  ```

## Operational notes

- `files/cv/` is excluded from the deploy's `aws s3 sync --delete`. The Lambda owns that
  prefix and prunes it itself after each render.
- Generated keys are content-addressed, so `cloudfrontInvalidation` skips them
  (`immutable_prefix`). There is never a stale copy at the edge to invalidate.
- IAM for `crc-DownloadIssuer` grants `GetObject` on `data/cv-source.json` and
  `PutObject`/`DeleteObject` under `files/cv/*`. `ListBucket` is limited to that prefix by
  an `s3:prefix` condition.
- If `data/cv-source.json` is missing or unreadable, `/download` returns a 500 and the
  button shows its error. The Lambda never falls back to a stale or unrelated file.
- Pruning runs only right after a content change. A visitor holding a signed URL for the
  previous CV (valid for 60s) at that moment can lose that one download. Retrying fetches
  the new one.
