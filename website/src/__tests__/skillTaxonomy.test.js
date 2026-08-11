import { byTaxonomyOrder, CATEGORIES, categoryColor, groupSkills, pct } from '../utils/skillTaxonomy';

const skill = (name, category, level) => ({ name, category, level });

describe('groupSkills', () => {
    test('groups by category, biggest first, and scores each group', () => {
        const groups = groupSkills([
            skill('A', 'Security', '90%'),
            skill('B', 'Security', '50%'),
            skill('C', 'Cloud', '70%'),
        ]);

        expect(groups.map((g) => g.name)).toEqual(['Security', 'Cloud']);
        expect(groups[0]).toMatchObject({ count: 2, peak: 90, avg: 70 });
        expect(groups[1]).toMatchObject({ count: 1, peak: 70, avg: 70 });
    });

    test('keeps a category the taxonomy has never heard of', () => {
        const groups = groupSkills([skill('A', 'Robotics', '40%')]);
        expect(groups.map((g) => g.name)).toEqual(['Robotics']);
    });

    test('files a tool carrying no category at all under Other', () => {
        const groups = groupSkills([{ name: 'A', level: '40%' }]);
        expect(groups[0].name).toBe('Other');
    });
});

describe('byTaxonomyOrder', () => {
    test('restores the canonical order from any starting order', () => {
        const shuffled = [...CATEGORIES].reverse().map((name) => ({ name }));
        expect([...shuffled].sort(byTaxonomyOrder).map((g) => g.name)).toEqual(CATEGORIES);
    });

    test('pushes categories off the list to the end, alphabetically', () => {
        const sorted = [{ name: 'Robotics' }, { name: 'Cloud' }, { name: 'Other' }].sort(byTaxonomyOrder);
        expect(sorted.map((g) => g.name)).toEqual(['Cloud', 'Other', 'Robotics']);
    });
});

describe('categoryColor', () => {
    test('gives each canonical category its own colour', () => {
        const colours = CATEGORIES.map(categoryColor);
        expect(new Set(colours).size).toBe(CATEGORIES.length);
        colours.forEach((c) => expect(c).toMatch(/^var\(--color-line-[a-z]+\)$/));
    });

    test('never paints a category in the alert red', () => {
        // --color-line-red is --color-alert as well; a category wearing it reads
        // as a fault rather than a category.
        expect(CATEGORIES.map(categoryColor)).not.toContain('var(--color-line-red)');
    });

    test('is keyed by name, so it survives the data reordering underneath it', () => {
        expect(categoryColor('Security')).toBe(categoryColor('Security'));
        expect(categoryColor('Cloud')).not.toBe(categoryColor('Security'));
    });

    test('still answers for a category off the taxonomy, and answers the same way twice', () => {
        const first = categoryColor('Robotics');
        expect(first).toMatch(/^var\(--color-line-[a-z]+\)$/);
        expect(categoryColor('Robotics')).toBe(first);
        // Independent of how many other strays exist — a counter would drift.
        categoryColor('Bioinformatics');
        expect(categoryColor('Robotics')).toBe(first);
    });
});

describe('ring normalisation', () => {
    // The rings sit in taxonomy order, so the group at the front is Cloud
    // rather than the biggest — scaling against it would send every larger
    // category past a full circle. SkillsCharts.test.js guards the wiring and
    // the log scale itself; this pins the ordering the wiring depends on.
    test('taxonomy order does not put the widest group at the front', () => {
        const groups = groupSkills([
            skill('A', 'Security', '90%'),
            skill('B', 'Security', '80%'),
            skill('C', 'Security', '70%'),
            skill('D', 'Cloud', '60%'),
        ]);

        const ordered = [...groups].sort(byTaxonomyOrder);
        const widest = Math.max(...groups.map((g) => g.count));

        expect(ordered[0].name).toBe('Cloud');
        expect(ordered[0].count).toBeLessThan(widest);
        // Grouping is left count-sorted, which is what makes the two views differ.
        expect(groups[0].count).toBe(widest);
    });
});

describe('pct', () => {
    test('reads a percentage string, and treats anything unparseable as zero', () => {
        expect(pct('75%')).toBe(75);
        expect(pct('0%')).toBe(0);
        expect(pct(undefined)).toBe(0);
        expect(pct('')).toBe(0);
    });
});
