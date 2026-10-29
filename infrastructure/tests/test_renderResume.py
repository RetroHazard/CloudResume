"""Tests for the CV renderer. Stdlib only, like the module under test.

Run from the repository root:  python -m unittest discover -s infrastructure/tests
"""

import copy
import json
import re
import sys
import unittest
import zlib
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'infrastructure' / 'codebase'))

import renderResume  # noqa: E402

DATA = ROOT / 'website' / 'src' / 'assets' / 'json'

# Mirrors CV_SOURCE_FILES in website/scripts/cv-source.mjs — the contract between the build
# that publishes data/cv-source.json and build_model, which reads it.
SOURCE_FILES = {
    'personal': 'personal_data.json',
    'career': 'career_data.json',
    'certifications': 'certification_data.json',
    'education': 'education_data.json',
    'projects': 'project_data.json',
    'skills': 'skill_data.json',
    'socials': 'socials_data.json',
    'cv': 'cv_data.json',
}

SITE = 'https://example.com'
TODAY = date(2026, 10, 28)


def load_source(data_set='production'):
    return {key: json.loads((DATA / data_set / name).read_text('utf-8')) for key, name in SOURCE_FILES.items()}


def page_streams(pdf):
    """Decompressed content streams, in object order."""
    streams = []
    for match in re.finditer(rb'/Length (\d+) /Filter /FlateDecode >>\nstream\n', pdf):
        start = match.end()
        streams.append(zlib.decompress(pdf[start : start + int(match.group(1))]))
    return streams


def shown_text(pdf):
    """The text each BT...ET block shows, decoded from WinAnsi, one block per line."""
    lines = []
    for stream in page_streams(pdf):
        for block in re.findall(rb'BT (.*?) ET', stream):
            shown = re.findall(rb'\(((?:\\.|[^\\)])*)\) Tj', block)
            lines.append(b''.join(re.sub(rb'\\(.)', rb'\1', raw) for raw in shown).decode('cp1252'))
    return '\n'.join(lines)


class FormatDateTests(unittest.TestCase):
    def test_sentinels_and_padding(self):
        self.assertEqual(renderResume.format_date('---'), 'Present')
        self.assertEqual(renderResume.format_date('NOW'), 'Present')
        self.assertEqual(renderResume.format_date('N/A'), '')
        self.assertEqual(renderResume.format_date('2024-8-16'), 'Aug 2024')
        self.assertEqual(renderResume.format_date('2025-09'), 'Sep 2025')
        self.assertEqual(renderResume.format_date('2016'), '2016')

    def test_range(self):
        self.assertEqual(renderResume.format_range('2025-09', '---'), 'Sep 2025 – Present')
        self.assertEqual(renderResume.format_range('2022', '2022'), '2022')


class MarkupTests(unittest.TestCase):
    # Same cases as website/src/__tests__/PersonalSummary.test.js: the site and the CV must
    # agree on what is emphasised.
    def test_bold_and_italic(self):
        self.assertEqual(
            renderResume.parse_markup('Expert in **AWS, Terraform**, and *AI governance*.'),
            [('R', 'Expert in '), ('B', 'AWS, Terraform'), ('R', ', and '), ('I', 'AI governance'), ('R', '.')],
        )

    def test_lone_asterisk_is_plain(self):
        self.assertEqual(renderResume.parse_markup('5 * 3 = 15'), [('R', '5 * 3 = 15')])


class ModelTests(unittest.TestCase):
    def setUp(self):
        self.source = load_source()
        self.model = renderResume.build_model(self.source, SITE, today=TODAY)

    def test_every_section_is_populated_from_production_data(self):
        for section in ('summary', 'competencies', 'technical', 'experience', 'projects', 'certifications'):
            with self.subTest(section=section):
                self.assertTrue(self.model[section], section)
        self.assertEqual(self.model['name'], self.source['personal']['fullName'])
        self.assertEqual(len(self.model['experience']), len(self.source['career']['Experience']))

    def test_development_data_also_builds(self):
        model = renderResume.build_model(load_source('development'), SITE, today=TODAY)
        self.assertTrue(model['name'])

    def test_header_links_are_the_site_and_displayed_socials_only(self):
        urls = [link['url'] for link in self.model['links']]
        self.assertEqual(urls[0], SITE)
        shown = [s['link'] for s in self.source['socials']['Socials'] if s.get('display')]
        self.assertEqual(urls[1:], shown)

    def test_weak_skills_are_left_on_the_site(self):
        listed = {name for group in self.model['technical'] for name in group['items']}
        for skill in self.source['skills']['core_skills']:
            level = int(skill['level'].rstrip('%'))
            with self.subTest(skill=skill['name']):
                self.assertEqual(
                    skill['name'] in listed, level >= renderResume.settings_from(self.source)['skillMinLevel']
                )

    def test_older_roles_are_condensed(self):
        source = {
            'personal': {'fullName': 'A B'},
            'career': {
                'Experience': [
                    {'company': 'New', 'start': '2024-01', 'end': '---', 'details': list('abcd'), 'technologies': []},
                    {
                        'company': 'Old',
                        'start': '2010-01',
                        'end': '2012-01',
                        'details': list('abcd'),
                        'technologies': [{'name': 'Perl'}],
                    },
                ]
            },
        }
        model = renderResume.build_model(source, SITE, today=TODAY)
        new, old = (job['roles'][0] for job in model['experience'])
        self.assertEqual(new['details'], list('abcd'))
        self.assertEqual(old['details'], list('ab'))
        self.assertEqual(old['technologies'], [])

    def test_lapsed_certifications_sort_after_current_ones(self):
        active = [c['active'] for c in self.model['certifications']]
        self.assertEqual(active, sorted(active, reverse=True))
        lapsed = [c for c in self.model['certifications'] if not c['active']]
        self.assertTrue(any('Systems Security Certified Practitioner' == c['name'] for c in lapsed))

    def test_an_education_minor_is_printed_like_the_site_shows_it(self):
        source = {
            'education': {
                'Education': [{'school': 'U', 'degree': 'BA', 'minor': 'East Asia Studies', 'location': 'Calgary'}]
            }
        }
        model = renderResume.build_model(source, SITE, today=TODAY)
        self.assertEqual(model['education'][0]['minor'], 'East Asia Studies')
        self.assertIn('Minor in East Asia Studies · Calgary', shown_text(renderResume.render_pdf(model)))

    def test_file_name_is_surname_first(self):
        self.assertEqual(renderResume.file_name({'name': 'Alexander Bracken'}), 'BRACKEN_ALEXANDER_Resume.pdf')
        self.assertEqual(renderResume.file_name({'name': 'Zoë  de la Cruz'}), 'CRUZ_ZOE_DE_LA_Resume.pdf')
        self.assertEqual(renderResume.file_name({'name': ''}), 'Resume.pdf')


def minimal_source(**extra):
    """A small, fully controlled source: two jobs, three projects, a handful of skills."""
    source = {
        'personal': {'fullName': 'Alexander Bracken', 'jobTitle': 'Engineer', 'location': 'Tokyo'},
        'career': {
            'Experience': [
                {'company': 'Now', 'job_title': 'Lead', 'start': '2024-01', 'end': '---', 'details': list('abcde')},
                {
                    'company': 'Then',
                    'job_title': 'Analyst',
                    'start': '2008-01',
                    'end': '2010-01',
                    'details': list('vwxyz'),
                },
            ]
        },
        'projects': {
            'Projects': [
                {
                    'name': f'P{n}',
                    'start': '2024',
                    'end': 'NOW',
                    'details': list('pqr'),
                    'technologies': [{'name': 'Go'}],
                }
                for n in range(3)
            ]
        },
        'skills': {
            'core_skills': [
                {'name': 'Strong', 'category': 'Cloud', 'level': '90%'},
                {'name': 'Weak', 'category': 'Cloud', 'level': '20%'},
            ]
        },
    }
    source.update(extra)
    return source


class SettingsTests(unittest.TestCase):
    def test_defaults_apply_without_a_settings_file(self):
        self.assertEqual(renderResume.settings_from({}), renderResume.DEFAULT_SETTINGS)

    def test_published_settings_files_are_well_formed(self):
        # Every key in cv_data.json must survive validation unchanged; a typo would otherwise
        # fall back to the default silently.
        for data_set in ('production', 'development'):
            raw = json.loads((DATA / data_set / 'cv_data.json').read_text('utf-8'))
            with self.subTest(data_set=data_set):
                self.assertEqual(set(raw) - set(renderResume.DEFAULT_SETTINGS), set())
                settings = renderResume.settings_from({'cv': raw})
                self.assertEqual({k: settings[k] for k in raw}, raw)

    def test_malformed_values_fall_back_rather_than_fail(self):
        settings = renderResume.settings_from(
            {'cv': {'maxPages': 'two', 'skillMinLevel': 900, 'contactEmail': 'yes', 'sections': ['skills', 'bogus']}}
        )
        self.assertEqual(settings['maxPages'], renderResume.DEFAULT_SETTINGS['maxPages'])
        self.assertEqual(settings['skillMinLevel'], 100)
        self.assertIs(settings['contactEmail'], True)
        self.assertEqual(settings['sections'], ['skills'])

    def test_rules_come_from_the_data(self):
        cv = {'skillMinLevel': 10, 'recentYears': 30, 'projectBullets': 3}
        model = renderResume.build_model(minimal_source(cv=cv), SITE, today=TODAY)
        self.assertEqual(model['technical'][0]['items'], ['Strong', 'Weak'])
        self.assertEqual(len(model['experience'][1]['roles'][0]['details']), 5)
        self.assertEqual(len(model['projects'][0]['details']), 3)

    def test_section_order_and_omission(self):
        cv = {'sections': ['experience', 'summary'], 'maxPages': 0}
        source = minimal_source(cv=cv)
        source['personal']['summary'] = ['Hello there.']
        text = shown_text(renderResume.render_pdf(renderResume.build_model(source, SITE, today=TODAY)))
        self.assertLess(text.index('EXPERIENCE'), text.index('SUMMARY'))
        self.assertNotIn('SKILLS', text)
        self.assertNotIn('PROJECTS', text)

    def test_a_settings_change_is_a_new_cv(self):
        before = renderResume.content_digest(renderResume.build_model(minimal_source(), SITE, today=TODAY))
        after = renderResume.content_digest(
            renderResume.build_model(minimal_source(cv={'maxPages': 3}), SITE, today=TODAY)
        )
        self.assertNotEqual(before, after)


class ItemFlagTests(unittest.TestCase):
    def test_cv_false_keeps_an_entry_off_the_cv(self):
        source = minimal_source()
        source['projects']['Projects'][1]['cv'] = False
        source['career']['Experience'][1]['cv'] = False
        source['skills']['core_skills'][0]['cv'] = False
        model = renderResume.build_model(source, SITE, today=TODAY)
        self.assertEqual([p['name'] for p in model['projects']], ['P0', 'P2'])
        self.assertEqual([j['company'] for j in model['experience']], ['Now'])
        self.assertEqual(model['technical'], [])

    def test_always_overrides_the_rules(self):
        source = minimal_source()
        source['skills']['core_skills'][1]['cv'] = 'always'
        source['career']['Experience'][1]['cv'] = 'always'
        model = renderResume.build_model(source, SITE, today=TODAY)
        self.assertIn('Weak', model['technical'][0]['items'])
        self.assertEqual(len(model['experience'][1]['roles'][0]['details']), 5)

    def test_cv_bullets_sets_the_count(self):
        source = minimal_source()
        source['career']['Experience'][0]['cvBullets'] = 1
        source['projects']['Projects'][0]['cvBullets'] = 3
        model = renderResume.build_model(source, SITE, today=TODAY)
        self.assertEqual(model['experience'][0]['roles'][0]['details'], ['a'])
        self.assertEqual(model['projects'][0]['details'], list('pqr'))


class PageBudgetTests(unittest.TestCase):
    def long_source(self, **cv):
        source = minimal_source(cv=dict(cv))
        bullet = 'Delivered a measurable outcome across a large and demanding engineering organisation. ' * 3
        for job in source['career']['Experience']:
            job['details'] = [bullet] * 6
            job['technologies'] = [{'name': 'Terraform'}]
        for project in source['projects']['Projects']:
            project['details'] = [bullet] * 3
        source['career']['Experience'] *= 4
        return source

    def pages(self, model):
        return len(renderResume.fit(model)[1])

    def test_an_over_budget_cv_is_trimmed_to_fit(self):
        model = renderResume.build_model(self.long_source(maxPages=0), SITE, today=TODAY)
        self.assertGreater(self.pages(model), 1)
        model['maxPages'] = 1
        fitted, pages = renderResume.fit(model)
        self.assertEqual(len(pages), 1)
        # Never drops a role, however tight the budget.
        self.assertEqual(sum(len(j['roles']) for j in fitted['experience']), 8)

    def test_trims_the_least_important_content_first(self):
        model = renderResume.build_model(self.long_source(maxPages=0), SITE, today=TODAY)
        model['maxPages'] = self.pages(model) - 1 or 1
        fitted, _ = renderResume.fit(model)
        # Project technologies go before anything in Experience is touched.
        self.assertTrue(all(not p['technologies'] for p in fitted['projects']))
        self.assertEqual(len(fitted['experience'][0]['roles'][0]['details']), 6)

    def test_trims_no_more_than_needed(self):
        model = renderResume.build_model(self.long_source(maxPages=0), SITE, today=TODAY)
        model['maxPages'] = self.pages(model)
        self.assertEqual(renderResume.fit(model)[0], model)

    def test_pinned_entries_are_never_trimmed(self):
        source = self.long_source(maxPages=1)
        source['career']['Experience'][1]['cv'] = 'always'
        source['projects']['Projects'][2]['cv'] = 'always'
        model = renderResume.build_model(source, SITE, today=TODAY)
        fitted, _ = renderResume.fit(model)
        self.assertEqual(fitted['experience'][1]['roles'][0]['details'], model['experience'][1]['roles'][0]['details'])
        self.assertIn('P2', [p['name'] for p in fitted['projects']])

    def test_fitting_does_not_mutate_the_cache_key(self):
        model = renderResume.build_model(self.long_source(maxPages=1), SITE, today=TODAY)
        before = renderResume.content_digest(model)
        renderResume.render_pdf(model)
        self.assertEqual(renderResume.content_digest(model), before)


class ContactLineTests(unittest.TestCase):
    def test_contact_address_leads_the_header_and_is_a_mailto_link(self):
        model = renderResume.build_model(
            minimal_source(), SITE, today=TODAY, contact_email='alexander.k7q2mx@example.com'
        )
        self.assertEqual(
            model['links'][0], {'label': 'alexander.k7q2mx@example.com', 'url': 'mailto:alexander.k7q2mx@example.com'}
        )
        pdf = renderResume.render_pdf(model)
        self.assertIn(b'/URI (mailto:alexander.k7q2mx@example.com)', pdf)
        # The site, not the address, is what the document metadata names as its origin.
        self.assertIn(renderResume._text_string('example.com'), pdf)

    def test_settings_can_suppress_the_address(self):
        model = renderResume.build_model(
            minimal_source(cv={'contactEmail': False}), SITE, today=TODAY, contact_email='a.b@example.com'
        )
        self.assertNotIn('a.b@example.com', json.dumps(model))

    def test_the_header_wraps_instead_of_overflowing(self):
        model = renderResume.build_model(
            minimal_source(), SITE, today=TODAY, contact_email='a-very-long-forwarding-address.k7q2mx@example.com'
        )
        model['links'] += [{'label': 'linkedin.com/in/a-rather-long-profile-name', 'url': 'https://x'}] * 2
        renderResume.render_pdf(model)
        page = renderResume.fit(model)[1][0]
        for x1, _, x2, _, _ in page.links:
            self.assertLessEqual(x2, renderResume.PAGE_W - renderResume.MARGIN_X + 0.01)


class DigestTests(unittest.TestCase):
    """The digest is the cache key. It must move with the CV's content and nothing else."""

    def digest(self, source):
        return renderResume.content_digest(renderResume.build_model(source, SITE, today=TODAY))

    def test_cosmetic_site_changes_reuse_the_cached_cv(self):
        source = load_source()
        changed = copy.deepcopy(source)
        changed['career']['Experience'][0]['logo'] = './images/new-logo.png'
        changed['personal']['profilePicture'] = '/images/new.jpg'
        changed['skills']['core_skills'][0]['logo'] = 'simple-icons:other'
        self.assertEqual(self.digest(source), self.digest(changed))

    def test_content_changes_produce_a_new_cv(self):
        source = load_source()
        changed = copy.deepcopy(source)
        changed['career']['Experience'][0]['details'][0] += ' Now with more impact.'
        self.assertNotEqual(self.digest(source), self.digest(changed))

    def test_renderer_version_is_part_of_the_key(self):
        model = renderResume.build_model(load_source(), SITE, today=TODAY)
        before = renderResume.content_digest(model)
        original = renderResume.RENDERER_VERSION
        try:
            renderResume.RENDERER_VERSION = original + '-next'
            self.assertNotEqual(before, renderResume.content_digest(model))
        finally:
            renderResume.RENDERER_VERSION = original


class WrapTests(unittest.TestCase):
    def test_no_line_exceeds_the_measure(self):
        text = ' '.join(['Kubernetes', 'least-privilege', 'Terraform-managed'] * 40)
        for line in renderResume.wrap([('R', text)], 9.5, 200):
            width = sum(renderResume._width(b, s, 9.5) for s, b in line)
            self.assertLessEqual(width, 200.0001)

    def test_styled_runs_without_a_space_never_split(self):
        lines = renderResume.wrap(renderResume.parse_markup('word ' * 30 + '**AWS**, end'), 9.5, 120)
        joined = [b''.join(b for _, b in line) for line in lines]
        self.assertTrue(any(b'AWS,' in line for line in joined))


class PdfTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model = renderResume.build_model(load_source(), SITE, today=TODAY)
        cls.pdf = renderResume.render_pdf(cls.model)

    def test_structure_and_cross_reference_table(self):
        pdf = self.pdf
        self.assertTrue(pdf.startswith(b'%PDF-1.4\n'))
        self.assertTrue(pdf.endswith(b'%%EOF\n'))
        xref = int(re.search(rb'startxref\n(\d+)\n%%EOF', pdf).group(1))
        self.assertTrue(pdf[xref:].startswith(b'xref\n'))
        offsets = [int(o) for o in re.findall(rb'(\d{10}) 00000 n ', pdf[xref:])]
        for number, offset in enumerate(offsets, start=1):
            self.assertTrue(pdf[offset:].startswith(f'{number} 0 obj\n'.encode()), number)

    def test_text_is_real_and_in_reading_order(self):
        text = shown_text(self.pdf)
        name = text.find(self.model['name'])
        experience = text.find('EXPERIENCE')
        first_company = text.find(self.model['experience'][0]['company'])
        education = text.find('EDUCATION')
        self.assertTrue(0 <= name < experience < first_company < education)
        self.assertIn(self.model['experience'][0]['roles'][0]['details'][0][:40], text)

    def test_page_count_matches_footers(self):
        count = int(re.search(rb'/Type /Pages /Kids \[[^\]]*\] /Count (\d+)', self.pdf).group(1))
        self.assertEqual(len(page_streams(self.pdf)), count)
        self.assertIn(f'Page {count} of {count}', shown_text(self.pdf))

    def test_links_are_annotated(self):
        for link in self.model['links']:
            self.assertIn(f'/URI ({link["url"]})'.encode(), self.pdf)

    def test_stays_small(self):
        # Standard fonts and compressed streams: no reason for a text CV to exceed this.
        self.assertLess(len(self.pdf), 60_000)

    def test_characters_outside_winansi_are_folded_not_fatal(self):
        model = copy.deepcopy(self.model)
        model['summary'] = ['Moved 東京 → global, ≥ 99% uptime (✓) — café (escaped) \\ path']
        pdf = renderResume.render_pdf(model)
        text = shown_text(pdf)
        self.assertIn('-> global, >= 99% uptime', text)
        self.assertIn('café (escaped) \\ path', text)


if __name__ == '__main__':
    unittest.main()
