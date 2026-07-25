import { render, screen } from '@testing-library/react';
import GithubHeatmap from '../components/github_heatmap';

const days = [];
// three tidy weeks starting on a Sunday, ascending
for (let i = 0; i < 21; i++) {
    const d = new Date(Date.UTC(2026, 0, 4 + i)); // 2026-01-04 is a Sunday
    const count = i % 4; // 0..3 cycling
    days.push({ date: d.toISOString().slice(0, 10), count, level: count === 0 ? 0 : count <= 2 ? 1 : 2 });
}

vi.mock('../utils/useJsonData', () => ({
    useJsonData: vi.fn(() => ({
        data: { total: 1234, accounts: ['RetroHazard', 'BitMEX-abracken'], updated: null, days },
        loading: false,
        error: null,
    })),
    LoadingSkeleton: () => null,
}));

describe('GithubHeatmap', () => {
    test('renders the combined total and both account labels', () => {
        render(<GithubHeatmap />);
        expect(screen.getByText('1,234')).toBeInTheDocument();
        expect(screen.getByText('@RetroHazard')).toBeInTheDocument();
        expect(screen.getByText('@BitMEX-abracken')).toBeInTheDocument();
    });

    test('renders a calendar cell for every contribution day', () => {
        const { container } = render(<GithubHeatmap />);
        const cells = container.querySelectorAll('.gh-grid .gh-cell');
        // 21 days, no leading pad (starts on a Sunday), padded to whole weeks
        expect(cells.length).toBe(21);
        // a day with contributions carries a descriptive tooltip
        const tipped = container.querySelector('.gh-grid .gh-cell[title*="contribution"]');
        expect(tipped).toBeTruthy();
    });
});
