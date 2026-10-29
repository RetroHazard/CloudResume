"""Compiles the site's published data into a single-column, text-based PDF CV.

Imported by downloadResume, which only calls into it when no PDF matching the current site
data is already cached in S3 — see `content_digest` for what counts as "matching".

Like the hand-rolled signer next to it, this is stdlib only. The Lambda python3.12 runtime
bundles neither reportlab nor anything else that can lay out a PDF, and every function here
ships as bare .py files rather than a layer, so the writer below emits PDF 1.4 by hand. It
stays small because of what it deliberately leaves out:

  * Only the standard Type 1 fonts (Helvetica, -Bold, -Oblique). Every conforming reader
    carries them, so nothing is embedded and a two-page CV comes out at a few kilobytes.
    The cost is WinAnsi (cp1252) as the character set; anything outside it is folded to
    the nearest ASCII by `_encode`, which covers every character the site data uses today.
  * Real text in reading order, one column, no tables or text boxes. That is what makes the
    file parse cleanly through applicant tracking systems, which is the point of
    generating a plain CV rather than printing the site.

`RENDERER_VERSION` feeds the cache key. Bump it whenever a change here alters the output,
or visitors keep receiving PDFs rendered by the previous layout until the site data changes.
"""

import copy
import hashlib
import itertools
import json
import re
import unicodedata
import zlib
from datetime import datetime, timezone

RENDERER_VERSION = '4'

# Advance widths per 1000 units of font size, for WinAnsi codes 32-255, taken from the Adobe
# core-14 AFM metrics. Oblique shares the upright widths. The zero entries are the five code
# points cp1252 leaves undefined; `_encode` never produces them.
# fmt: off
_WIDTHS = {
    'Helvetica': (
        278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
        556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
        1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
        667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
        333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
        556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584, 761,
        556, 0, 222, 556, 333, 1000, 556, 556, 333, 1000, 667, 333, 1000, 0, 611, 0,
        0, 222, 222, 333, 333, 350, 556, 1000, 333, 1000, 500, 333, 944, 0, 500, 667,
        278, 333, 556, 556, 556, 556, 260, 556, 333, 737, 370, 556, 584, 333, 737, 333,
        400, 584, 333, 333, 333, 556, 537, 278, 333, 333, 365, 556, 834, 834, 834, 611,
        667, 667, 667, 667, 667, 667, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278,
        722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611,
        556, 556, 556, 556, 556, 556, 889, 500, 556, 556, 556, 556, 278, 278, 278, 278,
        556, 556, 556, 556, 556, 556, 556, 584, 611, 556, 556, 556, 556, 500, 556, 500,
    ),
    'Helvetica-Bold': (
        278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
        556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
        975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
        667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
        333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
        611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584, 761,
        556, 0, 278, 556, 500, 1000, 556, 556, 333, 1000, 667, 333, 1000, 0, 611, 0,
        0, 278, 278, 500, 500, 350, 556, 1000, 333, 1000, 556, 333, 944, 0, 500, 667,
        278, 333, 556, 556, 556, 556, 280, 556, 333, 737, 370, 556, 584, 333, 737, 333,
        400, 584, 333, 333, 333, 611, 556, 278, 333, 333, 365, 556, 834, 834, 834, 611,
        722, 722, 722, 722, 722, 722, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278,
        722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611,
        556, 556, 556, 556, 556, 556, 889, 556, 556, 556, 556, 556, 278, 278, 278, 278,
        611, 611, 611, 611, 611, 611, 611, 584, 611, 611, 611, 611, 611, 556, 611, 556,
    ),
}
# fmt: on

# style -> (resource name, base font, metrics)
_FONTS = {
    'R': ('F1', 'Helvetica', _WIDTHS['Helvetica']),
    'B': ('F2', 'Helvetica-Bold', _WIDTHS['Helvetica-Bold']),
    'I': ('F3', 'Helvetica-Oblique', _WIDTHS['Helvetica']),
}

# Japanese text (a visa status such as 永住権) is set in Heisei Kaku Gothic through the
# predefined UniJIS-UCS2-H CMap, so the bytes shown are just UTF-16BE code units. Like the
# Helvetica family it is not embedded: readers substitute their own Japanese gothic, which is
# how reportlab's UnicodeCIDFont does it too. Every CJK glyph is full width (1000 units). It
# is only written into a PDF that uses it.
_CJK = ('F4', 'HeiseiKakuGo-W5')
_RESOURCES = {**{style: font[0] for style, font in _FONTS.items()}, 'J': _CJK[0]}

# A4: the site's owner is based in Japan, where Letter is the exception.
PAGE_W, PAGE_H = 595.28, 841.89
MARGIN_X, MARGIN_TOP, MARGIN_BOTTOM = 50.0, 48.0, 50.0
CONTENT_W = PAGE_W - 2 * MARGIN_X

INK = (0.13, 0.13, 0.15)
MUTED = (0.38, 0.40, 0.44)
ACCENT = (0.09, 0.27, 0.47)
RULE = (0.75, 0.78, 0.82)

BODY_SIZE, BODY_LEADING = 9.5, 12.6
SMALL_SIZE, SMALL_LEADING = 8.5, 11.2

# The site is the long form; the CV is the edit a recruiter reads in two minutes. How hard it
# is edited is data, not code: website/src/assets/json/<set>/cv_data.json, published with the
# rest of the site as the `cv` key of data/cv-source.json. Anything missing or malformed there
# falls back to these defaults, so a typo degrades to the stock CV rather than failing a render.
DEFAULT_SETTINGS = {
    # Page budget. When the CV runs longer, render_pdf trims in a fixed order until it fits
    # (see _cuts). 0 turns the budget off.
    'maxPages': 2,
    # core_skills below this proficiency stay on the site only.
    'skillMinLevel': 50,
    # Roles that ended longer ago than this many years stay on the site only. A job whose
    # roles all fall outside the window drops out entirely.
    'recentYears': 10,
    'projectBullets': 2,
    # Order of the tool rows in Skills, by category (or `cvCategory`). Categories left out
    # follow in the order the data lists them.
    'skillCategories': [],
    # Which sections print, and in what order. Unknown names are ignored.
    'sections': ['summary', 'skills', 'experience', 'projects', 'certifications', 'education', 'languages'],
    # Print the forwarding contact address in the header. The address itself is never in the
    # data: downloadResume supplies it at render time.
    'contactEmail': True,
}

SECTIONS = ('summary', 'skills', 'experience', 'projects', 'certifications', 'education', 'languages')
_LIMITS = {'maxPages': (0, 10), 'skillMinLevel': (0, 100), 'recentYears': (0, 60)}


def settings_from(source):
    """Merge the data's `cv` settings over the defaults, discarding anything malformed."""
    raw = source.get('cv') if isinstance(source.get('cv'), dict) else {}
    settings = dict(DEFAULT_SETTINGS)
    for key, default in DEFAULT_SETTINGS.items():
        value = raw.get(key, default)
        if isinstance(default, bool):
            settings[key] = value if isinstance(value, bool) else default
        elif isinstance(default, int):
            if isinstance(value, bool) or not isinstance(value, int):
                continue
            low, high = _LIMITS.get(key, (0, 50))
            settings[key] = min(max(value, low), high)
        elif key == 'sections' and isinstance(value, list):
            settings[key] = [s for s in dict.fromkeys(value) if s in SECTIONS]
        elif key == 'skillCategories' and isinstance(value, list):
            settings[key] = [c for c in dict.fromkeys(value) if isinstance(c, str)]
    return settings


def _on_cv(item):
    """Per-item opt-out: `"cv": false` on any entry keeps it on the site and off the CV."""
    return not (isinstance(item, dict) and item.get('cv') is False)


def _pinned(item):
    """`"cv": "always"` exempts an entry from every editorial rule and from the page budget."""
    return isinstance(item, dict) and item.get('cv') == 'always'


def _bullet_cap(item, default):
    """`"cvBullets": N` on a role or project overrides the rule-derived bullet count."""
    value = item.get('cvBullets') if isinstance(item, dict) else None
    if isinstance(value, int) and not isinstance(value, bool) and value >= 0:
        return value
    return default


# ---------------------------------------------------------------------------
# Site data -> CV model
# ---------------------------------------------------------------------------

# Mirrors website/src/utils/dates.js: the JSON is hand-maintained and uses several
# sentinels for "still running", plus inconsistent zero padding.
_ONGOING = {'---', 'now', 'present', 'current', ''}
_UNKNOWN = {'n/a', 'na', '-', '--', 'none'}
_MONTHS = ('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec')


def format_date(value):
    raw = str(value if value is not None else '').strip()
    if raw.lower() in _ONGOING:
        return 'Present'
    if raw.lower() in _UNKNOWN:
        return ''
    parts = raw.split('-')
    if not re.fullmatch(r'\d{4}', parts[0]):
        return raw
    if len(parts) > 1 and parts[1].isdigit() and 1 <= int(parts[1]) <= 12:
        return f'{_MONTHS[int(parts[1]) - 1]} {parts[0]}'
    return parts[0]


def format_range(start, end):
    start, end = format_date(start), format_date(end)
    if start and end and start != end:
        return f'{start} – {end}'
    return start or end


def _date_key(value):
    """`2024-10-19` -> (2024, 10, 19), for sorting. Anything unparseable sorts as oldest."""
    parts = str(value or '').strip().split('-')
    if not re.fullmatch(r'\d{4}', parts[0]):
        return ()
    return tuple(int(p) for p in parts if p.isdigit())


def _level(skill):
    try:
        return int(str(skill.get('level', '0')).rstrip('%'))
    except ValueError:
        return 0


def _texts(items):
    return [str(item).strip() for item in items or [] if str(item).strip()]


def _names(items):
    return [str(item['name']).strip() for item in items or [] if str(item.get('name', '')).strip()]


def build_model(source, site_url, today=None, contact_email=None):
    """Project the site's JSON into exactly the content the CV prints.

    The projection is also the cache key (see `content_digest`), so it carries only what
    reaches the page, plus the settings that decide how it is laid out. A new logo, icon or
    link on the site leaves it unchanged and reuses the cached PDF; a reworded bullet, a new
    role, a changed rule in cv_data.json or a rotated contact address does not.

    `today` only decides which roles count as recent.
    Pass it explicitly in tests so the model does not drift with the calendar.

    `contact_email` is the forwarding address downloadResume issues. It is printed only when
    the settings ask for it.
    """
    today = today or datetime.now(timezone.utc).date()
    settings = settings_from(source)
    personal = source.get('personal') or {}
    skills = source.get('skills') or {}

    links = [{'label': re.sub(r'^https?://', '', site_url).rstrip('/'), 'url': site_url}]
    if contact_email and settings['contactEmail']:
        links.insert(0, {'label': contact_email, 'url': f'mailto:{contact_email}'})
    for social in (source.get('socials') or {}).get('Socials', []):
        if social.get('display') and social.get('link') and _on_cv(social):
            label = re.sub(r'^https?://(www\.)?', '', social['link']).rstrip('/')
            # Socials get a line of their own in the header, under the direct contact details.
            links.append({'label': label, 'url': social['link'], 'social': True})

    cutoff = (today.year - settings['recentYears'], today.month)

    def recent(role):
        # Month precision where the data has it; a bare year counts as ending in December.
        parts = str(role.get('end') or '').strip().split('-')
        if not re.fullmatch(r'\d{4}', parts[0]):
            return True  # ongoing, or a date the data doesn't pin down
        month = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() and 1 <= int(parts[1]) <= 12 else 12
        return (int(parts[0]), month) >= cutoff

    def role_model(role):
        return {
            'title': role.get('job_title', ''),
            'dates': format_range(role.get('start'), role.get('end')),
            'details': _texts(role.get('details'))[: _bullet_cap(role, None)],
            'technologies': _names(role.get('technologies')),
            'pinned': _pinned(role),
        }

    experience = []
    for entry in (source.get('career') or {}).get('Experience', []):
        if not _on_cv(entry):
            continue
        # A single-role entry carries its role fields (and flags) on the entry itself, and a
        # job's flag applies to each of its roles unless the role sets its own.
        roles = [dict(role, cv=role.get('cv', entry.get('cv'))) for role in (entry.get('roles') or [entry])]
        roles = [r for r in roles if _on_cv(r) and (_pinned(r) or recent(r))]
        if not roles:
            continue
        experience.append(
            {
                'company': entry.get('company', ''),
                'location': entry.get('location', ''),
                'type': entry.get('type', ''),
                'roles': [role_model(role) for role in roles],
            }
        )

    projects = [
        {
            'name': project.get('name', ''),
            'subtitle': ' · '.join(p for p in (project.get('category'), project.get('role')) if p),
            'dates': format_range(project.get('start'), project.get('end')),
            'details': _texts(project.get('details'))[
                : _bullet_cap(project, None if _pinned(project) else settings['projectBullets'])
            ],
            'technologies': _names(project.get('technologies')),
            'pinned': _pinned(project),
        }
        for project in (source.get('projects') or {}).get('Projects', [])
        if _on_cv(project)
    ]

    # Strongest first within each category. Categories follow the `skillCategories` setting,
    # then the order the site lists them. `cvCategory` regroups a skill on the CV only.
    def category(skill, default):
        return skill.get('cvCategory') or skill.get('category') or default

    strong = [
        s for s in skills.get('core_skills', []) if _on_cv(s) and (_pinned(s) or _level(s) >= settings['skillMinLevel'])
    ]
    grouped = {}
    for skill in sorted(strong, key=_level, reverse=True):
        grouped.setdefault(category(skill, 'Other'), []).append(skill['name'])
    order = [c for c in settings['skillCategories'] if c in grouped]
    order += [c for c in dict.fromkeys(category(s, 'Other') for s in strong) if c not in order]
    technical = [{'category': c, 'items': grouped[c]} for c in order]

    competencies = {}
    for item in skills.get('industry_knowledge', []):
        if _on_cv(item) and str(item.get('name', '')).strip():
            competencies.setdefault(category(item, 'Core Competencies'), []).append(str(item['name']).strip())

    certifications = []
    for cert in (source.get('certifications') or {}).get('Certifications', []):
        if not _on_cv(cert):
            continue
        certifications.append(
            {
                'name': cert.get('certification', ''),
                'issuer': cert.get('issuer', ''),
                # Only the grant date: an expiry reads like a job's date range to a parser.
                'issued': format_date(cert.get('issued_date')),
                'order': _date_key(cert.get('issued_date')),
            }
        )
    # Newest first, by grant date: with only that date printed, any other order reads as a
    # mistake. Stable, so credentials granted together keep the site's order.
    certifications.sort(key=lambda c: c['order'], reverse=True)
    for cert in certifications:
        del cert['order']

    education = [
        {
            'school': entry.get('school', ''),
            'degree': entry.get('degree', ''),
            'minor': entry.get('minor', ''),
            'location': entry.get('location', ''),
            'dates': format_range(entry.get('start'), entry.get('end')),
        }
        for entry in (source.get('education') or {}).get('Education', [])
        if _on_cv(entry)
    ]

    return {
        'name': personal.get('fullName', ''),
        'headline': personal.get('jobTitle', ''),
        'location': personal.get('location', ''),
        'links': links,
        'authorization': _texts(personal.get('workAuthorization')),
        # `cvSummary`, when present, replaces the site's summary on the CV only.
        'summary': _texts(personal.get('cvSummary') or personal.get('summary')),
        'competencies': [{'category': c, 'items': items} for c, items in competencies.items()],
        'technical': technical,
        'experience': experience,
        'projects': projects,
        'certifications': certifications,
        'education': education,
        'languages': [
            {'language': lang.get('language', ''), 'level': lang.get('level', '')}
            for lang in skills.get('language_skills', [])
            if _on_cv(lang)
        ],
        'sections': settings['sections'],
        'maxPages': settings['maxPages'],
    }


def content_digest(model):
    """Cache key for a model: identical content and renderer always map to the same PDF."""
    canonical = json.dumps(model, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
    return hashlib.sha256(f'{RENDERER_VERSION}\n{canonical}'.encode('utf-8')).hexdigest()


def file_name(model):
    """`BRACKEN_ALEXANDER_CV.pdf` — surname first, as the old static file was named."""
    words = [re.sub(r'[^A-Za-z0-9]', '', _ascii(w)).upper() for w in model.get('name', '').split()]
    words = [w for w in words if w]
    if not words:
        return 'CV.pdf'
    return '_'.join([words[-1]] + words[:-1] + ['CV']) + '.pdf'


# ---------------------------------------------------------------------------
# Text handling
# ---------------------------------------------------------------------------

_FOLD = {
    ' ': ' ',
    ' ': ' ',
    '‐': '-',
    '‑': '-',
    '−': '-',
    '→': '->',
    '←': '<-',
    '≤': '<=',
    '≥': '>=',
    '≈': '~',
    '✓': '',
    '✔': '',
}


def _ascii(text):
    return unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')


def _encode(text):
    """Text -> WinAnsi bytes, folding what cp1252 cannot carry rather than failing."""
    out = bytearray()
    for char in text:
        char = _FOLD.get(char, char)
        if not char or (len(char) == 1 and unicodedata.category(char) == 'Cc'):
            continue
        try:
            out += char.encode('cp1252')
        except UnicodeEncodeError:
            out += (_ascii(char) or '?').encode('ascii')
    return bytes(out)


def _is_cjk(char):
    return unicodedata.east_asian_width(char) in ('W', 'F') and ord(char) <= 0xFFFF


def _pieces(text, style='R'):
    """Text -> [(style, bytes)], setting CJK runs in the Japanese font instead of folding them."""
    pieces = []
    for cjk, run in ((k, ''.join(g)) for k, g in itertools.groupby(text, _is_cjk)):
        if cjk:
            pieces.append(('J', run.encode('utf-16-be')))
        elif run:
            pieces.append((style, _encode(run)))
    return pieces


def _width(encoded, style, size):
    if style == 'J':
        return len(encoded) / 2 * size
    metrics = _FONTS[style][2]
    return sum(metrics[b - 32] if b >= 32 else 0 for b in encoded) * size / 1000.0


def text_width(text, style, size):
    return _width(_encode(text), style, size)


def _pdf_string(encoded):
    return b'(' + encoded.replace(b'\\', b'\\\\').replace(b'(', b'\\(').replace(b')', b'\\)') + b')'


_MARKUP = re.compile(r'(\*\*.+?\*\*|\*.+?\*)')


def parse_markup(text):
    """`**bold**` and `*italic*` -> [(style, text)]. Shared with the site's PersonalSummary."""
    runs = []
    for part in _MARKUP.split(text):
        if not part:
            continue
        if part.startswith('**') and part.endswith('**') and len(part) > 4:
            runs.append(('B', part[2:-2]))
        elif part.startswith('*') and part.endswith('*') and len(part) > 2:
            runs.append(('I', part[1:-1]))
        else:
            runs.append(('R', part))
    return runs


def _words(runs):
    """Split styled runs into wrap units.

    A unit is everything between two spaces, which can span runs: `**AWS**,` is one unit of
    a bold piece and a regular comma, and must never break between them.
    """
    words, current, spaced, pending = [], [], False, False
    for style, text in runs:
        # With a capturing group, odd indices are always the whitespace separators.
        for i, chunk in enumerate(re.split(r'(\s+)', text)):
            if i % 2:
                if current:
                    words.append((spaced, current))
                    current = []
                pending = True
            elif chunk:
                if not current:
                    spaced, pending = pending, False
                current.append((style, _encode(chunk)))
    if current:
        words.append((spaced, current))
    return words


def wrap(runs, size, width):
    """Greedy word wrap -> list of lines, each a list of (style, bytes) pieces."""
    lines, line, line_w = [], [], 0.0
    for spaced, pieces in _words(runs):
        word_w = sum(_width(b, s, size) for s, b in pieces)
        space = (pieces[0][0], b' ')
        space_w = _width(b' ', pieces[0][0], size) if (line and spaced) else 0.0
        if line and line_w + space_w + word_w > width:
            lines.append(line)
            line, line_w, space_w = [], 0.0, 0.0
        if line and spaced:
            line.append(space)
        line.extend(pieces)
        line_w += space_w + word_w
    if line:
        lines.append(line)
    return lines


# ---------------------------------------------------------------------------
# Layout
# ---------------------------------------------------------------------------


class _Page:
    def __init__(self):
        self.ops = []
        self.links = []


class _Layout:
    def __init__(self):
        self.pages = []
        self._new_page()

    def _new_page(self):
        self.page = _Page()
        self.pages.append(self.page)
        self.y = PAGE_H - MARGIN_TOP

    def ensure(self, height):
        if self.y - height < MARGIN_BOTTOM:
            self._new_page()

    def gap(self, height):
        self.y -= height

    def _color(self, rgb):
        return '{:.3f} {:.3f} {:.3f} rg'.format(*rgb).encode('ascii')

    def text(self, pieces, x, baseline, size, color=INK):
        # Consecutive pieces in one style become a single string: fewer operators, a smaller
        # file, and extractors see whole phrases rather than a word per show-text call.
        merged = []
        for style, encoded in pieces:
            if merged and merged[-1][0] == style:
                merged[-1] = (style, merged[-1][1] + encoded)
            else:
                merged.append((style, encoded))
        ops = [b'BT', self._color(color), f'{x:.2f} {baseline:.2f} Td'.encode('ascii')]
        for style, encoded in merged:
            ops.append(f'/{_RESOURCES[style]} {size} Tf'.encode('ascii'))
            shown = b'<' + encoded.hex().upper().encode('ascii') + b'>' if style == 'J' else _pdf_string(encoded)
            ops.append(shown + b' Tj')
        ops.append(b'ET')
        self.page.ops.append(b' '.join(ops))

    def rule(self, y, color=RULE, weight=0.6):
        self.page.ops.append(
            '{:.3f} {:.3f} {:.3f} RG {} w {:.2f} {:.2f} m {:.2f} {:.2f} l S'.format(
                *color, weight, MARGIN_X, y, PAGE_W - MARGIN_X, y
            ).encode('ascii')
        )

    def link(self, x, baseline, width, size, url):
        self.page.links.append((x, baseline - size * 0.25, x + width, baseline + size * 0.9, url))

    # -- composite blocks ---------------------------------------------------

    @staticmethod
    def _lines(runs, size, indent, bullet):
        return wrap(runs, size, CONTENT_W - indent - (9.0 if bullet else 0.0))

    def height(self, runs, size=BODY_SIZE, leading=BODY_LEADING, indent=0.0, bullet=False):
        return len(self._lines(runs, size, indent, bullet)) * leading

    def paragraph(self, runs, size=BODY_SIZE, leading=BODY_LEADING, indent=0.0, color=INK, bullet=False, keep=0.0):
        """Never split across pages: a paragraph that doesn't fit, plus `keep` points of whatever
        must stay with it, starts on the next page instead."""
        x = MARGIN_X + indent
        hang = 9.0 if bullet else 0.0
        lines = self._lines(runs, size, indent, bullet)
        self.ensure(len(lines) * leading + keep)
        for i, line in enumerate(lines):
            self.ensure(leading)
            self.y -= leading
            if bullet and i == 0:
                self.text([('R', b'\x95')], x + 1.5, self.y, size, color=MUTED)
            self.text(line, x + hang, self.y, size, color=color)

    def heading(self, title):
        # Never strand a heading at the foot of a page: demand room for it and two lines.
        self.ensure(21 + 3 * BODY_LEADING)
        self.y -= 18
        self.text([('B', _encode(title.upper()))], MARGIN_X, self.y, 10.5, color=ACCENT)
        self.y -= 4
        self.rule(self.y)
        self.y -= 1

    def split_line(self, left, right, size=BODY_SIZE, leading=BODY_LEADING, color=INK):
        """Left-aligned runs with a right-aligned muted note (dates) on the same baseline."""
        note = _encode(right or '')
        note_w = _width(note, 'R', size - 0.5)
        lines = wrap(left, size, CONTENT_W - note_w - 12)
        for i, line in enumerate(lines):
            self.ensure(leading)
            self.y -= leading
            self.text(line, MARGIN_X, self.y, size, color=color)
            if i == 0 and note:
                self.text([('R', note)], PAGE_W - MARGIN_X - note_w, self.y, size - 0.5, color=MUTED)


def _header(doc, model):
    doc.y -= 20
    doc.text([('B', _encode(model['name']))], MARGIN_X, doc.y, 21, color=INK)
    if model['headline']:
        doc.y -= 16
        doc.text([('R', _encode(model['headline']))], MARGIN_X, doc.y, 11.5, color=ACCENT)

    # Contact lines: location, address and site first, then the social profiles, then work
    # authorization, each on a line of its own. Each link gets its own annotation, so it stays clickable in every viewer while
    # the visible text remains plain, parseable text. A line that outgrows the page wraps
    # rather than running off it.
    size = SMALL_SIZE + 0.5
    sep = _encode('  |  ')
    contact = ([{'label': model['location']}] if model['location'] else []) + [
        link for link in model['links'] if not link.get('social')
    ]
    social = [link for link in model['links'] if link.get('social')]
    authorization = [{'label': text} for text in model.get('authorization', [])]
    step = 14
    for items in (contact, social, authorization):
        if not items:
            continue
        doc.y -= step
        step, x = SMALL_LEADING, MARGIN_X
        for i, item in enumerate(items):
            label = _pieces(item['label'])
            label_w = sum(_width(b, style, size) for style, b in label)
            if i and x + _width(sep, 'R', size) + label_w > PAGE_W - MARGIN_X:
                doc.y -= SMALL_LEADING
                x = MARGIN_X
            elif i:
                doc.text([('R', sep)], x, doc.y, size, color=RULE)
                x += _width(sep, 'R', size)
            doc.text(label, x, doc.y, size, color=MUTED)
            if item.get('url'):
                doc.link(x, doc.y, label_w, size, item['url'])
            x += label_w
    doc.y -= 6


def _summary(doc, model):
    if not model['summary']:
        return
    doc.heading('Summary')
    for i, text in enumerate(model['summary']):
        if i:
            doc.gap(3)
        doc.paragraph(parse_markup(text))


def _skills(doc, model):
    if not (model['competencies'] or model['technical']):
        return
    doc.heading('Skills')
    # What the candidate does, then a little air, then the tools they do it with.
    for n, rows in enumerate((model['competencies'], model['technical'])):
        if n and rows and model['competencies']:
            doc.gap(3)
        for group in rows:
            doc.paragraph(
                [('B', f'{group["category"]}: '), ('R', ', '.join(group['items']))], leading=BODY_LEADING - 0.4
            )


_TECH_STYLE = {'size': SMALL_SIZE, 'leading': SMALL_LEADING, 'indent': 9.0}


def _tech_runs(names):
    return [('B', 'Technologies: '), ('R', ', '.join(names))] if names else []


def _bullets(doc, details, names):
    """Bullets, then the technologies line, which is kept on the page of the last bullet."""
    tech = _tech_runs(names)
    keep = doc.height(tech, **_TECH_STYLE) if tech else 0.0
    for i, detail in enumerate(details):
        doc.paragraph([('R', detail)], bullet=True, keep=keep if i == len(details) - 1 else 0.0)
    if tech:
        doc.paragraph(tech, color=MUTED, **_TECH_STYLE)


def _experience(doc, model):
    if not model['experience']:
        return
    doc.heading('Experience')
    for n, job in enumerate(model['experience']):
        if n:
            doc.gap(6)
        meta = ' · '.join(p for p in (job['location'], job['type']) if p)
        for r, role in enumerate(job['roles']):
            # Keep each role's title with at least its first bullet.
            doc.ensure(BODY_LEADING * (3 if r == 0 else 2))
            if r:
                doc.gap(3)
            # The company goes on every role, not just the first: a parser reads each title line
            # as its own job, and a role without an employer gets merged into its neighbour.
            doc.split_line([('B', role['title']), ('R', ' — '), ('B', job['company'])], role['dates'])
            if r == 0 and meta:
                doc.paragraph([('I', meta)], size=SMALL_SIZE, leading=SMALL_LEADING, color=MUTED)
            _bullets(doc, role['details'], role['technologies'])


def _projects(doc, model):
    if not model['projects']:
        return
    doc.heading('Projects')
    for n, project in enumerate(model['projects']):
        if n:
            doc.gap(5)
        doc.ensure(BODY_LEADING * 3)
        left = [('B', project['name'])]
        if project['subtitle']:
            left += [('R', ' — ' + project['subtitle'])]
        doc.split_line(left, project['dates'])
        _bullets(doc, project['details'], project['technologies'])


def _certifications(doc, model):
    if not model['certifications']:
        return
    doc.heading('Certifications')
    # The date stays on the name's line, in reading order. Right-aligned, a parser collects the
    # dates as a column of their own and can no longer tell which belongs to which credential.
    for cert in model['certifications']:
        tail = ' · '.join(p for p in (cert['issuer'], cert['issued']) if p)
        doc.paragraph([('B', cert['name'])] + ([('R', ' — ' + tail)] if tail else []), leading=BODY_LEADING - 0.4)


def _education(doc, model):
    if not model['education']:
        return
    doc.heading('Education')
    for n, entry in enumerate(model['education']):
        if n:
            doc.gap(3)
        doc.ensure(BODY_LEADING * 2)
        doc.split_line([('B', entry['degree']), ('R', ' — ' + entry['school'])], entry['dates'])
        meta = ' · '.join(
            p for p in (f'Minor in {entry["minor"]}' if entry.get('minor') else '', entry['location']) if p
        )
        if meta:
            doc.paragraph([('I', meta)], size=SMALL_SIZE, leading=SMALL_LEADING, color=MUTED)


def _languages(doc, model):
    if not model['languages']:
        return
    doc.heading('Languages')
    parts = []
    for i, lang in enumerate(model['languages']):
        if i:
            parts.append(('R', '   ·   '))
        parts.append(('B', lang['language']))
        if lang['level']:
            parts.append(('R', f' ({lang["level"]})'))
    doc.paragraph(parts)


_SECTION_RENDERERS = {
    'summary': _summary,
    'skills': _skills,
    'experience': _experience,
    'projects': _projects,
    'certifications': _certifications,
    'education': _education,
    'languages': _languages,
}


def _layout(model):
    doc = _Layout()
    _header(doc, model)
    for section in model.get('sections', SECTIONS):
        _SECTION_RENDERERS[section](doc, model)

    # Footers go on last, once the page count is known.
    total = len(doc.pages)
    footer_y = MARGIN_BOTTOM - 24
    for number, page in enumerate(doc.pages, start=1):
        doc.page = page
        left = _encode(f'{model["name"]} — Curriculum Vitae')
        right = _encode(f'Page {number} of {total}')
        doc.text([('R', left)], MARGIN_X, footer_y, 7.5, color=MUTED)
        doc.text([('R', right)], PAGE_W - MARGIN_X - _width(right, 'R', 7.5), footer_y, 7.5, color=MUTED)

    return doc.pages


# ---------------------------------------------------------------------------
# Page budget
# ---------------------------------------------------------------------------


def _cuts(model):
    """Trim `model` in place, one step at a time, least important content first.

    A generator, so the caller can apply any number of steps and measure the result. The
    order below is the editorial policy. Entries marked `"cv": "always"` are never touched,
    and whole roles are never dropped, since a gap in a career reads worse than a long CV.

      1. Technologies lines under projects
      2. Project bullets beyond the first, last project first
      3. Technologies lines under roles, oldest first
      4. Bullets beyond the third on any role, oldest first
      5. Whole projects, last listed first
      6. Bullets beyond the second on any role, oldest first
      7. Bullets beyond the first on any role, oldest first
    """
    roles = [role for job in reversed(model['experience']) for role in reversed(job['roles']) if not role['pinned']]
    projects = [p for p in reversed(model['projects']) if not p['pinned']]

    def trim(items, keep):
        for item in items:
            while len(item['details']) > keep:
                item['details'].pop()
                yield

    if any(p['technologies'] for p in projects):
        for project in projects:
            project['technologies'] = []
        yield
    yield from trim(projects, 1)
    for role in roles:
        if role['technologies']:
            role['technologies'] = []
            yield
    yield from trim(roles, 3)
    for project in projects:
        model['projects'].remove(project)
        yield
    yield from trim(roles, 2)
    yield from trim(roles, 1)


def _trimmed(model, steps):
    """A copy of `model` with the first `steps` cuts applied."""
    trimmed = copy.deepcopy(model)
    # zip draws from range first, so it stops after exactly `steps` cuts and never runs one more.
    for _ in zip(range(steps), _cuts(trimmed)):
        pass
    return trimmed


def fit(model):
    """Lay out `model`, trimming it to its page budget. Returns (fitted model, pages).

    Takes the fewest cuts that bring the CV within budget, found by binary search over the
    number of steps `_cuts` yields: each extra step only removes content, so page count never
    rises with it. That costs a handful of layouts rather than one per step, which matters on
    a fraction of a vCPU.

    The result is a pure function of the model and RENDERER_VERSION, so fitting happens at
    render time and the cache key stays the cheap digest of the untrimmed model. If even the
    fully trimmed CV is over budget it is returned as is: pinned content wins over the budget.
    """
    pages = _layout(model)
    budget = model.get('maxPages') or 0
    if not budget or len(pages) <= budget:
        return model, pages

    total = sum(1 for _ in _cuts(copy.deepcopy(model)))
    low, high = 1, total
    best = None
    while low <= high:
        mid = (low + high) // 2
        candidate = _trimmed(model, mid)
        candidate_pages = _layout(candidate)
        if len(candidate_pages) <= budget:
            best, high = (candidate, candidate_pages), mid - 1
        else:
            low = mid + 1
    if best is None:
        candidate = _trimmed(model, total)
        best = (candidate, _layout(candidate))
    return best


# ---------------------------------------------------------------------------
# PDF serialisation
# ---------------------------------------------------------------------------


def _text_string(value):
    """Document-info strings as UTF-16BE, so the title keeps its em dash in every viewer."""
    return b'<FEFF' + value.encode('utf-16-be').hex().upper().encode('ascii') + b'>'


def _cjk_font(objects, reserve):
    """Write the Japanese Type0 font and return its object number.

    No ToUnicode map: with a predefined CMap, readers and text extractors derive Unicode from
    the CMap name itself, and pdfminer misreads an explicit identity map as keyed by CID.
    """
    font, cid_font, descriptor = reserve(), reserve(), reserve()
    name = _CJK[1]
    objects[font - 1] = (
        f'<< /Type /Font /Subtype /Type0 /BaseFont /{name}-UniJIS-UCS2-H /Encoding /UniJIS-UCS2-H '
        f'/DescendantFonts [{cid_font} 0 R] >>'
    ).encode('ascii')
    objects[cid_font - 1] = (
        f'<< /Type /Font /Subtype /CIDFontType0 /BaseFont /{name} '
        f'/CIDSystemInfo << /Registry (Adobe) /Ordering (Japan1) /Supplement 2 >> '
        f'/FontDescriptor {descriptor} 0 R /DW 1000 >>'
    ).encode('ascii')
    # Metrics as reportlab publishes them for this face.
    objects[descriptor - 1] = (
        f'<< /Type /FontDescriptor /FontName /{name} /Flags 4 /FontBBox [-92 -250 1010 922] '
        f'/ItalicAngle 0 /Ascent 752 /Descent -221 /CapHeight 737 /StemV 114 >>'
    ).encode('ascii')
    return font


def render_pdf(model, generated_at=None):
    """Lay the model out and serialise it. Returns the PDF as bytes."""
    generated_at = generated_at or datetime.now(timezone.utc)
    model, pages = fit(model)

    objects = []  # index i holds object number i + 1

    def reserve():
        objects.append(None)
        return len(objects)

    catalog, page_tree, info = reserve(), reserve(), reserve()
    font_refs = {}
    for resource, base_font, _ in _FONTS.values():
        number = reserve()
        objects[number - 1] = (
            f'<< /Type /Font /Subtype /Type1 /BaseFont /{base_font} /Encoding /WinAnsiEncoding >>'.encode('ascii')
        )
        font_refs[resource] = number
    if any(f'/{_CJK[0]} '.encode('ascii') in op for page in pages for op in page.ops):
        font_refs[_CJK[0]] = _cjk_font(objects, reserve)
    fonts = ' '.join(f'/{name} {num} 0 R' for name, num in font_refs.items())

    kids = []
    for page in pages:
        content = zlib.compress(b'\n'.join(page.ops), 9)
        stream = reserve()
        objects[stream - 1] = (
            f'<< /Length {len(content)} /Filter /FlateDecode >>\nstream\n'.encode('ascii') + content + b'\nendstream'
        )
        annots = []
        for x1, y1, x2, y2, url in page.links:
            annot = reserve()
            uri = _pdf_string(url.encode('ascii', 'ignore'))
            objects[annot - 1] = (
                f'<< /Type /Annot /Subtype /Link /Rect [{x1:.2f} {y1:.2f} {x2:.2f} {y2:.2f}] '
                f'/Border [0 0 0] /A << /S /URI /URI '.encode('ascii')
                + uri
                + b' >> >>'
            )
            annots.append(f'{annot} 0 R')
        number = reserve()
        kids.append(number)
        objects[number - 1] = (
            f'<< /Type /Page /Parent {page_tree} 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] '
            f'/Resources << /Font << {fonts} >> /ProcSet [/PDF /Text] >> '
            f'/Contents {stream} 0 R /Annots [{" ".join(annots)}] >>'
        ).encode('ascii')

    objects[catalog - 1] = (
        f'<< /Type /Catalog /Pages {page_tree} 0 R /Lang (en) /ViewerPreferences << /DisplayDocTitle true >> >>'
    ).encode('ascii')
    objects[page_tree - 1] = (
        f'<< /Type /Pages /Kids [{" ".join(f"{k} 0 R" for k in kids)}] /Count {len(kids)} >>'
    ).encode('ascii')

    keywords = ', '.join([item for group in model['competencies'] for item in group['items']][:12])
    stamp = generated_at.strftime('D:%Y%m%d%H%M%SZ')
    objects[info - 1] = (
        b'<< /Title '
        + _text_string(f'{model["name"]} — Curriculum Vitae')
        + b' /Author '
        + _text_string(model['name'])
        + b' /Subject '
        + _text_string(model['headline'])
        + b' /Keywords '
        + _text_string(keywords)
        + b' /Creator '
        + _text_string(next((k['label'] for k in model['links'] if k['url'].startswith('http')), 'CloudResume'))
        + f' /Producer (CloudResume renderResume v{RENDERER_VERSION}) /CreationDate ({stamp}) >>'.encode('ascii')
    )

    out = bytearray(b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')
    offsets = []
    for number, body in enumerate(objects, start=1):
        offsets.append(len(out))
        out += f'{number} 0 obj\n'.encode('ascii') + body + b'\nendobj\n'
    xref = len(out)
    out += f'xref\n0 {len(objects) + 1}\n0000000000 65535 f \n'.encode('ascii')
    for offset in offsets:
        out += f'{offset:010d} 00000 n \n'.encode('ascii')
    out += (
        f'trailer\n<< /Size {len(objects) + 1} /Root {catalog} 0 R /Info {info} 0 R >>\nstartxref\n{xref}\n%%EOF\n'
    ).encode('ascii')
    return bytes(out)
