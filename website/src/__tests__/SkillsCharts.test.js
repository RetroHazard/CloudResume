import { render } from '@testing-library/react';
import SkillsCharts from '../components/skills_charts';
import { CATEGORIES, categoryColor } from '../utils/skillTaxonomy';

// The charts themselves are visx/motion and need a laid-out box to say anything
// useful, so they are stubbed down to prop capture. What is under test here is
// what skills_charts hands them: the order of the rings, what each is measured
// against, and the colour each carries.
const captured = { rings: null, metrics: null };

vi.mock('../utils/useJsonData', () => ({
    useJsonData: vi.fn(() => ({ data: { core_skills: mockSkills }, loading: false, error: null })),
    LoadingSkeleton: () => null,
}));
vi.mock('../components/github_heatmap', () => ({ default: () => null }));
vi.mock('../components/charts/ring-chart', () => ({
    RingChart: ({ data, children }) => {
        captured.rings = data;
        return <div>{children}</div>;
    },
}));
vi.mock('../components/charts/ring', () => ({ Ring: () => null }));
vi.mock('../components/charts/ring-center', () => ({ RingCenter: () => null }));
vi.mock('../components/charts/radar-chart', () => ({
    RadarChart: ({ metrics, children }) => {
        captured.metrics = metrics;
        return <div>{children}</div>;
    },
}));
vi.mock('../components/charts/radar-grid', () => ({ RadarGrid: () => null }));
vi.mock('../components/charts/radar-axis', () => ({ RadarAxis: () => null }));
vi.mock('../components/charts/radar-area', () => ({ RadarArea: () => null }));
vi.mock('../components/charts/radar-labels', () => ({ RadarLabels: () => null }));

// Security is deliberately the widest and Cloud the narrowest, because taxonomy
// order puts Cloud first — the arrangement that used to break normalisation.
let mockSkills = [];
const skill = (name, category, level) => ({ name, category, level });

beforeEach(() => {
    captured.rings = null;
    captured.metrics = null;
    mockSkills = [
        skill('s1', 'Security', '90%'),
        skill('s2', 'Security', '70%'),
        skill('s3', 'Security', '50%'),
        skill('d1', 'Development', '60%'),
        skill('d2', 'Development', '40%'),
        skill('c1', 'Cloud', '80%'),
    ];
});

describe('SkillsCharts', () => {
    test('orders the rings by taxonomy, not by size', () => {
        render(<SkillsCharts />);
        expect(captured.rings.map((r) => r.label)).toEqual(['Cloud', 'Security', 'Development']);
    });

    test('keeps value as the true tool count, for the centre readout and total', () => {
        render(<SkillsCharts />);
        expect(captured.rings.find((r) => r.label === 'Security').value).toBe(3);
        expect(captured.rings.find((r) => r.label === 'Cloud').value).toBe(1);
    });

    test('never lets a ring close the loop, widest included', () => {
        render(<SkillsCharts />);
        // Cloud leads the rings with 1 tool while Security has 3. Scaling every
        // ring against whatever sits at the head of a taxonomy-ordered array
        // put Security at 300% of a circle; a full turn also reads as a solid
        // circle rather than an arc, so the widest stops short of one.
        const sweeps = captured.rings.map((r) => r.value / r.maxValue);
        sweeps.forEach((s) => expect(s).toBeLessThanOrEqual(0.85 + 1e-9));
        expect(Math.max(...sweeps)).toBeCloseTo(0.85, 5);
    });

    test('scales the arcs logarithmically, so the narrowest stays legible', () => {
        render(<SkillsCharts />);
        const sweep = (label) => {
            const r = captured.rings.find((x) => x.label === label);
            return r.value / r.maxValue;
        };
        // Security holds 3x Cloud's tools; drawn linearly Cloud would sit at a
        // third of Security's arc, which is a stub. Log pulls it up.
        expect(sweep('Cloud') / sweep('Security')).toBeGreaterThan(0.4);
        // ...without inverting the order: more tools still means more arc.
        expect(sweep('Security')).toBeGreaterThan(sweep('Development'));
        expect(sweep('Development')).toBeGreaterThan(sweep('Cloud'));
    });

    test('draws an arc for a category holding a single tool', () => {
        mockSkills = [skill('s1', 'Security', '90%'), skill('c1', 'Cloud', '80%')];
        render(<SkillsCharts />);
        // log(1) is 0 — without the offset this category would draw nothing.
        const cloud = captured.rings.find((r) => r.label === 'Cloud');
        expect(cloud.value / cloud.maxValue).toBeGreaterThan(0.05);
    });

    test('colours each ring by its category, so the colour survives a reorder', () => {
        render(<SkillsCharts />);
        captured.rings.forEach((r) => expect(r.color).toBe(categoryColor(r.label)));
        expect(new Set(captured.rings.map((r) => r.color)).size).toBe(captured.rings.length);
    });

    test('puts the radar on the same axes order as the rings', () => {
        render(<SkillsCharts />);
        expect(captured.metrics.map((m) => m.key)).toEqual(captured.rings.map((r) => r.label));
    });

    test('keeps the taxonomy order stable when a category grows', () => {
        render(<SkillsCharts />);
        const before = captured.rings.map((r) => r.label);

        mockSkills = [...mockSkills, skill('c2', 'Cloud', '30%'), skill('c3', 'Cloud', '20%')];
        render(<SkillsCharts />);
        expect(captured.rings.map((r) => r.label)).toEqual(before);
    });

    test('carries a category the taxonomy does not name, at the end', () => {
        mockSkills = [...mockSkills, skill('r1', 'Robotics', '30%')];
        render(<SkillsCharts />);

        const labels = captured.rings.map((r) => r.label);
        expect(labels[labels.length - 1]).toBe('Robotics');
        labels.slice(0, -1).forEach((l) => expect(CATEGORIES).toContain(l));
    });

    test('renders nothing when there are no tools to chart', () => {
        mockSkills = [];
        const { container } = render(<SkillsCharts />);
        expect(container).toBeEmptyDOMElement();
    });
});
