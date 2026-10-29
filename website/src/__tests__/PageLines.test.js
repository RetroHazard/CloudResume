import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Navigation from '../components/navbar';
import { lineColor, SectionShell } from '../components/ui/primitives';
import Home from '../pages/Home';
import Education from '../pages/Education';
import Experience from '../pages/Experience';
import Certifications from '../pages/Certifications';
import Projects from '../pages/Projects';
import Skills from '../pages/Skills';
import Contact from '../pages/Contact';

// Each page's board is painted in the line of its nav stop. The two are set in different
// files (the nav colours by position, the page by its `line` prop), so adding or
// reordering a stop can leave a page on another stop's colour without anything failing.
// SectionShell is stubbed so only the `line` each page passes is under test.
vi.mock('../components/ui/primitives', async (importOriginal) => ({
    ...(await importOriginal()),
    SectionShell: vi.fn(() => null),
}));
vi.mock('../components/visitor_count', () => ({ default: () => null }));
vi.mock('../utils/useJsonData', () => ({
    useJsonData: vi.fn(() => ({ data: {}, loading: false, error: null })),
    LoadingSkeleton: () => null,
}));
vi.mock('../utils/useVisitorId', () => ({ useVisitorId: () => 'test-visitor' }));

const PAGES = [
    ['Home', Home],
    ['Education', Education],
    ['Experience', Experience],
    ['Certifications', Certifications],
    ['Projects', Projects],
    ['Skills', Skills],
    ['Contact', Contact],
];

// jsdom reports inline colours as rgb(), so the expected hex goes through the same path.
function asRendered(color) {
    const probe = document.createElement('span');
    probe.style.borderColor = color;
    return probe.style.borderColor;
}

describe('page line colours', () => {
    test.each(PAGES)('the %s board matches its nav stop', (label, Page) => {
        render(
            <MemoryRouter>
                <Navigation />
            </MemoryRouter>,
        );
        const node = screen.getByRole('link', { name: label }).querySelector('span');

        SectionShell.mockClear();
        render(<Page />);
        expect(SectionShell).toHaveBeenCalledTimes(1);
        const { line = 0 } = SectionShell.mock.calls[0][0];

        expect(asRendered(lineColor(line))).toBe(node.style.borderColor);
    });
});
