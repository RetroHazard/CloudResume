/**
 * One taxonomy for the Rolling Stock list, shared by the toolbox drawers and
 * the two charts above them.
 *
 * Every tool in skill_data.json carries exactly one `category`, drawn from this
 * list. The data had twenty of them once, half a single tool deep ("AI Gateway",
 * "Endpoint (MDM)", "Game Development"), which made grouping arbitrary and
 * scoring meaningless:
 *
 *   Cloud        the public clouds themselves
 *   Platform     what runs on them — IaC, CI/CD, containers, observability, repos
 *   AI           the gateway, the model platforms, and the coding agents
 *   Security     identity, endpoint posture, network, vulnerability, offensive
 *   Development  languages and the web stack
 *   Workplace    the endpoints and the tools the company works in
 *   Creative     the pre-engineering craft — real-time, 3D, VFX, design
 *
 * AI is the one category that came back. It was cut in the collapse above as
 * "AI Gateway", a single tool deep and therefore arbitrary; it now carries four
 * and names a distinct pillar of the work, which is the bar the rest of this
 * list is held to.
 *
 * Grouping still reads whatever category a tool actually carries, so a new one
 * shows up as its own group instead of vanishing — the list above is the
 * intent, not a filter.
 */
export const CATEGORIES = ['Cloud', 'Platform', 'AI', 'Security', 'Development', 'Workplace', 'Creative'];

/** Where a tool with no category at all ends up. */
export const UNCATEGORISED = 'Other';

/**
 * One colour per category, held for the life of the category rather than
 * assigned by position — so a category keeps its colour as the data shifts
 * under it, and the ring, its legend row and its Rolling Stock drawer below
 * all agree without being in the same order.
 *
 * Drawn from the line palette in index.css, because on this site a coloured
 * roundel already means "which line is this". Red is the one line colour left
 * out: it is --color-alert too, and a category painted in it reads as a fault
 * rather than a category.
 *
 * The pairing is chosen so that categories landing on adjacent rings are far
 * apart in hue — the rings sit in the order below, and no two neighbours are
 * closer than 110°, which is what keeps them separable at a glance.
 */
const CATEGORY_COLOURS: Record<string, string> = {
    Cloud: 'var(--color-line-blue)',
    Platform: 'var(--color-line-lime)',
    AI: 'var(--color-line-violet)',
    Security: 'var(--color-line-green)',
    Development: 'var(--color-line-amber)',
    Workplace: 'var(--color-line-cyan)',
    Creative: 'var(--color-line-rose)',
};

/** The palette an off-taxonomy category falls back into. */
const FALLBACK_COLOURS = Object.values(CATEGORY_COLOURS);

export type SkillLike = { name: string; category?: string; level?: string };

export type SkillGroup<T extends SkillLike = SkillLike> = {
    /** Category name, as carried by the tools in it */
    name: string;
    /** Its tools, strongest first */
    skills: T[];
    count: number;
    /** Best tool in the group */
    peak: number;
    /** Mean across the group — how deep it runs, rather than how high it reaches */
    avg: number;
};

export const pct = (level?: string) => parseInt(String(level).replace('%', ''), 10) || 0;

/**
 * Group tools by category, biggest group first. Ties break on the deeper group,
 * so the order is stable for a given data set and matches the ring chart.
 */
export function groupSkills<T extends SkillLike>(skills: T[]): SkillGroup<T>[] {
    const byCategory = new Map<string, T[]>();
    for (const skill of skills) {
        const key = skill.category || UNCATEGORISED;
        const bucket = byCategory.get(key);
        if (bucket) bucket.push(skill);
        else byCategory.set(key, [skill]);
    }

    return [...byCategory.entries()]
        .map(([name, group]) => {
            const levels = group.map((s) => pct(s.level));
            return {
                name,
                skills: [...group].sort((a, b) => pct(b.level) - pct(a.level)),
                count: group.length,
                peak: levels.reduce((max, v) => Math.max(max, v), 0),
                avg: Math.round(levels.reduce((a, b) => a + b, 0) / levels.length),
            };
        })
        .sort((a, b) => b.count - a.count || b.avg - a.avg || a.name.localeCompare(b.name));
}

/**
 * Taxonomy order — for the radar, whose axes should mean the same thing from one
 * visit to the next rather than shuffling when a tool is added. Categories off
 * the canonical list sort to the end, alphabetically.
 */
export function byTaxonomyOrder(a: { name: string }, b: { name: string }): number {
    const rank = (name: string) => {
        const i = CATEGORIES.indexOf(name);
        return i === -1 ? CATEGORIES.length : i;
    };
    return rank(a.name) - rank(b.name) || a.name.localeCompare(b.name);
}

/**
 * The colour a category is drawn in, anywhere it appears.
 *
 * Grouping deliberately keeps whatever category a tool carries, so a name off
 * the canonical list still has to come out somewhere rather than undefined. It
 * falls back to a hash of its own name — stable across reloads and independent
 * of how many other strays there are, which a running counter would not be. A
 * stray can collide with a canonical category's colour; that is accepted, since
 * the alternative is an eighth hue crowding a palette already spaced as wide as
 * seven will go.
 */
export function categoryColor(name: string): string {
    const known = CATEGORY_COLOURS[name];
    if (known) return known;

    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
    return FALLBACK_COLOURS[Math.abs(hash) % FALLBACK_COLOURS.length];
}
