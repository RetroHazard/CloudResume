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
 *   Security     identity, endpoint posture, network, vulnerability, offensive
 *   Development  languages and the web stack
 *   Workplace    the endpoints and the tools the company works in
 *   Creative     the pre-engineering craft — real-time, 3D, VFX, design
 *
 * Grouping still reads whatever category a tool actually carries, so a new one
 * shows up as its own group instead of vanishing — the list above is the
 * intent, not a filter.
 */
export const CATEGORIES = ['Cloud', 'Platform', 'Security', 'Development', 'Workplace', 'Creative'];

/** Where a tool with no category at all ends up. */
export const UNCATEGORISED = 'Other';

/** Sequential ramp steps available for group colours. See --chart-ramp-* in index.css. */
const RAMP_STEPS = 6;

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

/** Ramp step for a group at `index` in the grouped order (brightest = biggest). */
export const rampColor = (index: number) => `var(--chart-ramp-${Math.min(index + 1, RAMP_STEPS)})`;
