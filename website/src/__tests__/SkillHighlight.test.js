import { render, screen } from '@testing-library/react';
import SkillHighlight from '../components/skill_highlight';

vi.mock('../utils/useJsonData', () => ({
    useJsonData: vi.fn(() => ({
        data: {
            core_skills: [
                { name: 'Skill A', category: 'Category A', logo: 'logos:skillA', website: 'https://example.com/skillA' },
                { name: 'Skill B', category: 'Category B', logo: 'logos:skillB', website: 'https://example.com/skillB' },
            ],
        },
        loading: false,
        error: null,
    })),
    LoadingSkeleton: () => null,
}));

describe('SkillHighlight', () => {
    test('renders skill names and links; no progress bars', () => {
        render(<SkillHighlight />);
        expect(screen.getByText('Skill A')).toBeInTheDocument();
        expect(screen.getByText('Category A')).toBeInTheDocument();
        expect(screen.getByText('Skill B')).toBeInTheDocument();
        expect(screen.queryAllByRole('progressbar')).toHaveLength(0);
        expect(screen.getByLabelText(/Skill A/i).closest('a')).toHaveAttribute('href', 'https://example.com/skillA');
    });
});
