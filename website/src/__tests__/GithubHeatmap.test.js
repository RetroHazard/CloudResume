import { render, screen, waitFor } from '@testing-library/react';
import GithubHeatmap from '../components/github_heatmap';

const days = [];
// three tidy weeks starting on a Sunday, ascending
for (let i = 0; i < 21; i++) {
    const d = new Date(Date.UTC(2026, 0, 4 + i)); // 2026-01-04 is a Sunday
    const count = i % 4; // 0..3 cycling
    days.push({ date: d.toISOString().slice(0, 10), count, level: count === 0 ? 0 : count <= 2 ? 1 : 2 });
}

// The heatmap fetches /data/contributions.json at runtime (kept live in S3 by
// the scheduled updateContributions Lambda), so the tests stub global fetch.
beforeEach(() => {
    vi.stubGlobal(
        'fetch',
        vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({ total: 1234, accounts: ['RetroHazard', 'BitMEX-abracken'], updated: null, days }),
            }),
        ),
    );
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('GithubHeatmap', () => {
    test('renders the combined total and both account labels', async () => {
        render(<GithubHeatmap />);
        expect(await screen.findByText('1,234')).toBeInTheDocument();
        expect(screen.getByText('@RetroHazard')).toBeInTheDocument();
        expect(screen.getByText('@BitMEX-abracken')).toBeInTheDocument();
        expect(fetch).toHaveBeenCalledWith('/data/contributions.json', expect.anything());
    });

    test('renders a calendar cell for every contribution day', async () => {
        const { container } = render(<GithubHeatmap />);
        await screen.findByText('1,234');
        const cells = container.querySelectorAll('.gh-grid .gh-cell');
        // 21 days, no leading pad (starts on a Sunday), padded to whole weeks
        expect(cells.length).toBe(21);
        // a day with contributions carries a descriptive tooltip
        const tipped = container.querySelector('.gh-grid .gh-cell[title*="contribution"]');
        expect(tipped).toBeTruthy();
    });

    test('renders nothing when the data cannot be fetched', async () => {
        fetch.mockImplementation(() => Promise.reject(new Error('offline')));
        const { container } = render(<GithubHeatmap />);
        // loading skeleton first, then nothing at all once the fetch fails
        await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
        expect(container.firstChild).toBeNull();
    });
});
