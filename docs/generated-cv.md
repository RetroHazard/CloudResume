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
  ├─ key = files/cv/<sha256(model + RENDERER_VERSION)[:24]>/BRACKEN_ALEXANDER_Resume.pdf
  ├─ ListObjectsV2 prefix=key       already rendered? sign it, done
  └─ render_pdf() → PutObject       only when the CV's content actually changed,
                                    then prune CVs rendered from older data
  └─ sign the key (unchanged signed-URL flow, see signed-downloads.md)
```

What a click costs, cheapest first:

| Situation | S3 requests | Renders |
| --- | --- | --- |
| Warm container, site unchanged | 1 conditional GET (304, no body) | 0 |
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

### Editorial rules

The site is the long form and the CV is the two-minute read. These are the only places the
CV leaves out content the site shows. Each is a named constant at the top of
`renderResume.py`:

- `SKILL_MIN_LEVEL = 50`: core skills below 50% proficiency stay on the site. The rest are
  grouped by category, strongest first. Target skills and soft skills aren't printed.
- `RECENT_YEARS = 10` and `OLDER_ROLE_BULLETS = 2`: roles that ended more than ten years
  ago keep only their first two bullets and drop their technologies line.
- `PROJECT_BULLETS = 2`: each project keeps its first two bullets.

Bullets are always taken in the order the JSON lists them, so put the strongest first.

### Things to know when editing

- **The summary is data now.** It moved from `PersonalSummary` into
  `personal_data.json` → `summary`, written with `**bold**` and `*italic*`. The site
  (`src/utils/markup.js`) and the CV (`parse_markup`) use the same pattern for both.
- **Bump `RENDERER_VERSION` when you change the layout.** It is part of the cache key.
  Without a bump, visitors keep getting the old layout until the site content next changes.
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
